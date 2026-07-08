#!/usr/bin/env node

/**
 * Validates all leash-secrets pattern files against the schema.
 * Run: node scripts/check-patterns.js
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '..', 'patterns');
const INDEX_FILE = path.join(PATTERNS_DIR, 'index.json');

let errors = 0;
let warnings = 0;
let patternCount = 0;

function error(msg) {
  console.error(`  \x1b[31m✗\x1b[0m ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  \x1b[33m⚠\x1b[0m ${msg}`);
  warnings++;
}

function ok(msg) {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
}

console.log('\n  Validating leash-secrets patterns...\n');

const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));

for (const file of index.pattern_files) {
  const filePath = path.join(PATTERNS_DIR, file);

  if (!fs.existsSync(filePath)) {
    error(`Pattern file not found: ${file}`);
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    error(`Invalid JSON in ${file}: ${e.message}`);
    continue;
  }

  if (!data.provider) error(`${file}: missing 'provider' field`);
  if (!data.display_name) error(`${file}: missing 'display_name' field`);
  if (!Array.isArray(data.patterns)) {
    error(`${file}: 'patterns' must be an array`);
    continue;
  }

  const ids = new Set();

  for (const pattern of data.patterns) {
    patternCount++;

    if (!pattern.id) {
      error(`${file}: pattern missing 'id'`);
      continue;
    }

    if (ids.has(pattern.id)) {
      error(`${file}: duplicate pattern id '${pattern.id}'`);
    }
    ids.add(pattern.id);

    const required = ['name', 'severity', 'regex', 'description', 'risk', 'fix'];
    for (const field of required) {
      if (!pattern[field]) {
        error(`${file}/${pattern.id}: missing required field '${field}'`);
      }
    }

    if (pattern.severity && !['critical', 'warning', 'info'].includes(pattern.severity)) {
      error(`${file}/${pattern.id}: invalid severity '${pattern.severity}' (must be critical/warning/info)`);
    }

    if (pattern.regex) {
      try {
        let regexStr = pattern.regex;
        let flags = '';
        if (regexStr.startsWith('(?i)')) {
          regexStr = regexStr.slice(4);
          flags = 'i';
        }
        new RegExp(regexStr, flags);
      } catch (e) {
        error(`${file}/${pattern.id}: invalid regex: ${e.message}`);
      }
    }
  }

  ok(`${file}: ${data.patterns.length} patterns valid`);
}

console.log(`\n  ────────────────────────────────`);
console.log(`  Patterns: ${patternCount}`);
console.log(`  Errors:   ${errors}`);
console.log(`  Warnings: ${warnings}`);
console.log(`  ────────────────────────────────\n`);

if (errors > 0) {
  console.error(`  \x1b[31mValidation failed with ${errors} error(s)\x1b[0m\n`);
  process.exit(1);
}

console.log(`  \x1b[32mAll patterns valid.\x1b[0m\n`);
