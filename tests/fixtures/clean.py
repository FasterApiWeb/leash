# Test fixture: Python file with NO secrets (clean code)
# Used for testing leash-secrets false positive rates

import os
import stripe
import boto3

# Correct: using environment variables
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

# Correct: using environment variables
session = boto3.Session(
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
)

# Correct: using environment variables
DATABASE_URL = os.environ["DATABASE_URL"]

# Correct: test key (safe to have in code)
STRIPE_TEST_KEY = "sk_test_" + "4eC39HqLyjWDarjtT1zdp7dc"

# Correct: placeholder value
API_KEY = "your-api-key-here"

# Correct: public key (not a secret)
PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq..."

# Correct: hash digest (not a secret)
CONTENT_HASH = "sha256:abc123def456789..."

# Correct: UUID (not a secret)
SESSION_ID = "550e8400-e29b-41d4-a716-446655440000"
