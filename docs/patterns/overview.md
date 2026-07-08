# Pattern Overview

Leash Secrets detects **71 secret types** across **11 provider categories** using specific regex patterns.

## Categories

### Cloud Providers

| Provider | Patterns | Key Types |
|----------|:--------:|-----------|
| [AWS](reference.md#aws) | 4 | Access Key ID, Secret Access Key, Session Token, MWS Key |
| [GCP](reference.md#gcp) | 4 | API Key, OAuth Client Secret, Service Account Key, Firebase Config |
| [Azure](reference.md#azure) | 4 | Storage Account Key, Client Secret, Connection String, SAS Token |

### Developer Platforms

| Provider | Patterns | Key Types |
|----------|:--------:|-----------|
| [GitHub & Git](reference.md#github) | 8 | PAT (classic + fine-grained), OAuth, App tokens, GitLab PAT, Bitbucket |
| [CI/CD](reference.md#ci-cd) | 8 | npm, PyPI, Docker Hub, Vercel, Netlify, Heroku, Terraform, CircleCI |

### AI & SaaS

| Provider | Patterns | Key Types |
|----------|:--------:|-----------|
| [AI Providers](reference.md#ai-providers) | 6 | OpenAI, Anthropic, Cohere, Hugging Face, Replicate |
| [Payments](reference.md#payments) | 6 | Stripe (live/test/webhook), PayPal, Square |
| [Messaging](reference.md#messaging) | 9 | Slack, Discord, Twilio, SendGrid, Mailgun, Telegram |

### Infrastructure

| Provider | Patterns | Key Types |
|----------|:--------:|-----------|
| [Databases](reference.md#databases) | 6 | PostgreSQL, MySQL, MongoDB, Redis, Supabase, PlanetScale |
| [Crypto](reference.md#crypto) | 7 | RSA, OpenSSH, EC, DSA, PGP private keys, PKCS12 passwords |
| [Generic](reference.md#generic) | 9 | Passwords, API keys, JWT secrets, Bearer tokens, encryption keys |

## Severity Levels

| Level | Icon | Count | Meaning |
|-------|:----:|:-----:|---------|
| Critical | 🔴 | 52 | Confirmed secret format. Agent blocks immediately. |
| Warning | 🟡 | 14 | Possible secret. Agent flags and asks for confirmation. |
| Info | 🟢 | 5 | Informational. Agent notes but doesn't block. |

## How Patterns Work

Each pattern is a JSON object with:

```json
{
  "id": "stripe-live-secret-key",
  "name": "Stripe Live Secret Key",
  "severity": "critical",
  "regex": "sk_live_[0-9a-zA-Z]{24,}",
  "description": "Stripe live-mode secret key",
  "risk": "Can create charges, refunds, transfer funds",
  "fix": "Use STRIPE_SECRET_KEY env var",
  "rotation_url": "https://dashboard.stripe.com/apikeys"
}
```

The agent reads the pattern library from `patterns/*.json` and checks code against each regex.

## Want to Add a Pattern?

See [Custom Patterns](custom-patterns.md) for how to add your own, or [open a pattern request](https://github.com/FasterApiWeb/leash-secrets/issues/new?template=new-pattern.yml) on GitHub.
