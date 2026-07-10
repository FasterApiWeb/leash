/**
 * Secret Scanner (Single Responsibility: detect secrets in text)
 *
 * Dependency Inversion: depends on pattern objects (abstraction),
 * not on specific JSON files or file paths.
 */

const fs = require('fs');
const { loadPatterns } = require('./loader');

const DEFAULT_ALLOWLIST = [
  /example\.com/i,
  /your-.*-here/i,
  /REPLACE_ME/i,
  /changeme/i,
  /password123/i,
  /sk_test_/,
  /pk_test_/,
  /TODO/,
  /xxxxx/i,
  /dummy/i,
  /placeholder/i,
  /fake/i,
  // Truncated / redacted educational examples in docs (do NOT allowlist real PEM bodies)
  /abc123/i,
  /not[_-]?a[_-]?real/i,
  /replace-me/i,
  /SECRET DETECTED/i,
  /\|\s*Private Key\s*\|/i,
];

function redact(value) {
  if (!value || value.length < 10) return '****';
  return `${value.slice(0, 6)}....${value.slice(-4)}`;
}

function isAllowlisted(line, customAllowlist = []) {
  const allPatterns = [...DEFAULT_ALLOWLIST, ...customAllowlist];
  return allPatterns.some(pattern => pattern.test(line));
}

function scanString(content, options = {}) {
  const {
    patterns = null,
    allowlist = [],
    filename = '<stdin>',
  } = options;

  const loadedPatterns = patterns || loadPatterns();
  const lines = content.split('\n');
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isAllowlisted(line, allowlist)) continue;

    for (const pattern of loadedPatterns) {
      const match = line.match(pattern.compiledRegex);
      if (match) {
        findings.push({
          pattern,
          file: filename,
          line: i + 1,
          column: match.index + 1,
          matched: redact(match[0]),
          rawLength: match[0].length,
          severity: pattern.severity,
        });
        break;
      }
    }
  }

  return findings;
}

function scanFile(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return scanString(content, { ...options, filename: filePath });
}

function scan(filesOrDirs, options = {}) {
  const patterns = options.patterns || loadPatterns(options);
  const allFindings = [];

  for (const target of filesOrDirs) {
    if (!fs.existsSync(target)) continue;

    const stat = fs.statSync(target);
    if (stat.isFile()) {
      const findings = scanFile(target, { ...options, patterns });
      allFindings.push(...findings);
    } else if (stat.isDirectory()) {
      const entries = fs.readdirSync(target, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const fullPath = require('path').join(target, entry.name);
        const sub = scan([fullPath], { ...options, patterns });
        allFindings.push(...sub);
      }
    }
  }

  return allFindings;
}

module.exports = { scan, scanFile, scanString };
