#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the dev server in the background (if not already running)
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
  echo "Starting dev server..."
  nohup npm run dev > /tmp/gors-dev.log 2>&1 &
  echo "Dev server starting on http://localhost:3000"
else
  echo "Dev server already running on http://localhost:3000"
fi
