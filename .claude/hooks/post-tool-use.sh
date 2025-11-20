#!/bin/bash

# Hook: post-tool-use
# Triggers: After each tool execution
# Purpose: Post GitHub comments (Issue + PR) summarizing Claude Code sessions

# Execute the GitHub commenter
node "$(dirname "$0")/github-commenter.js" "$@"
