#!/bin/bash

# Hook: post-tool-use
# Triggers: After each tool execution
# Purpose: Post PR comments summarizing Claude Code sessions

# Execute the PR commenter
node "$(dirname "$0")/pr-commenter.js" "$@"
