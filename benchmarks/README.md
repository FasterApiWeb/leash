# Benchmark corpus

Published, labeled test data for the leash-secrets **pattern scanner**.

## Raw data (committed)

| File | Description |
|------|-------------|
| [`corpus/cases.json`](corpus/cases.json) | **41 labeled cases** — each line's content is `content_b64` (decode to verify) |
| [`results.json`](../results.json) | Last `node scripts/run-benchmark.js` output |

Secrets are **base64-encoded per line** in `cases.json` so GitHub push protection does not block fake-but-format-valid fixtures. This is still fully reproducible:

```bash
# Decode a case (example)
node -e "console.log(Buffer.from('...', 'base64').toString())"

# Run full benchmark
npm run benchmark:corpus
```

## Local fixture files (optional)

Plaintext samples live in `corpus/samples/` for development — **gitignored**. Regenerate from base64:

```bash
node scripts/materialize-corpus.js
```

## Latest metrics

Run `npm run benchmark:corpus` — see `results.json` for recall / false-positive rate.

## Cite

[`CITATION.cff`](../CITATION.cff) — **EshwarCVS** & **FasterApiWeb**
