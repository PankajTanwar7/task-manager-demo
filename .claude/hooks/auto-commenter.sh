#!/bin/bash

###############################################################################
# Auto GitHub Commenter
#
# This script automatically posts session summaries to GitHub Issues and PRs
# WITHOUT relying on Claude Code hooks (which aren't firing).
#
# Usage:
#   Run this manually after completing a task:
#   ./.claude/hooks/auto-commenter.sh "Your request description here"
#
# Or add to git commit hooks (see below)
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Get branch info
BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$BRANCH" ]; then
  echo "❌ Not in a git repository"
  exit 1
fi

# Extract issue number from branch name
ISSUE_NUM=$(echo "$BRANCH" | grep -oP '(?:feature|fix|issue|refactor|chore)/(\d+)' | grep -oP '\d+' || echo "")

# Get PR number if exists
PR_NUM=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -z "$ISSUE_NUM" ] && [ -z "$PR_NUM" ]; then
  echo "❌ No issue or PR found for branch: $BRANCH"
  echo "Branch should be named like: feature/123-description or issue/123"
  exit 1
fi

echo "✓ Found: Branch=$BRANCH, Issue=${ISSUE_NUM:-none}, PR=${PR_NUM:-none}"

# Get user's request (from argument or prompt)
if [ -n "$1" ]; then
  USER_REQUEST="$1"
else
  echo ""
  echo "Enter your task description (what you asked Claude to do):"
  read -r USER_REQUEST
fi

# Get last commit info
LAST_COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "")
LAST_COMMIT_HASH=$(git log -1 --pretty=format:"%h" 2>/dev/null || echo "")

# Get changed files
CHANGED_FILES=$(git diff --name-only HEAD~1..HEAD 2>/dev/null || git diff --name-only --cached 2>/dev/null || echo "")
FILE_COUNT=$(echo "$CHANGED_FILES" | grep -v '^$' | wc -l)

# Calculate session duration (estimate)
START_TIME=$(git log -1 --format=%ct HEAD~1 2>/dev/null || date +%s)
END_TIME=$(git log -1 --format=%ct 2>/dev/null || date +%s)
DURATION=$((END_TIME - START_TIME))
if [ $DURATION -lt 60 ]; then
  DURATION_STR="${DURATION}s"
elif [ $DURATION -lt 3600 ]; then
  DURATION_STR="$((DURATION / 60))m"
else
  DURATION_STR="$((DURATION / 3600))h $((DURATION % 3600 / 60))m"
fi

# Get session number
SESSION_COUNTER_FILE="$SCRIPT_DIR/../session-counter.json"
if [ ! -f "$SESSION_COUNTER_FILE" ]; then
  echo '{}' > "$SESSION_COUNTER_FILE"
fi

SESSION_KEY="${PR_NUM:+pr-}${PR_NUM}${ISSUE_NUM:+issue-}${ISSUE_NUM}"
SESSION_NUM=$(jq -r ".[\"$SESSION_KEY\"] // 0" "$SESSION_COUNTER_FILE")
SESSION_NUM=$((SESSION_NUM + 1))

# Update counter
TMP_FILE=$(mktemp)
jq ".[\"$SESSION_KEY\"] = $SESSION_NUM" "$SESSION_COUNTER_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$SESSION_COUNTER_FILE"

# Generate timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo ""
echo "Generating comment for Session #$SESSION_NUM..."

# Create file list
FILE_LIST=""
if [ -n "$CHANGED_FILES" ]; then
  while IFS= read -r file; do
    [ -n "$file" ] && FILE_LIST="${FILE_LIST}- \`${file}\`\n"
  done <<< "$CHANGED_FILES"
fi

# Post to Issue (if exists)
if [ -n "$ISSUE_NUM" ]; then
  ISSUE_COMMENT="## 💻 Claude Code Session $SESSION_NUM

**Time:** $TIMESTAMP | **Duration:** $DURATION_STR

### 📝 Your Request
\`\`\`
$USER_REQUEST
\`\`\`

### 🎯 What Was Accomplished

Commit: \`$LAST_COMMIT_HASH\` - $LAST_COMMIT_MSG

### 📁 Files Changed ($FILE_COUNT files)

$FILE_LIST

### 📊 Summary

- **Files changed:** $FILE_COUNT
- **Duration:** $DURATION_STR
- **Commit:** \`$LAST_COMMIT_HASH\`

---
*🤖 Automated update from Claude Code (manual trigger)*
"

  # Post comment
  echo "$ISSUE_COMMENT" | gh issue comment "$ISSUE_NUM" --body-file - 2>&1 && \
    echo "✓ Posted Session $SESSION_NUM to Issue #$ISSUE_NUM" || \
    echo "❌ Failed to post to Issue #$ISSUE_NUM"
fi

# Post to PR (if exists)
if [ -n "$PR_NUM" ]; then
  PR_COMMENT="## 🔄 Iteration $SESSION_NUM

**Time:** $TIMESTAMP ($DURATION_STR)

### 📝 Request
\`\`\`
$USER_REQUEST
\`\`\`

### ✅ What Was Done

**Commit:** \`$LAST_COMMIT_HASH\` - $LAST_COMMIT_MSG

**Files Modified ($FILE_COUNT):**
$FILE_LIST

---
*Session $SESSION_NUM • Auto-generated (manual trigger)*
"

  # Post comment
  echo "$PR_COMMENT" | gh pr comment "$PR_NUM" --body-file - 2>&1 && \
    echo "✓ Posted Iteration $SESSION_NUM to PR #$PR_NUM" || \
    echo "❌ Failed to post to PR #$PR_NUM"
fi

echo ""
echo "✅ Done! Session #$SESSION_NUM logged to GitHub"
[ -n "$ISSUE_NUM" ] && echo "   Issue: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues/$ISSUE_NUM"
[ -n "$PR_NUM" ] && echo "   PR: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pull/$PR_NUM"
