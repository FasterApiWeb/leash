#!/usr/bin/env node

/**
 * leash-secrets CLI — scan files and repos for exposed secrets
 *
 * Usage:
 *   leash-secrets scan <file|dir>       Scan files for secrets
 *   leash-secrets scan --staged         Scan git staged changes
 *   leash-secrets validate              Validate pattern files
 *   leash-secrets report <file|dir>     Generate a markdown report
 */

const path = require('path');
const fs = require('fs');
const { loadPatterns } = require('../src/loader');
const { scan, scanFile } = require('../src/scanner');
const { formatFindings, formatReport, formatJSON } = require('../src/reporter');

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
  🔒 leash-secrets — keep your secrets on a leash

  Usage:
    leash-secrets scan <file|dir> [--verbose] [--json]    Scan for secrets
    leash-secrets validate                                 Validate pattern files
    leash-secrets report <file|dir>                        Generate markdown report
    leash-secrets patterns                                 List all patterns
    leash-secrets help                                     Show this help

  Examples:
    leash-secrets scan .                      Scan current directory
    leash-secrets scan src/ --verbose         Scan with risk details
    leash-secrets scan config.yml --json      Output as JSON
    leash-secrets report .                    Generate report to stdout
  `);
}

function runScan() {
  const targets = [];
  let verbose = false;
  let json = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--verbose' || args[i] === '-v') verbose = true;
    else if (args[i] === '--json') json = true;
    else targets.push(args[i]);
  }

  if (targets.length === 0) targets.push('.');

  try {
    const patterns = loadPatterns();
    const findings = scan(targets, { patterns });

    if (json) {
      console.log(formatJSON(findings));
    } else {
      console.log(formatFindings(findings, { verbose }));
    }

    const criticals = findings.filter(f => f.severity === 'critical');
    process.exit(criticals.length > 0 ? 1 : 0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
}

function runValidate() {
  try {
    require('../scripts/check-patterns');
  } catch (err) {
    process.exit(1);
  }
}

function runReport() {
  const targets = args.slice(1).filter(a => !a.startsWith('--'));
  if (targets.length === 0) targets.push('.');

  try {
    const patterns = loadPatterns();
    const findings = scan(targets, { patterns });
    const repoName = path.basename(process.cwd());
    console.log(formatReport(findings, { repoName }));

    const criticals = findings.filter(f => f.severity === 'critical');
    process.exit(criticals.length > 0 ? 1 : 0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
}

function runPatterns() {
  try {
    const patterns = loadPatterns();
    console.log(`\n  🔒 leash-secrets — ${patterns.length} patterns loaded\n`);

    const grouped = {};
    for (const p of patterns) {
      if (!grouped[p.providerName]) grouped[p.providerName] = [];
      grouped[p.providerName].push(p);
    }

    for (const [provider, pats] of Object.entries(grouped)) {
      console.log(`  ${provider} (${pats.length})`);
      for (const p of pats) {
        const icon = p.severity === 'critical' ? '🔴' : p.severity === 'warning' ? '🟡' : 'ℹ️';
        console.log(`    ${icon} ${p.name}`);
      }
      console.log('');
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
}

switch (command) {
  case 'scan':
    runScan();
    break;
  case 'validate':
    runValidate();
    break;
  case 'report':
    runReport();
    break;
  case 'patterns':
    runPatterns();
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    printUsage();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
