.PHONY: help test validate scan lint docs docs-serve clean install publish vscode-package vscode-publish

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────────────

test: ## Run all tests (pattern validation + regex tests)
	@node scripts/check-patterns.js
	@node tests/test-patterns.js

validate: ## Validate pattern files against schema
	@node scripts/check-patterns.js

scan: ## Scan current directory for secrets
	@node bin/leash-secrets.js scan .

scan-verbose: ## Scan with detailed risk information
	@node bin/leash-secrets.js scan . --verbose

scan-json: ## Scan and output JSON
	@node bin/leash-secrets.js scan . --json

lint: ## Check shell scripts for syntax errors
	@bash -n scripts/install.sh
	@bash -n hooks/pre-commit.sh
	@echo "Shell scripts OK"

# ── Documentation ────────────────────────────────────

docs: ## Build MkDocs site to site/
	@pip install -q -r requirements.txt 2>/dev/null || true
	@mkdocs build

docs-serve: ## Serve docs locally at http://127.0.0.1:8000
	@pip install -q -r requirements.txt 2>/dev/null || true
	@mkdocs serve

# ── Release ──────────────────────────────────────────

publish: test ## Publish to npm (requires NPM_TOKEN)
	npm publish --access public

vscode-package: ## Package VS Code extension (.vsix)
	npm run package-extension

vscode-install: vscode-package ## Install VS Code extension locally
	code --install-extension vscode-extension/leash-secrets-vscode-*.vsix

vscode-publish: ## Publish VS Code extension (requires VSCE_PAT)
	cd vscode-extension && npm run publish

# ── Setup ────────────────────────────────────────────

install: ## Install leash-secrets for all agents on this machine
	@bash scripts/install.sh

install-hooks: ## Install git pre-commit hook for this repo
	@cp hooks/pre-commit.sh .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "Pre-commit hook installed"

uninstall: ## Uninstall leash-secrets from all agents
	@bash scripts/install.sh --uninstall

# ── Cleanup ──────────────────────────────────────────

clean: ## Remove build artifacts
	@rm -rf site/ dist/ coverage/ *.tgz
	@rm -f vscode-extension/*.vsix
	@rm -rf vscode-extension/patterns
	@echo "Cleaned"
