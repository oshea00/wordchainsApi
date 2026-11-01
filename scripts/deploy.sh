#!/bin/bash
# Usage: scripts/deploy.sh infra|api|ui|reopen
#   infra   Apply infra/template.yaml
#   api     Upload the built Lambda package and apply it through the stack
#   ui      Upload the built site and clear the CloudFront cache
#   reopen  Restore the API after the automatic shutoff
# Set TEMPLATE to use a different template file, and ALERT_EMAIL to set or
# change the shutoff address. Stack changes are shown before they are applied.
set -euo pipefail
source "$(dirname "$0")/common.sh"

TEMPLATE="${TEMPLATE:-$REPO_ROOT/infra/template.yaml}"

stack_resource() {
  aws cloudformation describe-stack-resource --region "$REGION" --stack-name "$STACK" \
    --logical-resource-id "$1" --query StackResourceDetail.PhysicalResourceId --output text
}

stack_has_parameter() {
  [ "$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
    --query "length(Stacks[0].Parameters[?ParameterKey=='$1'])" --output text)" = "1" ]
}

apply_stack() {
  local code_key="$1" name="deploy-$(date +%Y%m%d%H%M%S)"
  local params=() code_param email_param
  if [ -n "$code_key" ]; then
    code_param="ParameterKey=CodeS3Key,ParameterValue=$code_key"
  else
    code_param="ParameterKey=CodeS3Key,UsePreviousValue=true"
  fi
  params+=("$code_param")
  if grep -q '^  AlertEmail:' "$TEMPLATE"; then
    if [ -n "${ALERT_EMAIL:-}" ]; then
      email_param="ParameterKey=AlertEmail,ParameterValue=$ALERT_EMAIL"
    elif stack_has_parameter AlertEmail; then
      email_param="ParameterKey=AlertEmail,UsePreviousValue=true"
    else
      echo "ERROR: set ALERT_EMAIL for the first deployment." >&2
      exit 1
    fi
    params+=("$email_param")
  fi

  aws cloudformation create-change-set --region "$REGION" --stack-name "$STACK" \
    --change-set-name "$name" --template-body "file://$TEMPLATE" \
    --capabilities CAPABILITY_NAMED_IAM --parameters "${params[@]}" >/dev/null
  if ! aws cloudformation wait change-set-create-complete --region "$REGION" \
    --stack-name "$STACK" --change-set-name "$name"; then
    aws cloudformation describe-change-set --region "$REGION" --stack-name "$STACK" \
      --change-set-name "$name" --query StatusReason --output text
    aws cloudformation delete-change-set --region "$REGION" --stack-name "$STACK" \
      --change-set-name "$name"
    exit 1
  fi

  aws cloudformation describe-change-set --region "$REGION" --stack-name "$STACK" \
    --change-set-name "$name" --output table \
    --query 'Changes[].ResourceChange.{Action:Action,Resource:LogicalResourceId,Type:ResourceType,Replace:Replacement}'
  read -r -p "Apply these changes? [y/N] " answer
  if [ "$answer" != "y" ]; then
    aws cloudformation delete-change-set --region "$REGION" --stack-name "$STACK" \
      --change-set-name "$name"
    echo "Cancelled. Nothing changed."
    exit 1
  fi
  aws cloudformation execute-change-set --region "$REGION" --stack-name "$STACK" \
    --change-set-name "$name"
  aws cloudformation wait stack-update-complete --region "$REGION" --stack-name "$STACK"
  echo "Stack updated."
}

deploy_api() {
  [ -f "$PACKAGE" ] || { echo "ERROR: run scripts/build.sh first." >&2; exit 1; }
  local bucket key
  bucket=$(stack_resource ServerlessDeploymentBucket)
  key="code/$(sha256sum "$PACKAGE" | cut -d' ' -f1).zip"
  aws s3 cp "$PACKAGE" "s3://$bucket/$key" --only-show-errors
  apply_stack "$key"
}

deploy_ui() {
  [ -f "$REPO_ROOT/ui/dist/index.html" ] || { echo "ERROR: run scripts/build.sh first." >&2; exit 1; }
  local bucket distribution
  bucket=$(stack_resource SiteBucket)
  distribution=$(stack_resource SiteDistribution)
  aws s3 sync "$REPO_ROOT/ui/dist" "s3://$bucket" --delete --only-show-errors
  aws cloudfront create-invalidation --distribution-id "$distribution" --paths '/*' \
    --query Invalidation.Id --output text
  echo "Site uploaded."
}

reopen() {
  aws apigateway update-stage --region "$REGION" --rest-api-id "$REST_API_ID" --stage-name "$STAGE" \
    --patch-operations "op=replace,path=/*/*/throttling/rateLimit,value=$RATE_LIMIT" \
                       "op=replace,path=/*/*/throttling/burstLimit,value=$BURST_LIMIT" >/dev/null
  aws lambda put-function-concurrency --region "$REGION" --function-name "$FUNCTION" \
    --reserved-concurrent-executions "$RESERVED_CONCURRENCY" >/dev/null
  # Without this the alarm stays in ALARM and would not fire again.
  aws cloudwatch set-alarm-state --region "$REGION" --alarm-name "$ALARM" \
    --state-value OK --state-reason "Reopened by scripts/deploy.sh"
  echo "API reopened."
}

case "${1:-}" in
  infra) apply_stack "" ;;
  api) deploy_api ;;
  ui) deploy_ui ;;
  reopen) reopen ;;
  *) echo "Usage: $0 infra|api|ui|reopen" >&2; exit 1 ;;
esac
