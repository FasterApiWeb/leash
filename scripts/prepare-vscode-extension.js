#!/usr/bin/env node
/**
 * Syncs root assets into vscode-extension/ before packaging or publishing.
 * Keeps patterns/ as the single source of truth — no duplicated edits.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const extDir = path.join(root, 'vscode-extension');
const patternsSrc = path.join(root, 'patterns');
const patternsDest = path.join(extDir, 'patterns');

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  if (!fs.existsSync(patternsSrc)) {
    console.error('Missing patterns/ directory at repo root.');
    process.exit(1);
  }

  if (!fs.existsSync(path.join(extDir, 'icon.png'))) {
    console.error('Missing vscode-extension/icon.png — add a 128x128 PNG icon.');
    process.exit(1);
  }

  if (fs.existsSync(patternsDest)) {
    fs.rmSync(patternsDest, { recursive: true, force: true });
  }
  copyRecursive(patternsSrc, patternsDest);

  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(extDir, 'LICENSE'));

  const patternCount = JSON.parse(
    fs.readFileSync(path.join(patternsDest, 'index.json'), 'utf-8')
  ).pattern_files.length;

  console.log(`Prepared vscode-extension: LICENSE, ${patternCount} pattern files synced.`);
}

main();
