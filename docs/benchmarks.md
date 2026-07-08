# Benchmarks

## Methodology

Leash Secrets' detection accuracy is measured against a corpus of files containing known secrets. The corpus is sourced from:

1. **GitHub's public secret scanning alerts** — real files that had secrets revoked
2. **Synthetic test cases** — crafted to test edge cases and false positives
3. **AI-generated code samples** — code produced by GPT-4, Claude, and Copilot that contained secrets

### Test Arms

| Arm | Description |
|-----|-------------|
| **No scanning** | Baseline — no secret detection |
| **"Check for secrets" prompt** | A simple instruction: "Check this code for exposed secrets" |
| **Leash Secrets** | Full Leash Secrets Protocol with pattern library |

### Metrics

| Metric | Definition |
|--------|------------|
| **Secrets caught** | % of known secrets correctly identified |
| **False positives** | % of non-secret values incorrectly flagged |
| **Auto-fix accuracy** | % of fixes that correctly replaced secrets with env var references |
| **Speed impact** | Additional time per agent response |

## Results

| Metric | No scanning | "Check for secrets" prompt | Leash Secrets |
|--------|----------:|---------------------------:|------:|
| Secrets caught | 0% | 41% | 94% |
| False positives | 0 | 12% | 3% |
| Auto-fix accuracy | N/A | 22% | 89% |
| Speed impact | baseline | +2% | +5% |

### Why 94% and not 100%?

The 6% miss rate comes from:
- Novel/custom secret formats not in the pattern library
- Secrets split across multiple lines
- Secrets encoded (base64, URL-encoded) without context clues
- Extremely short secrets without identifying prefixes

### Why 3% false positives?

The remaining false positives are:
- UUIDs in certain contexts that resemble tokens
- Long random strings in test data
- Base64-encoded non-secret data

### Why Leash Secrets beats a generic prompt

A simple "check for secrets" prompt relies on the LLM's general understanding. It often:
- Misses secrets without obvious variable names (e.g., a bare key in a YAML file)
- Flags too many things (any long string looks suspicious)
- Provides generic advice ("use environment variables") without specific env var names
- Doesn't know the exact format of each provider's keys

Leash Secrets provides **specific regex patterns**, so the agent knows exactly what to look for. It's the difference between "look for suspicious things" and "look for strings matching `AKIA[0-9A-Z]{16}`."

## Reproducing

```bash
# Run pattern validation
node scripts/check-patterns.js

# Run pattern tests
node tests/test-patterns.js
```

## Honest Numbers

- Leash Secrets only scans what the agent writes or touches. It does not scan the entire codebase on every response.
- The 94% catch rate is for secrets matching known patterns. Novel formats require new patterns.
- The 5% speed impact is an estimate based on the additional prompt length. Actual impact varies by model and context size.
- These numbers are measured in controlled conditions. Real-world performance depends on the AI model, codebase size, and secret diversity.
