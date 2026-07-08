const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const SEVERITY_MAP = {
  critical: vscode.DiagnosticSeverity.Error,
  warning: vscode.DiagnosticSeverity.Warning,
  info: vscode.DiagnosticSeverity.Information,
};

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

let diagnosticCollection;
let patterns = [];
let debounceTimer = null;
let statusBarItem;

function parseRegex(patternObj) {
  let regexStr = patternObj.regex;
  let flags = 'g';
  if (regexStr.startsWith('(?i)')) {
    regexStr = regexStr.slice(4);
    flags = 'gi';
  }
  try {
    return new RegExp(regexStr, flags);
  } catch {
    return null;
  }
}

const ALLOWLIST = [
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
];

function isAllowlisted(line) {
  return ALLOWLIST.some(p => p.test(line));
}

function loadPatterns() {
  const locations = [
    path.join(__dirname, '..', '..', 'patterns'),
    path.join(__dirname, '..', 'patterns'),
  ];

  for (const dir of locations) {
    const indexPath = path.join(dir, 'index.json');
    if (!fs.existsSync(indexPath)) continue;

    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      const loaded = [];

      for (const file of index.pattern_files) {
        const filePath = path.join(dir, file);
        if (!fs.existsSync(filePath)) continue;

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const p of data.patterns) {
          const compiled = parseRegex(p);
          if (compiled) {
            loaded.push({
              ...p,
              provider: data.provider,
              providerName: data.display_name,
              compiledRegex: compiled,
            });
          }
        }
      }

      return loaded;
    } catch {
      continue;
    }
  }

  return getBundledPatterns();
}

function getBundledPatterns() {
  const critical = [
    { id: 'aws-key', name: 'AWS Access Key', severity: 'critical', regex: '(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}', fix: 'Use AWS_ACCESS_KEY_ID env var' },
    { id: 'github-pat', name: 'GitHub PAT', severity: 'critical', regex: 'ghp_[0-9a-zA-Z]{36}', fix: 'Use GITHUB_TOKEN env var' },
    { id: 'github-pat-fg', name: 'GitHub Fine-Grained PAT', severity: 'critical', regex: 'github_pat_[0-9a-zA-Z_]{82}', fix: 'Use GITHUB_TOKEN env var' },
    { id: 'stripe-live', name: 'Stripe Live Key', severity: 'critical', regex: 'sk_live_[0-9a-zA-Z]{24,}', fix: 'Use STRIPE_SECRET_KEY env var' },
    { id: 'openai', name: 'OpenAI API Key', severity: 'critical', regex: 'sk-proj-[a-zA-Z0-9_-]{80,}', fix: 'Use OPENAI_API_KEY env var' },
    { id: 'gcp-key', name: 'Google API Key', severity: 'critical', regex: 'AIza[0-9A-Za-z_-]{35}', fix: 'Use GOOGLE_API_KEY env var' },
    { id: 'sendgrid', name: 'SendGrid API Key', severity: 'critical', regex: 'SG\\.[a-zA-Z0-9_-]{22}\\.[a-zA-Z0-9_-]{43}', fix: 'Use SENDGRID_API_KEY env var' },
    { id: 'slack-bot', name: 'Slack Bot Token', severity: 'critical', regex: 'xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}', fix: 'Use SLACK_BOT_TOKEN env var' },
    { id: 'npm-token', name: 'npm Token', severity: 'critical', regex: 'npm_[a-zA-Z0-9]{36}', fix: 'Use NPM_TOKEN env var' },
    { id: 'hf-token', name: 'Hugging Face Token', severity: 'critical', regex: 'hf_[a-zA-Z0-9]{34}', fix: 'Use HF_TOKEN env var' },
    { id: 'rsa-key', name: 'RSA Private Key', severity: 'critical', regex: '-----BEGIN RSA PRIVATE KEY-----', fix: 'Never commit private keys' },
    { id: 'openssh-key', name: 'OpenSSH Private Key', severity: 'critical', regex: '-----BEGIN OPENSSH PRIVATE KEY-----', fix: 'Never commit private keys' },
    { id: 'private-key', name: 'Private Key', severity: 'critical', regex: '-----BEGIN PRIVATE KEY-----', fix: 'Never commit private keys' },
    { id: 'gitlab-pat', name: 'GitLab PAT', severity: 'critical', regex: 'glpat-[0-9a-zA-Z_-]{20}', fix: 'Use CI/CD variables' },
    { id: 'stripe-whsec', name: 'Stripe Webhook Secret', severity: 'critical', regex: 'whsec_[0-9a-zA-Z]{32,}', fix: 'Use STRIPE_WEBHOOK_SECRET env var' },
  ];

  return critical.map(p => ({
    ...p,
    description: p.name,
    risk: 'Exposed credential',
    compiledRegex: parseRegex(p),
  })).filter(p => p.compiledRegex);
}

function scanDocument(document) {
  const config = vscode.workspace.getConfiguration('leash-secrets');
  if (!config.get('enabled')) return;

  const minSeverity = config.get('severity', 'warning');
  const minOrder = SEVERITY_ORDER[minSeverity] ?? 1;

  const excludePatterns = config.get('excludePatterns', []);
  const filePath = document.uri.fsPath;

  for (const pattern of excludePatterns) {
    if (vscode.languages.match({ pattern }, document) > 0) return;
  }

  const diagnostics = [];
  const text = document.getText();
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isAllowlisted(line)) continue;

    for (const pattern of patterns) {
      if ((SEVERITY_ORDER[pattern.severity] ?? 2) > minOrder) continue;

      pattern.compiledRegex.lastIndex = 0;
      let match;
      while ((match = pattern.compiledRegex.exec(line)) !== null) {
        const start = new vscode.Position(i, match.index);
        const end = new vscode.Position(i, match.index + match[0].length);
        const range = new vscode.Range(start, end);

        const redacted = match[0].length > 10
          ? `${match[0].slice(0, 6)}....${match[0].slice(-4)}`
          : '****';

        const diagnostic = new vscode.Diagnostic(
          range,
          `🔒 Leash Secrets: ${pattern.name} detected (${redacted})\nFix: ${pattern.fix}`,
          SEVERITY_MAP[pattern.severity] ?? vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'leash-secrets';
        diagnostic.code = pattern.id;
        diagnostics.push(diagnostic);
      }
    }
  }

  diagnosticCollection.set(document.uri, diagnostics);
  updateStatusBar(diagnostics.length);
}

function updateStatusBar(count) {
  if (count > 0) {
    statusBarItem.text = `$(lock) Leash Secrets: ${count} secret${count > 1 ? 's' : ''}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  } else {
    statusBarItem.text = '$(lock) Leash Secrets';
    statusBarItem.backgroundColor = undefined;
  }
  statusBarItem.show();
}

function debouncedScan(document) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => scanDocument(document), 500);
}

function activate(context) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('leash-secrets');
  context.subscriptions.push(diagnosticCollection);

  patterns = loadPatterns();

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'leash-secrets.scanFile';
  statusBarItem.tooltip = 'Leash Secrets Scanner';
  statusBarItem.text = '$(lock) Leash Secrets';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  if (vscode.window.activeTextEditor) {
    scanDocument(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) scanDocument(editor.document);
    })
  );

  const config = vscode.workspace.getConfiguration('leash-secrets');

  if (config.get('scanOnType')) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(event => {
        debouncedScan(event.document);
      })
    );
  }

  if (config.get('scanOnSave')) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
        scanDocument(document);
      })
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('leash-secrets.scanFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        scanDocument(editor.document);
        const diags = diagnosticCollection.get(editor.document.uri);
        const count = diags ? diags.length : 0;
        if (count === 0) {
          vscode.window.showInformationMessage('Leash Secrets: No secrets detected in this file.');
        } else {
          vscode.window.showWarningMessage(`Leash Secrets: Found ${count} potential secret(s). Check the Problems panel.`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('leash-secrets.scanWorkspace', async () => {
      const files = await vscode.workspace.findFiles('**/*', '{**/node_modules/**,**/.git/**,**/dist/**}', 500);
      let totalFindings = 0;

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Leash Secrets: Scanning workspace...', cancellable: true },
        async (progress, token) => {
          for (let i = 0; i < files.length; i++) {
            if (token.isCancellationRequested) break;
            progress.report({ increment: (100 / files.length), message: `${i + 1}/${files.length}` });

            try {
              const doc = await vscode.workspace.openTextDocument(files[i]);
              scanDocument(doc);
              const diags = diagnosticCollection.get(doc.uri);
              if (diags) totalFindings += diags.length;
            } catch {
              // skip binary/unsupported files
            }
          }
        }
      );

      if (totalFindings === 0) {
        vscode.window.showInformationMessage('Leash Secrets: No secrets found in workspace.');
      } else {
        vscode.window.showWarningMessage(`Leash Secrets: Found ${totalFindings} potential secret(s) across workspace. Check the Problems panel.`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('leash-secrets.toggleEnabled', () => {
      const config = vscode.workspace.getConfiguration('leash-secrets');
      const current = config.get('enabled');
      config.update('enabled', !current, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Leash Secrets: ${!current ? 'Enabled' : 'Disabled'}`);
      if (current) {
        diagnosticCollection.clear();
        updateStatusBar(0);
      }
    })
  );

  vscode.window.showInformationMessage('Leash Secrets: Secret scanning active 🔒');
}

function deactivate() {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (diagnosticCollection) diagnosticCollection.dispose();
  if (statusBarItem) statusBarItem.dispose();
}

module.exports = { activate, deactivate };
