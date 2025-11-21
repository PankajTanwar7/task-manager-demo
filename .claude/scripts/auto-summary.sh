#!/bin/bash

###############################################################################
# Automatic GitHub Comment Generator
#
# Generates high-quality GitHub comments from git context (no prompt capture!)
#
# Strategy (per @claude's recommendation):
#   - Extract work from git commits (what was done)
#   - Extract changes from git diff (how it was done)
#   - Extract requirements from GitHub issue (why it was done)
#   - Generate summary from this context (no LLM needed for MVP)
#
# Usage:
#   ./.claude/scripts/auto-summary.sh
#
# Called by: .git/hooks/post-commit (automatically after each commit)
#
# Benefits:
#   ✅ Works across session resumptions (git persists)
#   ✅ No stale data (git is always current)
#   ✅ No fragile JSON files to maintain
#   ✅ Zero manual input required
###############################################################################

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

###############################################################################
# Git Context Extraction
###############################################################################

extract_git_context() {
    local base_branch="${1:-main}"

    # Get current branch
    BRANCH=$(git branch --show-current 2>/dev/null || echo "")
    if [ -z "$BRANCH" ]; then
        print_error "Not on a branch"
        return 1
    fi

    # Extract issue/PR number from branch name
    ISSUE_NUM=$(echo "$BRANCH" | grep -oP '\d+' | head -1 || echo "")
    PR_NUM=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")

    if [ -z "$ISSUE_NUM" ] && [ -z "$PR_NUM" ]; then
        print_error "No issue or PR found for branch: $BRANCH"
        return 1
    fi

    # Get commit info
    LAST_COMMIT_MSG=$(git log -1 --format=%s)
    LAST_COMMIT_BODY=$(git log -1 --format=%b)
    ALL_COMMITS=$(git log ${base_branch}..HEAD --format="%h %s" 2>/dev/null | head -10)
    COMMIT_COUNT=$(echo "$ALL_COMMITS" | wc -l)

    # Get diff stats
    DIFF_STAT=$(git diff ${base_branch}..HEAD --stat 2>/dev/null | tail -1)
    FILES_CHANGED=$(git diff ${base_branch}..HEAD --name-only 2>/dev/null | wc -l)
    LATEST_FILES=$(git diff HEAD~1..HEAD --name-only 2>/dev/null || git diff --cached --name-only 2>/dev/null)
    LATEST_FILE_COUNT=$(echo "$LATEST_FILES" | grep -v '^$' | wc -l)

    print_success "Extracted git context"
}

###############################################################################
# GitHub Context Extraction
###############################################################################

extract_github_context() {
    local target_num="${1}"
    local target_type="${2}"  # "issue" or "pr"

    if [ "$target_type" = "pr" ]; then
        # Get PR info
        PR_TITLE=$(gh pr view "$target_num" --json title --jq .title 2>/dev/null || echo "")
        ISSUE_TITLE="$PR_TITLE"
    elif [ -n "$target_num" ]; then
        # Get issue info
        ISSUE_TITLE=$(gh issue view "$target_num" --json title --jq .title 2>/dev/null || echo "")
        ISSUE_BODY=$(gh issue view "$target_num" --json body --jq .body 2>/dev/null || echo "")
    fi

    print_success "Extracted GitHub context"
}

###############################################################################
# Summary Generation (Template-based for MVP)
###############################################################################

generate_summary() {
    local commit_msg="$1"
    local commit_body="$2"
    local files_count="$3"
    local diff_stat="$4"

    # Use commit message as main description
    SUMMARY="$commit_msg"

    # Add commit body if present
    if [ -n "$commit_body" ]; then
        SUMMARY="$SUMMARY

$commit_body"
    fi

    # Add file statistics
    SUMMARY="$SUMMARY

**Changes:** $diff_stat"

    print_success "Generated summary from git context"
}

###############################################################################
# Format GitHub Comment
###############################################################################

format_comment() {
    local target_type="${1}"  # "issue" or "pr"
    local response_num="${2}"

    local timestamp=$(date '+%Y-%m-%d %H:%M')

    if [ "$target_type" = "issue" ]; then
        COMMENT="## ClaudeCode Response #${response_num}

\`\`\`
Time: ${timestamp}
\`\`\`

---

### Changes Made

${SUMMARY}

---

### Files Changed in this Response

<details>
<summary>${LATEST_FILE_COUNT} files</summary>

"
        # Add file list
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                COMMENT="${COMMENT}- \`${file}\`
"
            fi
        done < <(echo "$LATEST_FILES")

        COMMENT="${COMMENT}
</details>

---

### All Commits in this Branch

\`\`\`
${ALL_COMMITS}
\`\`\`

---

**Status:** Work in progress

<sub>Response #${response_num} - Auto-generated from git context</sub>"

    else  # PR
        COMMENT="## ClaudeCode Update #${response_num}

\`\`\`
Time: ${timestamp}
\`\`\`

---

### Changes Made

${SUMMARY}

---

### Files Changed in this Update

<details>
<summary>${LATEST_FILE_COUNT} files</summary>

"
        # Add file list
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                COMMENT="${COMMENT}- \`${file}\`
"
            fi
        done < <(echo "$LATEST_FILES")

        COMMENT="${COMMENT}
</details>

---

### All Commits in this Branch

\`\`\`
${ALL_COMMITS}
\`\`\`

---

**Status:** Changes pushed and ready for review

<sub>Update #${response_num} - Auto-generated from git context</sub>

---

@claude review it"
    fi
}

###############################################################################
# Post to GitHub
###############################################################################

post_to_github() {
    local target_num="${1}"
    local target_type="${2}"
    local comment="${3}"

    # Get/update counter
    SESSION_FILE=".claude/session-counter.json"
    [ ! -f "$SESSION_FILE" ] && echo '{}' > "$SESSION_FILE"

    if [ "$target_type" = "pr" ]; then
        KEY="pr-${target_num}"
        COUNT=$(jq -r ".[\"$KEY\"] // 0" "$SESSION_FILE")
        COUNT=$((COUNT + 1))
        jq ".[\"$KEY\"] = $COUNT" "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"

        echo "$comment" | gh pr comment "$target_num" --body-file -
        print_success "Posted to PR #${target_num} (Update #${COUNT})"
    else
        KEY="issue-${target_num}"
        COUNT=$(jq -r ".[\"$KEY\"] // 0" "$SESSION_FILE")
        COUNT=$((COUNT + 1))
        jq ".[\"$KEY\"] = $COUNT" "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"

        echo "$comment" | gh issue comment "$target_num" --body-file -
        print_success "Posted to Issue #${target_num} (Response #${COUNT})"
    fi
}

###############################################################################
# Main Workflow
###############################################################################

main() {
    print_info "Auto-generating GitHub comment from git context..."

    # Extract context
    extract_git_context "main" || exit 1

    # Determine target (PR takes precedence)
    if [ -n "$PR_NUM" ]; then
        TARGET_NUM="$PR_NUM"
        TARGET_TYPE="pr"
        extract_github_context "$PR_NUM" "pr"
    elif [ -n "$ISSUE_NUM" ]; then
        TARGET_NUM="$ISSUE_NUM"
        TARGET_TYPE="issue"
        extract_github_context "$ISSUE_NUM" "issue"
    else
        print_error "No target found"
        exit 1
    fi

    # Generate summary
    generate_summary "$LAST_COMMIT_MSG" "$LAST_COMMIT_BODY" "$FILES_CHANGED" "$DIFF_STAT"

    # Get counter for formatting
    SESSION_FILE=".claude/session-counter.json"
    [ ! -f "$SESSION_FILE" ] && echo '{}' > "$SESSION_FILE"

    if [ "$TARGET_TYPE" = "pr" ]; then
        KEY="pr-${TARGET_NUM}"
        NEXT_COUNT=$(($(jq -r ".[\"$KEY\"] // 0" "$SESSION_FILE") + 1))
    else
        KEY="issue-${TARGET_NUM}"
        NEXT_COUNT=$(($(jq -r ".[\"$KEY\"] // 0" "$SESSION_FILE") + 1))
    fi

    # Format comment
    format_comment "$TARGET_TYPE" "$NEXT_COUNT"

    # Post to GitHub
    post_to_github "$TARGET_NUM" "$TARGET_TYPE" "$COMMENT"

    print_success "Done! Comment posted automatically from git context."
    echo ""
    echo "📝 Summary was generated from:"
    echo "   - Last commit message"
    echo "   - Files changed"
    echo "   - Diff statistics"
    echo ""
    echo "💡 Tip: Write clear commit messages for better auto-generated summaries!"
}

main "$@"
