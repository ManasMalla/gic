#!/usr/bin/env bash
# Idempotent deploy of GIC (frontend + Deno backend + Postgres) to Google Cloud.
# Usage: deploy/deploy.sh            (run from the repo root, authenticated with `gcloud auth login`)
# Safe to re-run: existing resources are reused; secrets are generated once and never printed.
set -euo pipefail

PROJECT="${PROJECT:-gic-gitam}"
REGION="${REGION:-asia-south1}"
SQL="${SQL:-gic-db}"
REPO="${REPO:-gic}"
SA_NAME="gic-run"
SA="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
G="gcloud --project=${PROJECT} --quiet"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}"
TAG="$(date +%Y%m%d-%H%M%S)"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
rand() { openssl rand -base64 36 | tr -d '/+=\n' | cut -c1-40; }
retry() { # IAM is eventually consistent: a just-created service account may not be visible for ~a minute.
  local n=0; until "$@"; do n=$((n+1)); [ $n -ge 8 ] && return 1; echo "  retrying in 10s ($n/8)…"; sleep 10; done; }
secret_exists() { $G secrets describe "$1" >/dev/null 2>&1; }
ensure_secret() { # name, value-producing command (stdout) — created once, never overwritten
  if ! secret_exists "$1"; then printf '%s' "$2" | $G secrets create "$1" --replication-policy=automatic --data-file=- >/dev/null; echo "created secret $1"; else echo "secret $1 exists"; fi
}

log "Enable APIs"
$G services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com cloudbuild.googleapis.com compute.googleapis.com iam.googleapis.com

log "Service account + roles"
$G iam service-accounts describe "$SA" >/dev/null 2>&1 || $G iam service-accounts create "$SA_NAME" --display-name="GIC Cloud Run runtime"
for role in roles/cloudsql.client roles/secretmanager.secretAccessor; do
  retry $G projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:${SA}" --role="$role" --condition=None >/dev/null
done
# Cloud Build (default compute SA in new projects) must be able to push images and write logs.
PN="$($G projects describe "$PROJECT" --format='value(projectNumber)')"
for role in roles/artifactregistry.writer roles/logging.logWriter roles/storage.objectViewer; do
  $G projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:${PN}-compute@developer.gserviceaccount.com" --role="$role" --condition=None >/dev/null
done

log "Artifact Registry"
$G artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1 || \
  $G artifacts repositories create "$REPO" --repository-format=docker --location="$REGION" --description="GIC images"

log "Secrets"
ensure_secret gic-webhook-secret "$(rand)"
ensure_secret gic-internal-token "$(rand)"
ensure_secret gic-admin-token "$(rand)"
ensure_secret gic-db-password "$(rand)"

log "Cloud SQL (Postgres 16) — first creation takes ~5-10 min"
if ! $G sql instances describe "$SQL" >/dev/null 2>&1; then
  ROOT_PW="$(rand)"
  $G sql instances create "$SQL" --database-version=POSTGRES_16 --edition=ENTERPRISE --tier=db-f1-micro \
    --region="$REGION" --availability-type=zonal --storage-size=10 --storage-auto-increase \
    --backup-start-time=20:00 --deletion-protection --root-password="$ROOT_PW"
fi
$G sql databases describe gic --instance="$SQL" >/dev/null 2>&1 || $G sql databases create gic --instance="$SQL"
DB_PW="$($G secrets versions access latest --secret=gic-db-password)"
if $G sql users list --instance="$SQL" --format='value(name)' | grep -qx gic_app; then
  $G sql users set-password gic_app --instance="$SQL" --password="$DB_PW"
else
  $G sql users create gic_app --instance="$SQL" --password="$DB_PW"
fi
CONN="${PROJECT}:${REGION}:${SQL}"
# Cloud Run reaches Cloud SQL over a unix socket under /cloudsql/.
# The socket path comes from CLOUD_SQL_CONNECTION_NAME (see backend/src/db.ts); the host here is a placeholder.
DB_URL="postgres://gic_app:${DB_PW}@localhost/gic"
if secret_exists gic-database-url; then printf '%s' "$DB_URL" | $G secrets versions add gic-database-url --data-file=- >/dev/null; else printf '%s' "$DB_URL" | $G secrets create gic-database-url --replication-policy=automatic --data-file=- >/dev/null; fi

log "Build images (Cloud Build)"
$G builds submit backend --tag "${REGISTRY}/backend:${TAG}"
$G builds submit . --tag "${REGISTRY}/frontend:${TAG}" --ignore-file=.gcloudignore

log "Deploy backend"
$G run deploy gic-backend --image "${REGISTRY}/backend:${TAG}" --region "$REGION" --service-account "$SA" \
  --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --min-instances 0 --max-instances 5 \
  --add-cloudsql-instances "$CONN" --set-env-vars "CLOUD_SQL_CONNECTION_NAME=${CONN}" \
  --set-secrets "DATABASE_URL=gic-database-url:latest,GEVENTS_WEBHOOK_SECRETS=gic-webhook-secret:latest,INTERNAL_API_TOKEN=gic-internal-token:latest,ADMIN_API_TOKEN=gic-admin-token:latest"
BACKEND_URL="$($G run services describe gic-backend --region "$REGION" --format='value(status.url)')"

log "Deploy frontend"
$G run deploy gic-frontend --image "${REGISTRY}/frontend:${TAG}" --region "$REGION" --service-account "$SA" \
  --allow-unauthenticated --port 8080 --memory 1Gi --cpu 1 --min-instances 0 --max-instances 10 \
  --set-env-vars "BACKEND_URL=${BACKEND_URL},GEVENTS_REGISTRATION_URL=https://gevents.gitam.edu/registration/ODkyMg==" \
  --set-secrets "INTERNAL_API_TOKEN=gic-internal-token:latest"
FRONTEND_URL="$($G run services describe gic-frontend --region "$REGION" --format='value(status.url)')"

log "Done"
echo "backend : ${BACKEND_URL}"
echo "frontend: ${FRONTEND_URL}"
