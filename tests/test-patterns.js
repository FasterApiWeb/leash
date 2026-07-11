#!/usr/bin/env node

/**
 * Tests leash-secrets patterns against known fixtures.
 * Run: node tests/test-patterns.js
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '..', 'patterns');
const INDEX_FILE = path.join(PATTERNS_DIR, 'index.json');

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
  passed++;
}

function fail(msg) {
  console.error(`  \x1b[31m✗\x1b[0m ${msg}`);
  failed++;
}

const TEST_CASES = {
  'sentry-auth-token': {
    shouldMatch: [ 'sntrys_' + 'A'.repeat(60) ],
    shouldNotMatch: [ 'sntrys_short', 'not_a_sentry_token' ],
  },
  'generic-basic-auth-url': {
  shouldMatch: [
    'https://admin:S3cr3tP4ss@internal.example-corp.com/api',
  ],
  shouldNotMatch: [
    'https://example.com/123',
    'https://short@host/1',
    '[![Docs](https://img.shields.io/badge/docs-latest-blue)](mailto:user@example-corp.com)',
  ],
},
  'sentry-dsn': {
    shouldMatch: [ 'https://' + 'a'.repeat(32) + '@o0.ingest.sentry.io/123456' ],
    shouldNotMatch: [ 'https://example.com/123', 'https://short@host/1' ],
  },
  'datadog-api-key': {
    shouldMatch: [
      "DD_API_KEY=" + "a".repeat(32),
      "datadog_api_key: '" + "b".repeat(32) + "'",
      "DATADOG_API_KEY=" + "c".repeat(32),
    ],
    shouldNotMatch: [ "DD_API_KEY=short", "not_a_datadog_key" ],
  },
  'datadog-app-key': {
    shouldMatch: [
      "DD_APP_KEY=" + "d".repeat(40),
      "datadog_application_key: '" + "e".repeat(40) + "'",
    ],
    shouldNotMatch: [ "DD_APP_KEY=short" ],
  },
  'cloudflare-api-token': {
    shouldMatch: [
      "CLOUDFLARE_API_TOKEN=abcdefghijklmnopqrstuvwxyz0123456789ABCD",
      "cf_api_token: 'abcdefghijklmnopqrstuvwxyz0123456789ABCD'",
    ],
    shouldNotMatch: [
      'cloudflare_token=short',
      'not_a_cloudflare_token',
    ],
  },
  'aws-access-key-id': {
    shouldMatch: [
      'AKIAIOSFODNN7EXAMPLE',
      'AWS_KEY=AKIAI44QH8DHBEXAMPLE',
    ],
    shouldNotMatch: [
      'this is not a key',
      'AKIA',
    ],
  },
  'github-pat-classic': {
    shouldMatch: [
      'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef1234',
    ],
    shouldNotMatch: [
      'ghp_short',
      'not_a_token',
    ],
  },
  'stripe-live-secret-key': {
    shouldMatch: [
      'sk_live_' + '51H7mKjG8z4x9vRnC3yT5qW2b',
    ],
    shouldNotMatch: [
      'sk_test_51H7mKjG8z4x9vRnC3yT5qW',
      'sk_live_short',
    ],
  },
  'openai-api-key-project': {
    shouldMatch: [
      'sk-proj-' + 'a'.repeat(80),
    ],
    shouldNotMatch: [
      'sk-proj-short',
      'not-an-openai-key',
    ],
  },
  'rsa-private-key': {
    shouldMatch: [
      '-----BEGIN RSA PRIVATE KEY-----',
    ],
    shouldNotMatch: [
      '-----BEGIN RSA PUBLIC KEY-----',
      '-----BEGIN CERTIFICATE-----',
    ],
  },
  'openssh-private-key': {
    shouldMatch: [
      '-----BEGIN OPENSSH PRIVATE KEY-----',
    ],
    shouldNotMatch: [
      'OPENSSH PUBLIC KEY',
    ],
  },
  'slack-bot-token': {
    shouldMatch: [
      'xoxb-' + '1234567890123-1234567890123-ABCDEFGHIJKLMNOPQRSTUVwx',
    ],
    shouldNotMatch: [
      'xoxb-short',
    ],
  },
  'sendgrid-api-key': {
    shouldMatch: [
      'SG.abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrst',
    ],
    shouldNotMatch: [
      'SG.short',
    ],
  },
  'gcp-api-key': {
    shouldMatch: [
      'AIzaSyA1234567890abcdefghijklmnopqrstuv',
    ],
    shouldNotMatch: [
      'AIza_short',
      'not_a_gcp_key',
    ],
  },
  'npm-token': {
    shouldMatch: [
      'npm_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef1234',
    ],
    shouldNotMatch: [
      'npm_short',
    ],
  },
  'huggingface-token': {
    shouldMatch: [
      'hf_' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh',
    ],
    shouldNotMatch: [
      'hf_short',
    ],
  },
};

console.log('\n  Testing leash-secrets patterns against fixtures...\n');

const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
const allPatterns = {};

for (const file of index.pattern_files) {
  const filePath = path.join(PATTERNS_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  for (const pattern of data.patterns) {
    allPatterns[pattern.id] = pattern;
  }
}

for (const [patternId, cases] of Object.entries(TEST_CASES)) {
  const pattern = allPatterns[patternId];
  if (!pattern) {
    fail(`Pattern '${patternId}' not found in any pattern file`);
    continue;
  }

  let regexStr = pattern.regex;
  let flags = '';
  if (regexStr.startsWith('(?i)')) {
    regexStr = regexStr.slice(4);
    flags = 'i';
  }
  const regex = new RegExp(regexStr, flags);

  for (const input of cases.shouldMatch) {
    if (regex.test(input)) {
      pass(`${patternId}: matched '${input.substring(0, 40)}...'`);
    } else {
      fail(`${patternId}: should match '${input.substring(0, 40)}...' but didn't`);
    }
  }

  for (const input of cases.shouldNotMatch) {
    if (!regex.test(input)) {
      pass(`${patternId}: correctly rejected '${input.substring(0, 40)}'`);
    } else {
      fail(`${patternId}: should NOT match '${input.substring(0, 40)}' but did`);
    }
  }
}

console.log(`\n  ────────────────────────────────`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  ────────────────────────────────\n`);

if (failed > 0) {
  console.error(`  \x1b[31m${failed} test(s) failed\x1b[0m\n`);
  process.exit(1);
}

console.log(`  \x1b[32mAll tests passed.\x1b[0m\n`);
