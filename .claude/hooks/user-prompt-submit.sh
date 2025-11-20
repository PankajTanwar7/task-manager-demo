#!/bin/bash

# Hook: user-prompt-submit
# Triggers: When user submits a prompt to Claude Code
# Purpose: Log all prompts to docs/dev-logs/ for tracking and documentation
#
# This hook is called with the following environment variables:
# - PROMPT: The user's prompt text
# - CWD: Current working directory
# - SESSION_ID: Unique session identifier

# Execute the prompt logger
node "$(dirname "$0")/prompt-logger.js" "$@"
