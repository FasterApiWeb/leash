#!/usr/bin/env node
/**
 * Reproducible benchmark summary from checked-in pattern fixtures.
 * This measures pattern-test pass rate — not full-repo scanning accuracy.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status,
  };
}

const validate = run('node', ['scripts/check-patterns.js']);
const tests = run('node', ['tests/test-patterns.js']);

const passedMatch = tests.stdout.match(/Passed:\s+(\d+)/);
const failedMatch = tests.stdout.match(/Failed:\s+(\d+)/);
const passed = passedMatch ? Number(passedMatch[1]) : 0;
const failed = failedMatch ? Number(failedMatch[1]) : 0;
const total = passed + failed;
const passRate = total ? ((passed / total) * 100).toFixed(1) : '0.0';

console.log('\n📊 leash-secrets reproducible benchmark summary\n');
console.log(`Pattern schema validation: ${validate.ok ? 'PASS' : 'FAIL'}`);
console.log(`Fixture regex tests:       ${tests.ok ? 'PASS' : 'FAIL'}`);
console.log(`Fixture pass rate:         ${passRate}% (${passed}/${total})`);
console.log('\nNotes:');
console.log('- This script validates the checked-in test corpus only.');
console.log('- Corpus benchmark: npm run benchmark:corpus');
console.log('- Run: npm test\n');

if (!validate.ok || !tests.ok) process.exit(1);
