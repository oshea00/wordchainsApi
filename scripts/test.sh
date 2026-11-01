#!/bin/bash
# Runs the C# and UI tests.
set -euo pipefail
source "$(dirname "$0")/common.sh"

dotnet test "$REPO_ROOT/tests/backend" --configuration Release
cd "$REPO_ROOT/ui"
npm ci
npm test
