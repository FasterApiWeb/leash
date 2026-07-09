#!/usr/bin/env node
/** Decode cases.json into benchmarks/corpus/samples/ for local inspection */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'benchmarks/corpus/cases.json'), 'utf8'));
const outDir = path.join(ROOT, 'benchmarks/corpus/samples');
fs.mkdirSync(outDir, { recursive: true });

const byFile = {};
for (const c of corpus.cases) {
  const file = c.file || `generated/${c.id}.txt`;
  if (!byFile[file]) byFile[file] = [];
  byFile[file].push({ line: c.line || byFile[file].length + 1, text: Buffer.from(c.content_b64, 'base64').toString('utf8') });
}

for (const [file, lines] of Object.entries(byFile)) {
  const fp = path.join(ROOT, 'benchmarks/corpus', file);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const sorted = lines.sort((a, b) => a.line - b.line);
  const content = sorted.map(l => l.text).join('\n') + '\n';
  fs.writeFileSync(fp, content);
  console.log('wrote', file);
}
