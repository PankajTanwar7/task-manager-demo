#!/bin/bash

# Hook: user-prompt-submit (enhanced)
# Triggers: When user submits a prompt to Claude Code
# Purpose:
#   1. Log prompts to docs/dev-logs/ (for senior)
#   2. Track session for GitHub commenting (Issue + PR)

# Read stdin once and pass to both hooks
input=$(cat)

# Execute prompt logger (local files)
echo "$input" | node "$(dirname "$0")/prompt-logger.js"

# Execute GitHub commenter (Issue + PR comments)
echo "$input" | node "$(dirname "$0")/github-commenter.js"
