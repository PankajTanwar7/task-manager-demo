---
name: Feature Implementation
about: Use this template for new features (works with @claude + Claude Code workflow)
title: "[FEATURE] "
labels: feature, planning
assignees: ''
---

## 📋 Feature Description
<!-- Clear description of what needs to be built -->



## 🎯 Acceptance Criteria
<!-- What defines "done" for this feature? -->
- [ ]
- [ ]
- [ ]

## 🏗️ Architecture Discussion (@claude)
<!-- Tag @claude here to discuss implementation approach -->

@claude Please help design the architecture for this feature:

**Questions:**
1.
2.
3.

**Constraints:**
- Tech stack:
- Performance requirements:
- Security considerations:

## 📁 Affected Files (Estimated)
<!-- List files that will likely need changes -->
- `path/to/file1.js`
- `path/to/file2.js`

## 🔗 Related Issues/PRs
<!-- Link related issues or PRs -->
- Related to #
- Depends on #

## 📝 Implementation Notes
<!-- @claude will update this section with architecture recommendations -->
<!-- This section will be referenced by Claude Code during implementation -->

---

## ✅ Workflow Checklist

### Phase 1: Planning (This Issue - GitHub @claude)
- [ ] Discuss architecture with @claude
- [ ] Break down into subtasks if needed
- [ ] Identify all files to modify
- [ ] Get team approval on approach

### Phase 2: Implementation (Claude Code)
- [ ] Create branch: `feature/{issue-number}-{short-name}`
- [ ] Implement using Claude Code (auto-logs to `docs/dev-logs/`)
- [ ] Write/update tests
- [ ] Local testing complete

### Phase 3: Review & Merge
- [ ] Create PR with reference to this issue
- [ ] Code review with @claude (optional)
- [ ] Team approval
- [ ] Merge & auto-close issue

---

**🤖 Claude Code Prompt Template:**
```
Implement feature from GitHub issue #{issue-number}.

Context from @claude discussion:
[Copy key points from architecture discussion above]

Files to modify:
[Copy from "Affected Files" section]

Requirements:
[Copy from "Acceptance Criteria"]

Please implement with tests and commit with proper message.
```
