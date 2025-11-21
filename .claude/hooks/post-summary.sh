#!/bin/bash

###############################################################################
# Post Summary to GitHub
#
# Posts formatted comments to Issues (work progress) and PRs (updates)
#
# Usage (option 1 - Interactive):
#   ./.claude/hooks/post-summary.sh
#
# Usage (option 2 - With arguments):
#   ./.claude/hooks/post-summary.sh \
#     "Your prompt: Add JSDoc comments" \
#     "Achievement: Added docs to 9 files, 460+ lines, all tests passing"
#
# Format:
#   - Issue comments: "Response #N" (work-in-progress updates)
#   - PR comments: "Update #N" (PR iteration updates)
#
# Posting Rules:
#   - If PR exists: Posts to PR ONLY (PR takes precedence)
#   - If no PR: Posts to Issue
#   - Never posts to both Issue and PR simultaneously
#
# Enable/Disable:
#   - To disable: export DISABLE_AUTO_COMMENT=true
#   - To enable: unset DISABLE_AUTO_COMMENT (or export DISABLE_AUTO_COMMENT=false)
#
# Writing Good Summaries:
#   See COMMENT-WRITING-GUIDE.md for detailed guidelines and examples
#
#   Quick Tips:
#   - USER_PROMPT: Be specific, include context
#   - ACHIEVEMENT: Use structured format with multiple paragraphs
#     * Explain WHAT was done (specific changes)
#     * Explain WHY it was done (reasoning, bugs fixed)
#     * List files/functions modified
#     * Mention testing done
#     * Note acceptance criteria addressed
#     * Include next steps if work continues
#
#   Bad Example:  "Fixed bug"
#   Good Example: "Fixed coverage timestamp bug that caused stale detection.
#                  Changed from commit-based to age-based check (24h window).
#                  Modified parse-coverage.sh:54-61. Tested with npm test."
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source coverage parsing helper
source "$PROJECT_ROOT/scripts/parse-coverage.sh"

# Check if auto-commenting is disabled
if [ "$DISABLE_AUTO_COMMENT" = "true" ]; then
  echo "ℹ️  Auto-commenting is disabled (DISABLE_AUTO_COMMENT=true)"
  echo "To enable: unset DISABLE_AUTO_COMMENT"
  exit 0
fi

# Get branch info
BRANCH=$(git branch --show-current 2>/dev/null || echo "")
ISSUE_NUM=$(echo "$BRANCH" | grep -oP '(?:feature|fix|issue|refactor|chore)/(\d+)' | grep -oP '\d+' || echo "")
PR_NUM=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -z "$ISSUE_NUM" ] && [ -z "$PR_NUM" ]; then
  echo "❌ No issue or PR found"
  exit 1
fi

# Get user input
if [ -n "$1" ]; then
  USER_PROMPT="$1"
  ACHIEVEMENT="$2"
else
  echo "What did you ask Claude to do?"
  read -r USER_PROMPT
  echo "What was achieved?"
  read -r ACHIEVEMENT
fi

# Get commits and files
BASE_BRANCH="main"
COMMITS=$(git log --oneline ${BASE_BRANCH}..HEAD 2>/dev/null | head -10)
COMMIT_COUNT=$(echo "$COMMITS" | wc -l)
CHANGED_FILES=$(git diff --name-only ${BASE_BRANCH}...HEAD 2>/dev/null)
FILE_COUNT=$(echo "$CHANGED_FILES" | grep -v '^$' | wc -l)

# Timing
FIRST_COMMIT=$(git log ${BASE_BRANCH}..HEAD --reverse --format=%ct 2>/dev/null | head -1)
LAST_COMMIT=$(git log -1 --format=%ct)
if [ -n "$FIRST_COMMIT" ]; then
  DURATION=$(( (LAST_COMMIT - FIRST_COMMIT) / 60 ))
  DURATION_STR="${DURATION}m"
else
  DURATION_STR="30m"
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Response/Update number tracking
SESSION_FILE="$SCRIPT_DIR/../session-counter.json"
[ ! -f "$SESSION_FILE" ] && echo '{}' > "$SESSION_FILE"

# Separate counters for Issue and PR
ISSUE_KEY="issue-${ISSUE_NUM}"
PR_KEY="pr-${PR_NUM}"

# Build Issue comment (if issue exists)
if [ -n "$ISSUE_NUM" ]; then
  ISSUE_RESPONSE_NUM=$(jq -r ".[\"$ISSUE_KEY\"] // 0" "$SESSION_FILE")
  ISSUE_RESPONSE_NUM=$((ISSUE_RESPONSE_NUM + 1))
  jq ".[\"$ISSUE_KEY\"] = $ISSUE_RESPONSE_NUM" "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"

  ISSUE_COMMENT="## ClaudeCode Response #${ISSUE_RESPONSE_NUM}

\`\`\`
Time: ${TIMESTAMP}
\`\`\`

---

### Request

${USER_PROMPT}

---

### Response

${ACHIEVEMENT}

---

"

  # Add coverage section if available
  COVERAGE_KEY="coverage-issue-${ISSUE_NUM}"
  COVERAGE_SECTION=$(parse_coverage_section "$SESSION_FILE" "$COVERAGE_KEY" "$ISSUE_RESPONSE_NUM")
  [ -n "$COVERAGE_SECTION" ] && ISSUE_COMMENT="${ISSUE_COMMENT}${COVERAGE_SECTION}"

  ISSUE_COMMENT="${ISSUE_COMMENT}### Files Changed in this Branch

<details>
<summary>Total: ${FILE_COUNT} files</summary>

"

  # Add files to issue comment (avoid subshell by not using pipe)
  if [ $FILE_COUNT -gt 0 ]; then
    while IFS= read -r file; do
      if [ -n "$file" ]; then
        ISSUE_COMMENT="${ISSUE_COMMENT}- \`${file}\`
"
      fi
    done < <(echo "$CHANGED_FILES" | head -15)

    if [ $FILE_COUNT -gt 15 ]; then
      ISSUE_COMMENT="${ISSUE_COMMENT}
... and $((FILE_COUNT - 15)) more files"
    fi
  fi

  ISSUE_COMMENT="${ISSUE_COMMENT}

</details>

---

### Commits in this Branch

\`\`\`
${COMMITS}
\`\`\`

---

**Status:** Implementation completed and committed locally (not pushed yet)

<sub>Response #${ISSUE_RESPONSE_NUM} - Auto-generated by ClaudeCode</sub>
"
fi

# Build PR comment (if PR exists)
if [ -n "$PR_NUM" ]; then
  PR_UPDATE_NUM=$(jq -r ".[\"$PR_KEY\"] // 0" "$SESSION_FILE")
  PR_UPDATE_NUM=$((PR_UPDATE_NUM + 1))
  jq ".[\"$PR_KEY\"] = $PR_UPDATE_NUM" "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"

  PR_COMMENT="## ClaudeCode Update #${PR_UPDATE_NUM}

\`\`\`
Time: ${TIMESTAMP}
\`\`\`

---

### Request

${USER_PROMPT}

---

### Changes Made

${ACHIEVEMENT}

---

"

  # Add coverage section if available
  COVERAGE_KEY="coverage-pr-${PR_NUM}"
  COVERAGE_SECTION=$(parse_coverage_section "$SESSION_FILE" "$COVERAGE_KEY" "$PR_UPDATE_NUM")
  [ -n "$COVERAGE_SECTION" ] && PR_COMMENT="${PR_COMMENT}${COVERAGE_SECTION}"

  PR_COMMENT="${PR_COMMENT}### Files Changed in this Branch

<details>
<summary>Total: ${FILE_COUNT} files</summary>

"

  # Add files to PR comment (avoid subshell by not using pipe)
  if [ $FILE_COUNT -gt 0 ]; then
    while IFS= read -r file; do
      if [ -n "$file" ]; then
        PR_COMMENT="${PR_COMMENT}- \`${file}\`
"
      fi
    done < <(echo "$CHANGED_FILES" | head -15)

    if [ $FILE_COUNT -gt 15 ]; then
      PR_COMMENT="${PR_COMMENT}
... and $((FILE_COUNT - 15)) more files"
    fi
  fi

  PR_COMMENT="${PR_COMMENT}

</details>

---

### All Commits in this Branch

\`\`\`
${COMMITS}
\`\`\`

---

**Status:** Changes pushed to PR and ready for review

<sub>Update #${PR_UPDATE_NUM} - Auto-generated by ClaudeCode</sub>
"
fi

# Post comments - PR takes precedence over Issue
# Once a PR is created, all updates go to PR only (not both)
if [ -n "$PR_NUM" ]; then
  echo "$PR_COMMENT" | gh pr comment "$PR_NUM" --body-file - && \
    echo "✓ Posted to PR #${PR_NUM} (Update #${PR_UPDATE_NUM})"
elif [ -n "$ISSUE_NUM" ]; then
  echo "$ISSUE_COMMENT" | gh issue comment "$ISSUE_NUM" --body-file - && \
    echo "✓ Posted to Issue #${ISSUE_NUM} (Response #${ISSUE_RESPONSE_NUM})"
else
  echo "❌ No issue or PR found to post to"
  exit 1
fi

echo "✅ Done!"
