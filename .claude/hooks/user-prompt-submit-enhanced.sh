#!/bin/bash

# Hook: user-prompt-submit (enhanced)
# Triggers: When user submits a prompt to Claude Code
# Purpose:
#   1. Log prompts to docs/dev-logs/
#   2. Track session for PR commenting

# Read stdin once and pass to both hooks
input=$(cat)

# Execute prompt logger
echo "$input" | node "$(dirname "$0")/prompt-logger.js"

# Execute PR commenter (to track prompt)
echo "$input" | node "$(dirname "$0")/pr-commenter.js"
