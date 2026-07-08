/**
 * leash-secrets — programmatic API
 *
 * SOLID architecture:
 *   S — Each module has one responsibility (load, scan, report)
 *   O — New patterns added via JSON without modifying core code
 *   L — All pattern sources (file, remote, custom) conform to the same schema
 *   I — Consumers import only the functions they need
 *   D — Scanner depends on pattern abstractions, not concrete files
 */

const { loadPatterns, loadPatternsFromFile } = require('./loader');
const { scan, scanFile, scanString } = require('./scanner');
const { formatFindings, formatReport } = require('./reporter');

module.exports = {
  loadPatterns,
  loadPatternsFromFile,
  scan,
  scanFile,
  scanString,
  formatFindings,
  formatReport,
};
