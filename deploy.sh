#!/bin/bash
# Uploads the package built by build.sh to the live Lambda function.
set -euo pipefail

REGION="us-west-2"
FUNCTION="limpid-wordchains-backend-dev-get-wordchain"
PACKAGE="bin/Release/net10.0/wordchain.zip"

if [ ! -f "$PACKAGE" ]; then
  echo "ERROR: $PACKAGE not found. Run build.sh first." >&2
  exit 1
fi

aws lambda update-function-code \
  --region "$REGION" \
  --function-name "$FUNCTION" \
  --zip-file "fileb://$PACKAGE" \
  --query '[Runtime,CodeSize]' \
  --output text

aws lambda wait function-updated-v2 --region "$REGION" --function-name "$FUNCTION"
echo "Deployed $PACKAGE to $FUNCTION."
