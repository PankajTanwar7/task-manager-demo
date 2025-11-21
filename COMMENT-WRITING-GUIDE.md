# Comment Writing Guide for GitHub Automation

## Overview

This guide explains how to write high-quality, detailed progress comments when using the `post-summary.sh` automation script. Well-written comments provide clear documentation of implementation progress and make it easier to understand what was done and why.

---

## Core Principles

### 1. Be Specific and Detailed
- Don't write one-sentence summaries
- Explain not just WHAT was done, but also WHY and HOW
- Include file names, function names, line numbers when relevant

### 2. Use Structured Format
- Break achievement into multiple paragraphs or bullet points
- Use headings or bold text to organize information
- Make it scannable and easy to read

### 3. Address Acceptance Criteria
- Reference specific acceptance criteria from the original issue
- Show progress through the requirements
- Use checkmarks (✅) to show what's complete

### 4. Include Context
- If fixing a bug, explain what the bug was
- If implementing a feature, explain the approach chosen
- Mention any trade-offs or design decisions

---

## The Two Parameters

### **USER_PROMPT** (What was requested)
- Be specific about the task
- Include context if it's a fix or iteration
- Reference issue number or previous discussion

**Examples:**

❌ Bad: `"Fix bug"`

✅ Good: `"Fix coverage timestamp check bug (Issue #13 - Response #2)"`

✅ Better: `"Address GitHub @claude's medium priority review issue - make path stripping repository-agnostic"`

---

### **ACHIEVEMENT** (What was accomplished)

This is where detail matters most. Use this structure:

```markdown
Brief one-line summary.

**What Was Done:**
- Specific change 1
- Specific change 2
- Specific change 3

**Why:**
- Reasoning or context
- Bug explanation
- Design decision rationale

**Files Modified:**
- file1.js (function X, lines Y-Z)
- file2.sh (added new function)

**Testing:**
- What tests were run
- Test results
- Verification steps

**Acceptance Criteria Addressed:**
- ✅ Criterion 1
- ✅ Criterion 2
- ⏳ Criterion 3 (in progress)

**Next Steps:**
- What remains to be done (if anything)
```

---

## Examples

### ❌ Bad Example 1: Too Brief

```bash
./post-summary.sh \
  "Implement coverage" \
  "Added coverage parsing to the script"
```

**Why it's bad:**
- One sentence achievement
- No details about what was actually done
- No mention of files, testing, or criteria
- Impossible to understand the implementation from this

---

### ✅ Good Example 1: First Implementation

```bash
./post-summary.sh \
  "Implement core test coverage reporting functionality (Issue #13)" \
  "Implemented the foundation for test coverage reporting in the automation system.

**What Was Built:**

1. **Created parse-coverage.sh helper script** (scripts/parse-coverage.sh)
   - parse_coverage_section() function to extract coverage data
   - Parses coverage/coverage-summary.json (Jest output format)
   - Three-level validation: file exists, valid JSON, recent timestamp
   - Graceful silent failure if coverage unavailable

2. **Integrated into post-summary.sh** (.claude/hooks/post-summary.sh)
   - Sources parse-coverage.sh helper
   - Calls parse_coverage_section for both Issue and PR comment formats
   - Coverage section inserted between 'Response' and 'Files Changed'
   - Uses collapsible <details> tag for consistency

3. **Updated package.json Jest configuration**
   - Added 'json-summary' to coverageReporters
   - Ensures coverage-summary.json is generated with --coverage flag

**How It Works:**
- Detects coverage/coverage-summary.json existence
- Extracts overall coverage % and per-file statistics
- Categorizes files as 'needing attention' (<80%) or 'well covered' (≥80%)
- Displays in structured markdown format

**Acceptance Criteria Addressed:**
- ✅ Parse coverage from coverage-summary.json
- ✅ Display overall coverage percentage
- ✅ List files below 80% threshold
- ✅ List files at/above 80% threshold
- ✅ Show detailed statistics (lines, statements, functions, branches)
- ✅ Use collapsible details tag
- ✅ Gracefully handle missing coverage

**Testing Done:**
- Ran: npm test -- --coverage
- Verified coverage-summary.json generated
- Tested parse_coverage_section function manually
- All 19 tests passing

**Next Steps:**
- Test coverage timestamp logic
- Implement trend tracking (compare with previous coverage)
- Update documentation with examples"
```

**Why it's good:**
- Clear structure with headings
- Specific file names and function names
- Explains what was built and how it works
- Lists acceptance criteria with checkmarks
- Includes testing information
- States next steps clearly

---

### ❌ Bad Example 2: Bug Fix (Too Vague)

```bash
./post-summary.sh \
  "Fix timestamp issue" \
  "Fixed the timestamp check logic"
```

**Why it's bad:**
- Doesn't explain what the bug was
- Doesn't explain how it was fixed
- No context or testing information
- Reader has no idea what changed

---

### ✅ Good Example 2: Bug Fix (Detailed)

```bash
./post-summary.sh \
  "Fix coverage timestamp check and path display" \
  "Fixed two issues identified during testing:

**Issue 1: Stale Coverage Detection Bug**

**Problem:**
Coverage file was always detected as 'stale' and skipped. The original logic compared coverage file timestamp with the first commit timestamp. Since coverage is typically generated BEFORE committing code, it would always be older than the commit.

**Root Cause:**
\`\`\`bash
# Original buggy logic (parse-coverage.sh:51-61)
FIRST_COMMIT_TIME=\$(git log main..HEAD --reverse --format=%ct | head -1)
COVERAGE_FILE_TIME=\$(stat -c %Y coverage/coverage-summary.json)

if [ \"\$COVERAGE_FILE_TIME\" -lt \"\$FIRST_COMMIT_TIME\" ]; then
  return 0  # Always returned here!
fi
\`\`\`

**Solution:**
Changed to age-based validation (24-hour window):
\`\`\`bash
# New logic
CURRENT_TIME=\$(date +%s)
AGE_SECONDS=\$((CURRENT_TIME - COVERAGE_FILE_TIME))
MAX_AGE_SECONDS=86400  # 24 hours

if [ \"\$AGE_SECONDS\" -gt \"\$MAX_AGE_SECONDS\" ]; then
  return 0  # Only skip if really old
fi
\`\`\`

This allows coverage from the current development session while preventing stale data from previous days.

**Issue 2: Path Stripping Verification**

Verified that path stripping works correctly:
- Absolute paths: /home/user/project/src/app.js → src/app.js
- Relative paths: ./src/app.js → src/app.js
- Already relative: src/app.js → src/app.js

**Files Modified:**
- scripts/parse-coverage.sh (lines 51-61: timestamp logic rewrite)

**Testing:**
- Regenerated coverage: npm test -- --coverage
- Manually tested parse_coverage_section function
- Verified output shows correct relative paths
- Coverage section now appears in comments

**Result:**
Coverage reporting now works as intended. The section displays with:
- 86.01% overall coverage
- 2 files needing attention (<80%)
- 6 well-covered files (≥80%)
- Full statistics for all metrics"
```

**Why it's good:**
- Clearly explains what the bug was
- Shows the problematic code
- Shows the solution with code examples
- Explains the reasoning (why this approach)
- Includes testing and verification
- Shows actual results

---

### ✅ Good Example 3: Review Fix

```bash
./post-summary.sh \
  "Fix medium priority review issue from GitHub @claude" \
  "Addressed path stripping logic issue identified in PR #15 code review.

**Review Issue:**
GitHub @claude flagged that path stripping regex was hardcoded to project name 'task-manager-demo', making the script not portable to forks or renamed repositories.

**Problem Code:**
\`\`\`bash
# Old: hardcoded project name (parse-coverage.sh:116, 128)
.key | sub(\"^\\\\./\"; \"\") | sub(\".*/task-manager-demo/\"; \"\")
\`\`\`

**Issue:**
- If repository forked as 'my-task-manager', paths wouldn't strip correctly
- Regex was project-specific, not repository-agnostic

**Solution Implemented:**

1. **Calculate PROJECT_ROOT dynamically** (parse-coverage.sh:42)
   \`\`\`bash
   local project_root=\"\$(cd \"\$(dirname \"\${BASH_SOURCE[0]}\")/.\" && pwd)\"
   \`\`\`

2. **Pass to jq as variable** (parse-coverage.sh:114, 125)
   \`\`\`bash
   jq -r --argjson threshold \"\$COVERAGE_THRESHOLD\" --arg root \"\$project_root/\" '
     (.key | sub(\"^\\\\./\"; \"\") | sub(\"^\\(\$root)\"; \"\"))
   ' \"\$COVERAGE_FILE\"
   \`\`\`

**Benefits:**
- Works with any repository name
- Portable to forks and renamed projects
- No configuration needed
- Automatically adapts to environment

**Files Modified:**
- scripts/parse-coverage.sh (3 locations: lines 42, 119, 131)

**Testing:**
- Ran parse_coverage_section manually
- Verified paths still display as relative (src/...)
- Coverage section formatting unchanged
- All 19 tests passing

**Review Status:**
Medium priority issue resolved. Script now repository-agnostic."
```

**Why it's good:**
- References the source of the feedback
- Explains the specific problem clearly
- Shows before and after code
- Explains the benefits of the fix
- Includes testing to prove it works

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Writing Like a Commit Message

```bash
./post-summary.sh "Update code" "feat: add coverage parsing"
```

**Why it's wrong:** GitHub comments are for humans to understand progress, not just Git history.

---

### ❌ Mistake 2: No Structure

```bash
./post-summary.sh \
  "Implement feature" \
  "I added the coverage parsing and integrated it into post-summary and also updated the package.json to add the json-summary reporter and tested it and it works now with all tests passing and coverage showing 86% overall"
```

**Why it's wrong:**
- One giant run-on sentence
- Hard to read
- No clear organization
- Important details buried

---

### ❌ Mistake 3: Missing Context

```bash
./post-summary.sh \
  "Fix bug" \
  "Changed the timestamp logic"
```

**Why it's wrong:**
- What bug?
- Why was it changed?
- What was wrong with the old logic?
- No reader can understand what happened

---

### ❌ Mistake 4: No Testing Information

```bash
./post-summary.sh \
  "Add new feature" \
  "Implemented coverage parsing with trend tracking and graceful handling"
```

**Why it's wrong:**
- How do we know it works?
- What testing was done?
- Are there any known issues?

---

## Templates

### Template 1: First Implementation

```bash
./post-summary.sh \
  "[Specific task description]" \
  "[One-line summary]

**What Was Built:**
1. [Component 1]
   - [Detail]
   - [Detail]
2. [Component 2]
   - [Detail]

**How It Works:**
[Brief explanation]

**Acceptance Criteria Addressed:**
- ✅ [Criterion 1]
- ✅ [Criterion 2]

**Files Modified:**
- [file1] ([what changed])
- [file2] ([what changed])

**Testing:**
- [Test 1]
- [Test 2]
- Results: [summary]

**Next Steps:**
- [Remaining work]"
```

---

### Template 2: Bug Fix

```bash
./post-summary.sh \
  "Fix [specific bug] in [component]" \
  "Fixed [bug description]

**Problem:**
[Explain what was wrong]

**Root Cause:**
[Why it happened]
\`\`\`
[Show problematic code if relevant]
\`\`\`

**Solution:**
[Explain the fix]
\`\`\`
[Show fixed code if relevant]
\`\`\`

**Files Modified:**
- [file:lines]

**Testing:**
- [How it was verified]
- [Test results]

**Result:**
[Final outcome]"
```

---

### Template 3: Review Response

```bash
./post-summary.sh \
  "Address [reviewer] feedback: [issue summary]" \
  "Addressed [specific feedback]

**Review Feedback:**
[Quote or summarize the review comment]

**Issue:**
[Explain the problem identified]

**Solution:**
[Explain how it was fixed]

**Files Modified:**
- [file:lines] ([change description])

**Testing:**
- [Verification steps]

**Review Status:**
[Issue resolved / Additional work needed]"
```

---

## Workflow-Specific Guidelines

### Before PR is Created (Issue Comments)

**Purpose:** Document implementation progress
**Audience:** You (future reference) and reviewers understanding the development journey

**Guidelines:**
- Explain each significant step
- Show incremental progress toward acceptance criteria
- Include testing and verification at each stage
- Note any blockers or decisions made

---

### After PR is Created (PR Comments)

**Purpose:** Document PR iterations and review responses
**Audience:** PR reviewers and future maintainers

**Guidelines:**
- Reference PR review comments if responding to feedback
- Explain why changes were made
- Show before/after for significant changes
- Keep quality as high as Issue comments

**IMPORTANT:** Once PR is created, `post-summary.sh` will ONLY post to the PR (not the Issue). This prevents duplicate comments.

---

## Quality Checklist

Before posting, ask yourself:

- [ ] Can someone understand what was done WITHOUT looking at the code?
- [ ] Did I explain WHY, not just WHAT?
- [ ] Did I include file names and function names?
- [ ] Did I mention testing and verification?
- [ ] Did I address acceptance criteria (if applicable)?
- [ ] Is the text structured and scannable?
- [ ] Would this comment be useful to me in 6 months?

If you can answer YES to all questions, your comment is probably good!

---

## Summary

**Remember:**
- **Be detailed** - One-sentence summaries are not enough
- **Be structured** - Use headings, bullets, code blocks
- **Be specific** - File names, line numbers, function names
- **Show testing** - How you verified it works
- **Explain why** - Context and reasoning matter

**Goal:** Anyone reading the comment should understand what was done, why it was done, and how to verify it works - WITHOUT needing to read the code.

---

**Good commenting makes good documentation!**
