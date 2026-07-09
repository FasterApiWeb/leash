# Benchmarks

## Published corpus

**Raw data:** [`benchmarks/corpus/cases.json`](https://github.com/FasterApiWeb/leash-secrets/blob/main/benchmarks/corpus/cases.json)  
**Fixture files:** [`benchmarks/corpus/samples/`](https://github.com/FasterApiWeb/leash-secrets/tree/main/benchmarks/corpus/samples)  
**Last results:** [`benchmarks/results.json`](https://github.com/FasterApiWeb/leash-secrets/blob/main/benchmarks/results.json)

```bash
node scripts/run-benchmark.js   # reproduce locally
```

## What we measure

The published corpus tests the **pattern scanner** (`leash-secrets scan` / agent protocol regex library):

| Metric | Definition |
|--------|------------|
| **Recall** | % of labeled positives detected at the correct line |
| **False positive rate** | % of labeled negatives that incorrectly fire critical |
| **Known gaps** | Secret shapes documented as not yet detected |

## Latest committed results

See [`benchmarks/results.json`](../benchmarks/results.json) for the full per-case breakdown.

| Metric | Result |
|--------|-------:|
| Positives detected | 30 / 30 |
| Recall | **100%** |
| False positives on negatives | 0 / 8 |
| Documented known misses | 3 |

## What we do not claim (yet)

These require separate eval harnesses and are **not** in the published corpus:

- Comparison vs a generic LLM "check for secrets" prompt
- Auto-fix accuracy percentages
- Agent latency overhead

We publish pattern-scanner numbers only. Skeptics can clone, run `node scripts/run-benchmark.js`, and verify.

## Known gaps (documented in corpus)

| Case | Why it misses |
|------|----------------|
| Multiline concatenated secrets | Line-by-line scanner |
| Base64 blob without context | No entropy / context rules |
| Truncated tokens | Below minimum length |

## Also run

```bash
npm test                        # pattern unit tests (29 cases)
node scripts/benchmark-summary.js
```

Unit tests validate individual regexes. The corpus validates end-to-end file scanning.
