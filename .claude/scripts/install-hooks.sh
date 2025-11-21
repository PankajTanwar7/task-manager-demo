#!/bin/bash

###############################################################################
# Hook Installation Script
#
# Installs git hooks for automated GitHub comment posting
#
# Usage:
#   ./.claude/scripts/install-hooks.sh
#
# What it does:
#   - Copies post-commit hook from templates to .git/hooks/
#   - Makes hook executable
#   - Verifies installation
###############################################################################

set -euo pipefail
IFS=$'\n\t'

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

print_info "Installing git hooks..."

# Check if template exists
TEMPLATE="$PROJECT_ROOT/.claude/hooks/templates/post-commit"
if [ ! -f "$TEMPLATE" ]; then
    print_error "Template not found: $TEMPLATE"
    exit 1
fi

# Copy to .git/hooks/
TARGET="$PROJECT_ROOT/.git/hooks/post-commit"
cp "$TEMPLATE" "$TARGET"
chmod +x "$TARGET"

print_success "Installed: .git/hooks/post-commit"

# Verify
if [ -x "$TARGET" ]; then
    print_success "Hook is executable"
else
    print_error "Hook is not executable"
    exit 1
fi

echo ""
print_success "Installation complete!"
echo ""
echo "The post-commit hook will now run automatically after every commit."
echo "It will post progress updates to GitHub issues/PRs."
echo ""
echo "To disable: export DISABLE_AUTO_COMMENT=true"
echo "To re-enable: unset DISABLE_AUTO_COMMENT"
