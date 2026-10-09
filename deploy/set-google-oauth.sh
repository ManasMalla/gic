#!/usr/bin/env bash
# Stores the Google OAuth client (created by hand in the Cloud Console) and generates the session-signing key.
# Usage: deploy/set-google-oauth.sh            (prompts; the secret is not echoed or kept in shell history)
set -euo pipefail
PROJECT="${PROJECT:-gic-gitam}"
G="gcloud --project=${PROJECT} --quiet"

put() { # name value — creates the secret, or adds a new version if it exists
  if $G secrets describe "$1" >/dev/null 2>&1; then printf '%s' "$2" | $G secrets versions add "$1" --data-file=- >/dev/null
  else printf '%s' "$2" | $G secrets create "$1" --replication-policy=automatic --data-file=- >/dev/null; fi
  echo "stored $1"
}

read -r -p "Google OAuth Client ID: " CID
read -r -s -p "Google OAuth Client secret (hidden): " CSECRET; echo
put gic-google-client-id "$CID"
put gic-google-client-secret "$CSECRET"
# Session key is generated once; rotating it signs every user out.
if ! $G secrets describe gic-session-secret >/dev/null 2>&1; then put gic-session-secret "$(openssl rand -base64 48 | tr -d '\n')"; else echo "gic-session-secret exists (kept)"; fi
