#!/bin/bash
# Usage: scripts/smoke.sh public|key-required
# Checks the live site and API. Stays under the API's rate limit.
set -uo pipefail
source "$(dirname "$0")/common.sh"

MODE="${1:-public}"
failures=0
headers=()

if [ "$MODE" = "key-required" ]; then
  key_id=$(aws apigateway get-api-keys --region "$REGION" --name-query wordchain --query 'items[0].id' --output text)
  key=$(aws apigateway get-api-key --region "$REGION" --api-key "$key_id" --include-value --query value --output text)
  headers=(-H "x-api-key: $key")
elif [ "$MODE" != "public" ]; then
  echo "Usage: $0 public|key-required" >&2
  exit 1
fi

check() {
  if [ "$2" = "$3" ]; then
    echo "PASS $1"
  else
    echo "FAIL $1: expected '$3', got '$2'"
    failures=$((failures + 1))
  fi
}

status() {
  curl -sS -m 20 -o /dev/null -w '%{http_code}' "$@"
}

query() {
  curl -sS -m 20 "${headers[@]}" "$API_URL?from=$1&to=$2"
  sleep 0.5
}

check "site" "$(status "$SITE_URL")" 200
check "preflight" "$(status -X OPTIONS -H "Origin: $SITE_URL" -H 'Access-Control-Request-Method: GET' "$API_URL")" 200
check "game over" "$(query game over)" '["game","dame","dams","dims","dies","dyes","eyes","eves","ever","over"]'
check "cold warm" "$(query cold warm)" '["cold","cord","word","ward","warm"]'
check "head tail" "$(query head tail)" '["head","heal","teal","tell","tall","tail"]'
check "lead gold" "$(query lead gold)" '["lead","load","goad","gold"]'
check "no chain" "$(query zzzz over)" '["No word chain found :("]'
check "cat dog" "$(query cat dog)" '["cat","cot","dot","dog"]'

if [ "$MODE" = "public" ]; then
  check "no key needed" "$(status "$API_URL?from=cat&to=dog")" 200
else
  check "key enforced" "$(status "$API_URL?from=cat&to=dog")" 403
fi
sleep 0.5
check "rejects bad input" "$(status "${headers[@]}" "$API_URL?from=c4t&to=dog")" 400

[ "$failures" -eq 0 ] && echo "All checks passed." || { echo "$failures check(s) failed."; exit 1; }
