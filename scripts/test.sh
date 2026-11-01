#!/bin/bash
# Builds the C# project and runs the UI tests. The C# code has no tests yet.
set -euo pipefail
source "$(dirname "$0")/common.sh"

dotnet build "$REPO_ROOT/backend" --configuration Release
cd "$REPO_ROOT/ui"
npm ci
npm test
