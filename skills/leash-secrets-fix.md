# Leash Secrets Fix — Auto-Remediate Exposed Secrets

The user invoked `/leash-secrets-fix`. Automatically fix all detected secrets in the specified scope.

## Procedure

1. **Run a scan** (same as `/leash-secrets-scan`) to identify all secrets.

2. **For each CRITICAL or WARNING finding:**

   a. **Determine the environment variable name:**
      - Use the existing variable name if it follows convention (e.g., `OPENAI_API_KEY`)
      - Generate a name following `SERVICE_PURPOSE_TYPE` convention (e.g., `STRIPE_LIVE_SECRET_KEY`)
      - Check if the env var already exists in `.env.example` to avoid duplicates

   b. **Replace the hardcoded value** in the source code:
      - Python: `os.environ["VAR_NAME"]` or `os.getenv("VAR_NAME")`
      - JavaScript/TypeScript: `process.env.VAR_NAME`
      - Go: `os.Getenv("VAR_NAME")`
      - Ruby: `ENV["VAR_NAME"]` or `ENV.fetch("VAR_NAME")`
      - Java: `System.getenv("VAR_NAME")`
      - Rust: `std::env::var("VAR_NAME")`
      - PHP: `getenv('VAR_NAME')` or `$_ENV['VAR_NAME']`
      - Shell: `$VAR_NAME` or `${VAR_NAME}`
      - Docker: `ARG` or `--secret` mount
      - CI/CD YAML: `${{ secrets.VAR_NAME }}`

   c. **Add to `.env.example`** with a placeholder value and comment:
      ```
      # [Service] API key — get from [where to get it]
      VAR_NAME=your-value-here
      ```

   d. **Ensure `.gitignore`** contains `.env` entries.

3. **Add necessary imports** if they don't exist:
   - Python: `import os` (or `from dotenv import load_dotenv` if dotenv is in deps)
   - JavaScript: `require('dotenv').config()` or suggest installing `dotenv`
   - Go: `"os"` in imports

4. **Output the fix report:**

```
🔧 LEASH-SECRETS FIX REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fixed: [N] secrets in [M] files

[For each fix:]
  ✅ [file]:[line] — [SECRET_TYPE]
     Replaced with: [ENV_VAR_NAME]
     Added to: .env.example

[If .gitignore was updated:]
  ✅ Added .env entries to .gitignore

⚠️  IMPORTANT: Add real values to your .env file (not committed)
⚠️  ROTATE any secrets that were previously committed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Safety Rules

- NEVER create a `.env` file with real values — only `.env.example` with placeholders
- NEVER modify test files that intentionally use fake credentials for testing
- ALWAYS preserve the original code logic — only change the value source
- If unsure whether a value is a real secret, ask the user before fixing
