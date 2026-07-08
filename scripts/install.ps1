# ──────────────────────────────────────────
# leash-secrets installer — Windows PowerShell 5.1+
# ──────────────────────────────────────────

$ErrorActionPreference = "Stop"
$Version = "1.0.0"
$Repo = "FasterApiWeb/leash-secrets"
$Raw = "https://raw.githubusercontent.com/$Repo/main"

function Write-Banner {
    Write-Host ""
    Write-Host "  ┌─────────────────────────────────────┐" -ForegroundColor Cyan
    Write-Host "  │    🔒 leash-secrets installer v$Version   │" -ForegroundColor Cyan
    Write-Host "  │  keep your secrets on a leash       │" -ForegroundColor Cyan
    Write-Host "  └─────────────────────────────────────┘" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Info($msg)    { Write-Host "  → $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Fail($msg)    { Write-Host "  ✗ $msg" -ForegroundColor Red }

Write-Banner

function Install-CursorRule {
    $dir = "$env:USERPROFILE\.cursor\rules"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    try {
        Invoke-WebRequest -Uri "$Raw/.cursor/rules/leash-secrets.mdc" -OutFile "$dir\leash-secrets.mdc" -UseBasicParsing
        Write-Ok "Installed leash-secrets for Cursor → $dir\leash-secrets.mdc"
    } catch {
        Write-Fail "Could not install Cursor rule: $_"
    }
}

function Install-ClaudeSkill {
    $dir = "$env:USERPROFILE\.claude\skills"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    try {
        Invoke-WebRequest -Uri "$Raw/skills/leash-secrets.md" -OutFile "$dir\leash-secrets.md" -UseBasicParsing
        Write-Ok "Installed leash-secrets for Claude Code → $dir\leash-secrets.md"
    } catch {
        Write-Fail "Could not install Claude Code skill: $_"
    }
}

function Install-CopilotInstructions {
    $dir = ".github"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    try {
        Invoke-WebRequest -Uri "$Raw/.github/copilot-instructions.md" -OutFile "$dir\copilot-instructions.md" -UseBasicParsing
        Write-Ok "Installed leash-secrets for GitHub Copilot → $dir\copilot-instructions.md"
    } catch {
        Write-Fail "Could not install Copilot instructions: $_"
    }
}

Install-CursorRule
Install-ClaudeSkill
Install-CopilotInstructions

Write-Host ""
Write-Host "  leash-secrets installed." -ForegroundColor Green -NoNewline
Write-Host " Your secrets are on a leash."
Write-Host "  Type /leash-secrets in your agent to get started." -ForegroundColor Cyan
Write-Host ""
