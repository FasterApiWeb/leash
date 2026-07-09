#!/usr/bin/env node
/**
 * Run the published benchmark corpus and write benchmarks/results.json
 * Corpus secrets are base64-encoded per line to avoid push-protection false positives.
 */
const fs = require('fs');
const path = require('path');
const { scanString } = require('../src/scanner');

const ROOT = path.join(__dirname, '..');
const CASES_FILE = path.join(ROOT, 'benchmarks', 'corpus', 'cases.json');
const RESULTS_FILE = path.join(ROOT, 'benchmarks', 'results.json');

function findingsOnLine(findings, line) {
  return findings.filter(f => f.line === line);
}

function hasPatternOnLine(findings, line, patternId) {
  return findingsOnLine(findings, line).some(f => f.pattern.id === patternId);
}

function hasCriticalOnLine(findings, line) {
  return findingsOnLine(findings, line).some(f => f.severity === 'critical');
}

function evaluateCase(caseDef) {
  const lineText = Buffer.from(caseDef.content_b64, 'base64').toString('utf8');
  const virtualFile = `corpus/${caseDef.id}.txt`;
  const findings = scanString(lineText + '\n', { filename: virtualFile });
  const line = 1;
  const lineFindings = findingsOnLine(findings, line);

  let pass = false;
  let detail = '';

  if (caseDef.label === 'positive') {
    pass = hasPatternOnLine(findings, line, caseDef.pattern_id);
    detail = pass
      ? `Detected ${caseDef.pattern_id}`
      : `Expected ${caseDef.pattern_id}; found: ${lineFindings.map(f => f.pattern.id).join(', ') || 'none'}`;
  } else if (caseDef.label === 'negative') {
    pass = !hasCriticalOnLine(findings, line);
    detail = pass
      ? 'No critical on line'
      : `False positive: ${lineFindings.filter(f => f.severity === 'critical').map(f => f.pattern.id).join(', ')}`;
  } else if (caseDef.label === 'known_miss') {
    pass = !hasCriticalOnLine(findings, line);
    detail = pass
      ? 'Documented gap — not detected (expected)'
      : 'Unexpected detection on known-miss case';
  }

  return {
    id: caseDef.id,
    label: caseDef.label,
    line: 1,
    pattern_id: caseDef.pattern_id || null,
    pass,
    detail,
    detected: lineFindings.map(f => ({ pattern_id: f.pattern.id, severity: f.severity })),
  };
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(CASES_FILE, 'utf8'));
  const results = corpus.cases.map(evaluateCase);

  const positives = results.filter(r => r.label === 'positive');
  const negatives = results.filter(r => r.label === 'negative');
  const knownMiss = results.filter(r => r.label === 'known_miss');

  const tp = positives.filter(r => r.pass).length;
  const fn = positives.filter(r => !r.pass).length;
  const tn = negatives.filter(r => r.pass).length;
  const fp = negatives.filter(r => !r.pass).length;

  const recall = positives.length ? (tp / positives.length) * 100 : 0;
  const falsePositiveRate = negatives.length ? (fp / negatives.length) * 100 : 0;
  const documentedGaps = knownMiss.filter(r => r.pass).length;

  const summary = {
    version: corpus.version,
    run_at: new Date().toISOString(),
    corpus_cases: corpus.cases.length,
    encoding: corpus.encoding || 'base64 line content in cases.json',
    positives: { total: positives.length, detected: tp, missed: fn, recall_pct: Number(recall.toFixed(1)) },
    negatives: { total: negatives.length, clean: tn, false_positives: fp, false_positive_rate_pct: Number(falsePositiveRate.toFixed(1)) },
    known_miss: { total: knownMiss.length, documented_gaps: documentedGaps },
    all_pass: results.every(r => r.pass),
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ summary, results }, null, 2) + '\n');

  console.log('\n📊 leash-secrets benchmark corpus\n');
  console.log(`Corpus:     benchmarks/corpus/cases.json (${corpus.cases.length} cases)`);
  console.log(`Recall:     ${summary.positives.recall_pct}% (${tp}/${positives.length} positives)`);
  console.log(`False pos:  ${summary.negatives.false_positive_rate_pct}% (${fp}/${negatives.length} negatives)`);
  console.log(`Known gaps: ${documentedGaps}/${knownMiss.length} documented misses`);
  console.log(`Results:    benchmarks/results.json\n`);

  if (!summary.all_pass) {
    console.log('Failures:');
    for (const r of results.filter(x => !x.pass)) {
      console.log(`  ✗ ${r.id} — ${r.detail}`);
    }
    console.log('');
    process.exit(1);
  }
}

main();
