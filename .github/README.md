# GitHub Configuration

## Issue Templates

This repository uses custom issue templates for Feature Requests and Bug Reports.

**Important:** These templates are designed for **Claude Code CLI** workflow, NOT GitHub web integrations.

### How to Use

1. **Create Issue** using the template (Feature Request or Bug Report)
2. **DO NOT** tag `@claude` or any automation tools in the issue
3. **Run start script** to begin work: `./scripts/start-work.sh {issue-number}`
4. **Work with Claude Code** in your terminal
5. **Progress will be posted** to the issue automatically via scripts

### Why No @claude Tags?

- `@claude` mentions trigger GitHub's web integration
- This conflicts with our Claude Code CLI workflow
- We want manual control over when implementation starts
- Our automation handles posting updates to issues

### Templates Available

- **feature_request.md** - For new features
- **bug_report.md** - For bug fixes

Both templates guide you through the process without triggering unwanted automations.

---

## Configuration Files

- **claude.yml** - Disables automatic GitHub Claude responses
- **ISSUE_TEMPLATE/** - Custom issue templates

---

For complete workflow documentation, see:
- `COMPLETE-VISUAL-WORKFLOW.md`
- `FINAL-WORKFLOW.md`
