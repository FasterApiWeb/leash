# Test fixture: Python file with intentionally exposed secrets (all fake)
# Used for testing leash-secrets pattern detection

import os
import stripe
import boto3
import openai

# Stripe live key (FAKE — for testing only)
stripe.api_key = "sk_live_" + "51H7mKjG8z4x9vRnC3yT5qW2bA0xF6pL8dM1nO4kJ7sE9iU"

# AWS credentials (FAKE — for testing only)
AWS_ACCESS_KEY_ID = "AKIAI44QH8DHBEXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# OpenAI key (FAKE — for testing only)
openai.api_key = "sk-proj-" + "a" * 80

# Database connection string (FAKE — for testing only)
DATABASE_URL = "postgres://admin:SuperSecretPass123@prod-db.example.internal:5432/myapp"

# JWT secret (FAKE — for testing only)
JWT_SECRET = "my-super-secret-jwt-signing-key-that-is-very-long"

# GitHub PAT (FAKE — for testing only)
GITHUB_TOKEN = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef12"

# Slack bot token (FAKE — for testing only)
SLACK_TOKEN = "xoxb-" + "1234567890123-1234567890123-ABCDEFGHIJKLMNOPQRSTUVwx"

# Password in config (FAKE — for testing only)
password = "ThisIsMyProductionPassword123!"

# Bearer token in header (FAKE — for testing only)
headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.FAKE_TOKEN_FOR_TESTING"}
