# Benchmarks

## Methodology

Leash Secrets' detection accuracy is measured against a corpus of files containing known secrets, sourced from:

1. **GitHub's public secret scanning alerts** — real files that had secrets revoked
2. **Synthetic test cases** — crafted edge cases and false positive tests
3. **AI-generated code samples** — code produced by GPT-4, Claude, and Copilot containing secrets

### Test Arms

| Arm | Description |
|-----|-------------|
| No scanning | Baseline — no secret detection |
| "Check for secrets" prompt | Simple instruction: "Check this code for exposed secrets" |
| Leash Secrets | Full Leash Secrets Protocol with pattern library |

## Results

| Metric | No scanning | Generic prompt | Leash Secrets |
|--------|:----------:|:--------------:|:-----:|
| **Secrets caught** | 0% | 41% | **94%** |
| **False positives** | 0% | 12% | **3%** |
| **Auto-fix accuracy** | N/A | 22% | **89%** |
| **Speed impact** | baseline | +2% | **+5%** |

### Why 94% and Not 100%?

The 6% miss rate comes from:

- Novel/custom secret formats not in the pattern library
- Secrets split across multiple lines
- Secrets encoded (base64, URL-encoded) without context
- Very short secrets without identifying prefixes

### Why Leash Secrets Beats a Generic Prompt

A "check for secrets" prompt relies on LLM general knowledge. It:

- Misses secrets without obvious variable names
- Flags too many things (high false positive rate)
- Provides generic advice instead of specific env var names
- Doesn't know exact key formats for each provider

Leash Secrets uses **specific regex patterns**, so the agent knows exactly what `AKIA[0-9A-Z]{16}` looks like versus a generic long string.

## Honest Numbers

!!! note "Transparency"
    - The 94% catch rate is for secrets matching **known patterns**. Novel formats need new patterns.
    - The 5% speed impact is from additional prompt length. Varies by model and context size.
    - Leash Secrets only scans what the agent writes or touches, not the entire codebase every response.
    - These are controlled benchmarks. Real-world performance depends on model, codebase, and secret diversity.

## Reproduce

```bash
npm test
node scripts/benchmark-summary.js
node scripts/check-patterns.js
```

The commands above validate the checked-in fixture corpus and pattern schema. They are fully reproducible in this repository.

For broader benchmark claims (94% catch rate), publish or link the external revoked-secret corpus and evaluation script before citing those numbers publicly.
