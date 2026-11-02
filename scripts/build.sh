#!/bin/bash
# Builds the Lambda package and the UI.
set -euo pipefail
source "$(dirname "$0")/common.sh"

cd "$REPO_ROOT/backend"
dotnet tool update -g Amazon.Lambda.Tools
"$HOME/.dotnet/tools/dotnet-lambda" package \
  --configuration Release --framework net10.0 --function-architecture arm64 \
  --output-package "$PACKAGE"

cd "$REPO_ROOT/ui"
npm ci
VITE_WORDCHAIN_API_URL="$API_URL" npm run build
