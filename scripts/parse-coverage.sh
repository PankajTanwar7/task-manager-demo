#!/bin/bash

###############################################################################
# Parse Coverage Data
#
# Extracts test coverage information from Jest coverage files and formats
# it for GitHub comments.
#
# Usage:
#   source scripts/parse-coverage.sh
#   parse_coverage_section "$SESSION_FILE" "$COVERAGE_KEY" "$RESPONSE_NUM"
#
# Returns:
#   - Coverage section markdown (if coverage available)
#   - Empty string (if coverage unavailable)
#
# Configuration:
#   COVERAGE_THRESHOLD - Minimum coverage percentage (default: 80)
###############################################################################

# Configuration
COVERAGE_THRESHOLD=${COVERAGE_THRESHOLD:-80}
COVERAGE_FILE="coverage/coverage-summary.json"

###############################################################################
# Parse coverage data and generate markdown section
#
# Arguments:
#   $1 - Session file path (.claude/session-counter.json)
#   $2 - Coverage key (e.g., "coverage-issue-13")
#   $3 - Current response/update number
#
# Returns:
#   Coverage section markdown or empty string
###############################################################################
parse_coverage_section() {
  local session_file="$1"
  local coverage_key="$2"
  local current_num="$3"

  # Get project root for path stripping (repository-agnostic)
  local project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

  # Level 1: Check if coverage file exists
  if [ ! -f "$COVERAGE_FILE" ]; then
    return 0  # Silent skip
  fi

  # Level 2: Validate coverage file is valid JSON
  if ! jq empty "$COVERAGE_FILE" 2>/dev/null; then
    return 0  # Silent skip
  fi

  # Level 3: Check if coverage file is recent (not too old)
  # Allow coverage from current session (within last 24 hours)
  # On Linux: stat -c %Y, on macOS: stat -f %m
  COVERAGE_FILE_TIME=$(stat -c %Y "$COVERAGE_FILE" 2>/dev/null || stat -f %m "$COVERAGE_FILE" 2>/dev/null || echo 0)
  CURRENT_TIME=$(date +%s)
  AGE_SECONDS=$((CURRENT_TIME - COVERAGE_FILE_TIME))
  MAX_AGE_SECONDS=86400  # 24 hours

  if [ "$AGE_SECONDS" -gt "$MAX_AGE_SECONDS" ]; then
    return 0  # Coverage is too old (>24h), skip section
  fi

  # Extract overall coverage data
  local overall_lines=$(jq -r '.total.lines.pct // empty' "$COVERAGE_FILE" 2>/dev/null)
  local overall_statements=$(jq -r '.total.statements.pct // empty' "$COVERAGE_FILE" 2>/dev/null)
  local overall_functions=$(jq -r '.total.functions.pct // empty' "$COVERAGE_FILE" 2>/dev/null)
  local overall_branches=$(jq -r '.total.branches.pct // empty' "$COVERAGE_FILE" 2>/dev/null)

  # Get covered/total counts
  local lines_covered=$(jq -r '.total.lines.covered // 0' "$COVERAGE_FILE" 2>/dev/null)
  local lines_total=$(jq -r '.total.lines.total // 0' "$COVERAGE_FILE" 2>/dev/null)
  local statements_covered=$(jq -r '.total.statements.covered // 0' "$COVERAGE_FILE" 2>/dev/null)
  local statements_total=$(jq -r '.total.statements.total // 0' "$COVERAGE_FILE" 2>/dev/null)
  local functions_covered=$(jq -r '.total.functions.covered // 0' "$COVERAGE_FILE" 2>/dev/null)
  local functions_total=$(jq -r '.total.functions.total // 0' "$COVERAGE_FILE" 2>/dev/null)
  local branches_covered=$(jq -r '.total.branches.covered // 0' "$COVERAGE_FILE" 2>/dev/null)
  local branches_total=$(jq -r '.total.branches.total // 0' "$COVERAGE_FILE" 2>/dev/null)

  if [ -z "$overall_lines" ]; then
    return 0  # No valid data
  fi

  # Calculate trend (compare with previous response/update)
  local prev_num=$((current_num - 1))
  local trend_indicator=""

  if [ "$prev_num" -gt 0 ]; then
    local prev_coverage=$(jq -r ".[\"$coverage_key\"][\"response-$prev_num\"] // empty" "$session_file" 2>/dev/null)

    if [ -n "$prev_coverage" ]; then
      # Calculate difference using awk for better portability
      local diff=$(awk -v curr="$overall_lines" -v prev="$prev_coverage" 'BEGIN {printf "%.1f", curr - prev}')

      # Format trend indicator
      if awk -v diff="$diff" 'BEGIN {exit !(diff > 0)}'; then
        trend_indicator=" (+${diff}% from previous)"
      elif awk -v diff="$diff" 'BEGIN {exit !(diff < 0)}'; then
        trend_indicator=" (${diff}% from previous)"
      fi
    fi
  fi

  # Store current coverage for next iteration
  jq --arg key "$coverage_key" \
     --arg session "response-$current_num" \
     --argjson coverage "$overall_lines" \
     '.[$key][$session] = $coverage' \
     "$session_file" > "$session_file.tmp" && mv "$session_file.tmp" "$session_file"

  # Get files below threshold (limit to 10)
  local low_coverage_files=$(jq -r --argjson threshold "$COVERAGE_THRESHOLD" --arg root "$project_root/" '
    to_entries
    | map(select(.key != "total" and .value.lines.pct < $threshold))
    | sort_by(.value.lines.pct)
    | limit(10; .[])
    | "- `" + (.key | sub("^\\./"; "") | sub("^\($root)"; "")) + "` - " + (.value.lines.pct | tostring) + "%"
  ' "$COVERAGE_FILE" 2>/dev/null)

  local low_coverage_count=$(echo "$low_coverage_files" | grep -c '^-' || echo 0)

  # Get well-covered files (limit to 10)
  local high_coverage_files=$(jq -r --argjson threshold "$COVERAGE_THRESHOLD" --arg root "$project_root/" '
    to_entries
    | map(select(.key != "total" and .value.lines.pct >= $threshold))
    | sort_by(.value.lines.pct)
    | reverse
    | limit(10; .[])
    | "- `" + (.key | sub("^\\./"; "") | sub("^\($root)"; "")) + "` - " + (.value.lines.pct | tostring) + "%"
  ' "$COVERAGE_FILE" 2>/dev/null)

  local high_coverage_count=$(echo "$high_coverage_files" | grep -c '^-' || echo 0)

  # Build coverage section
  local coverage_section="### Test Coverage

<details>
<summary>${overall_lines}% overall coverage${trend_indicator}</summary>

"

  # Add low coverage files section
  if [ $low_coverage_count -gt 0 ]; then
    coverage_section="${coverage_section}**Files needing attention (<${COVERAGE_THRESHOLD}%):**
${low_coverage_files}

"
  fi

  # Add high coverage files section
  if [ $high_coverage_count -gt 0 ]; then
    coverage_section="${coverage_section}**Well covered (≥${COVERAGE_THRESHOLD}%):**
${high_coverage_files}

"
  fi

  # Add overall statistics
  coverage_section="${coverage_section}**Overall Statistics:**
- Lines: ${overall_lines}% (${lines_covered}/${lines_total})
- Statements: ${overall_statements}% (${statements_covered}/${statements_total})
- Functions: ${overall_functions}% (${functions_covered}/${functions_total})
- Branches: ${overall_branches}% (${branches_covered}/${branches_total})

</details>

---

"

  echo "$coverage_section"
}
