# CI/CD & Releases

Maintainer reference for GitHub Actions, secrets, and how to ship a version of `leash-secrets`.

> **Not Fork Shepherd.** [Fork Shepherd](https://github.com/marketplace/actions/fork-shepherd) is a Marketplace action for **forks** syncing with an upstream. This page is about **leash-secrets**’s own pipelines. The **Release Draft** workflow only reuses the same *release idea* (manual patch/minor/major → draft → publish).

## Mental model

```
You open a PR
    → CI (+ Validate Patterns if patterns change)
    → merge when green

Push lands on main
    → CI again
    → Deploy Docs (if docs/** changed)
    → Validate Patterns (if patterns/** changed)
    → Release (release-please)  ← legacy; usually ignore

When you want to ship a version
    → Actions → Release Draft (patch/minor/major)
    → workflow bumps version files + pushes commit (if needed)
    → draft GitHub Release appears
    → you Publish the draft in the UI
    → Publish npm runs (skips if that version is already on npm)
```

| Stage | Tool | Output |
|-------|------|--------|
| Validate code | **CI** | Pass/fail on PR |
| Update docs site | **Deploy Docs** | GitHub Pages |
| Cut a version | **Release Draft** | Version bump commit (if needed) + draft GitHub Release + assets |
| Make it live | You click **Publish** | Public GitHub Release |
| Package registry | **Publish npm** | `leash-secrets` on npm (no-op if already published) |

```
Release Draft (auto-bump)  →  draft tag/assets  →  Publish draft  →  npm
```

## Workflow table

| Workflow | When it runs | Purpose |
|----------|--------------|---------|
| **CI** | Every PR + every push to `main` (+ manual) | Quality gate: Node 18/20/22 tests, shell syntax, hygiene (incl. `install.sh` ↔ `package.json` version), dogfood scan |
| **Validate Patterns** | PRs/pushes that touch `patterns/` (or related tests/scripts) | Pattern JSON / fixture validation |
| **Deploy Docs** | Push to `main` that touches `docs/**` (or MkDocs config) (+ manual) | MkDocs → GitHub Pages |
| **Release** (release-please) | Push to `main` (+ manual) | **Legacy.** Tries to manage release PRs/tags. Org often blocks Actions from opening PRs — prefer **Release Draft** |
| **Release Draft** | **Manual** (`workflow_dispatch`) | You pick patch/minor/major → bumps version files if needed → **draft** `leash-secrets-vX.Y.Z` + assets |
| **Publish npm** | Manual, **or** when a draft release is **published** | `npm publish --provenance` (succeeds as no-op if version already on npm) |

Workflow files live under [`.github/workflows/`](https://github.com/FasterApiWeb/leash-secrets/tree/main/.github/workflows).

## After a merge to `main` — what runs, in order

Merging a PR (or landing a commit on `main`) does **not** publish npm. These workflows fire automatically from the push:

| Order | Workflow | Runs when? | What it does | You should… |
|-------|----------|------------|--------------|-------------|
| 1 | **CI** | Always on push to `main` | Re-runs the full test matrix on `main` | Wait for green. Required status check for future PRs. |
| 2 | **Validate Patterns** | Only if the merge touched `patterns/**`, `tests/**`, or `scripts/check-patterns.js` | Extra pattern/fixture checks | Confirm green if it ran; otherwise ignore. |
| 3 | **Deploy Docs** | Only if the merge touched `docs/**`, `mkdocs.yml`, `requirements.txt`, or the docs workflow | Builds MkDocs and deploys GitHub Pages | Confirm the site updated if you changed docs. |
| 4 | **Release** (release-please) | Always on push to `main` | Legacy release-please attempt | **Ignore** unless debugging. Prefer **Release Draft** to ship. |

Nothing else is required for a normal feature/fix merge.

### When you want to ship a version (manual, after `main` is green)

Do these **in order** — they are not automatic on merge:

| Order | Action | Workflow / UI | Purpose |
|-------|--------|---------------|---------|
| 1 | Run **Release Draft** | Actions → Release Draft → patch/minor/major | Bumps version on `main` (needs org GitHub App; see below), creates **draft** `leash-secrets-vX.Y.Z` |
| 2 | Review & **Publish** the draft | Releases → open draft → Publish | Makes the GitHub Release public; fires the next step |
| 3 | **Publish npm** | Runs automatically on publish (or Actions → Publish npm) | Publishes `leash-secrets@X.Y.Z` (skips if already on npm) |

Optional: **Publish npm** alone if the GitHub release/tag already exists and you only need the registry.

## Secrets needed

Prefer **org-level** secrets (FasterApiWeb → Settings → Secrets and variables → Actions → Organization secrets) so nothing is tied to a personal account. Grant them to `leash-secrets` (and any other repos that release the same way).

| Secret | Required? | Used by | How to create |
|--------|-----------|---------|---------------|
| `NPM_TOKEN` | **Yes** (to publish) | Publish npm | [npmjs.com](https://www.npmjs.com) → Access Tokens → Granular token with **Read and Write** + **Bypass 2FA for publish** |
| `RELEASE_APP_ID` / `RELEASE_APP_PRIVATE_KEY` / `RELEASE_APP_INSTALLATION_ID` | **Recommended** | Release Draft | Org GitHub App (see below). Preferred over a personal PAT. |
| `RELEASE_TOKEN` | Avoid | Release Draft | Personal PAT — not needed if the App is configured |
| `VSCE_PAT` | Deferred | VS Code extension publish | Azure DevOps PAT with **Marketplace → Manage** |

### Org GitHub App for Release Draft (recommended)

`GITHUB_TOKEN` cannot push to protected `main`. A **personal** `RELEASE_TOKEN` works but is tied to one human. Use an **org-owned GitHub App** instead. **No workflow file changes are required** — `release-draft.yml` already reads these secrets.

#### 1. Create the App (org owner)

1. Open [github.com/organizations/FasterApiWeb/settings/apps/new](https://github.com/organizations/FasterApiWeb/settings/apps/new)
2. Fill in:
   - **GitHub App name:** e.g. `FasterApiWeb Release` (must be unique on GitHub)
   - **Homepage URL:** `https://github.com/FasterApiWeb` (or this repo’s URL)
   - **Webhook:** uncheck **Active**
3. **Repository permissions:**
   - **Contents** → **Read and write**
   - **Metadata** → **Read-only** (usually already set)
4. Leave **Account permissions** at **No access**
5. **Where can this GitHub App be installed?** → **Only on this account**
6. Click **Create GitHub App**

#### 2. Generate the private key

1. On the App settings page → **Private keys** → **Generate a private key**
2. Download the `.pem` (paste into a secret once; never commit it)
3. Note the **App ID** under **About** (digits only)

#### 3. Install the App on the org

1. App settings → **Install App** (or open the App’s install URL)
2. Choose **FasterApiWeb**
3. **Only select repositories** → **`leash-secrets`** (or all repos if you reuse it)
4. **Install**

#### 4. Copy the Installation ID

1. [Org → Settings → GitHub Apps → Installed GitHub Apps](https://github.com/organizations/FasterApiWeb/settings/installations) → **Configure** next to the App
2. URL looks like:  
   `https://github.com/organizations/FasterApiWeb/settings/installations/XXXXXXXX`  
   **`XXXXXXXX`** = `RELEASE_APP_INSTALLATION_ID`

#### 5. Add org Actions secrets

1. [Organization secrets](https://github.com/organizations/FasterApiWeb/settings/secrets/actions) → **New organization secret** for each:

   | Name | Value |
   |------|--------|
   | `RELEASE_APP_ID` | App ID (number) |
   | `RELEASE_APP_PRIVATE_KEY` | Full `.pem` contents (including `BEGIN` / `END` lines) |
   | `RELEASE_APP_INSTALLATION_ID` | Installation ID (number) |

2. **Repository access** → **Selected repositories** → add **`leash-secrets`**

Do **not** add a personal `RELEASE_TOKEN` if the App is configured.

#### 6. Bypass rulesets for the App (required)

Secrets alone are not enough — branch rules still block pushes unless the App is on the bypass list.

1. Repo [Rules](https://github.com/FasterApiWeb/leash-secrets/rules) (or org rulesets) → open the ruleset that targets `main`
2. **Bypass list** → **Add bypass** → **GitHub Apps** → select your Release App
3. Bypass mode: **Always allow** (or **Exempt**)
4. Save

Also check classic **Settings → Branches** protection if it still applies.

#### 7. Actions policy

Org or repo: **Settings → Actions → General** → **Allow all actions and reusable workflows**  
(needed for `actions/create-github-app-token@v2`)

#### 8. Verify

1. **Actions → Release Draft → Run workflow** (`main`, `patch`; optional `dry_run` first)
2. Log step **Resolve release token** should say: `Using GitHub App installation token`
3. On a real run, the bump commit should land on **`main`** (not `release/v*`)

Release Draft token preference: App → `RELEASE_TOKEN` → `GITHUB_TOKEN`.

## Day-to-day (features / fixes)

1. Open a PR → wait for **CI** (and **Validate Patterns** if you changed patterns).
2. Merge when green (squash).
3. On `main`: **CI** always; **Deploy Docs** / **Validate Patterns** only if paths match; ignore **Release**.
4. No npm publish on normal merges.

## How to ship a version

### 1. Create a draft release

1. **Actions → Release Draft → Run workflow**
2. Branch: `main`
3. Bump: `patch` / `minor` / `major`
4. Optional: `dry_run` = true to preview the next tag

The workflow:

- Computes the next version from the latest `leash-secrets-v*` tag
- If `package.json` is behind, **bumps** `package.json`, `install.sh`, `CITATION.cff`, `vscode-extension/package.json`, manifest, and `CHANGELOG.md`, then **pushes** `chore: release X.Y.Z` to `main`
- Creates a **draft** release `leash-secrets-vX.Y.Z` + assets

If the push fails (branch protection), finish the org GitHub App + ruleset bypass steps above, then re-run. Without that, the workflow falls back to a `release/vX.Y.Z` branch (merge that to `main` manually, then delete the branch).

### 2. Publish the draft

1. **Releases** → open the draft  
2. Review notes/assets  
3. **Publish release**

Result: **Publish npm** runs and publishes `leash-secrets@X.Y.Z` (or no-ops if that version is already on npm).

### 3. If you only need npm

**Actions → Publish npm → Run workflow** — publishes whatever version is on the checked-out ref; skips cleanly if already published.

Optional local prep (still supported): `bash scripts/prepare-release.sh` if you prefer a version-bump PR before Release Draft.

## Branch protection (maintainer note)

`main` requires PRs and the CI status checks. Required **approving** reviews are set to **0** so the sole maintainer can merge their own PRs (GitHub never counts self-approvals). CI must still be green. Revisit if more maintainers join.

See also: [CONTRIBUTING.md](https://github.com/FasterApiWeb/leash-secrets/blob/main/CONTRIBUTING.md) (repo root) and [Development Setup](development.md).
