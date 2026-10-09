#!/usr/bin/env bash
# Rebuild + redeploy ONE service, leaving the other untouched.
#   deploy/redeploy.sh backend              build backend image, deploy gic-backend
#   deploy/redeploy.sh frontend             build frontend image, deploy gic-frontend
#   deploy/redeploy.sh frontend --no-build  deploy the newest frontend image already in Artifact Registry
# Infrastructure (Cloud SQL, secrets, IAM) is created once by deploy/deploy.sh.
set -euo pipefail

TARGET="${1:?usage: redeploy.sh backend|frontend [--no-build]}"
BUILD=1; [ "${2:-}" = "--no-build" ] && BUILD=0

PROJECT="${PROJECT:-gic-gitam}"; REGION="${REGION:-asia-south1}"; SQL="${SQL:-gic-db}"; REPO="${REPO:-gic}"
SA="gic-run@${PROJECT}.iam.gserviceaccount.com"
G="gcloud --project=${PROJECT} --quiet"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}"
CONN="${PROJECT}:${REGION}:${SQL}"
log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

image_for() { # build a fresh image, or reuse the newest existing one
  local svc="$1" ctx="$2"; shift 2
  if [ "$BUILD" = 1 ]; then
    local tag; tag="$(date +%Y%m%d-%H%M%S)"
    log "Build ${svc} image" >&2
    $G builds submit "$ctx" --tag "${REGISTRY}/${svc}:${tag}" "$@" >&2
    echo "${REGISTRY}/${svc}:${tag}"
  else
    local tag; tag="$($G artifacts docker images list "${REGISTRY}/${svc}" --include-tags --sort-by=~UPDATE_TIME --limit=1 --format='value(tags)' | cut -d, -f1)"
    [ -n "$tag" ] || { echo "no existing ${svc} image found" >&2; exit 1; }
    echo "reusing ${REGISTRY}/${svc}:${tag}" >&2
    echo "${REGISTRY}/${svc}:${tag}"
  fi
}

case "$TARGET" in
  backend)
    IMG="$(image_for backend backend)"
    log "Deploy backend"
    $G run deploy gic-backend --image "$IMG" --region "$REGION" --service-account "$SA" \
      --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --min-instances 0 --max-instances 5 \
      --add-cloudsql-instances "$CONN" --set-env-vars "CLOUD_SQL_CONNECTION_NAME=${CONN}" \
      --set-secrets "DATABASE_URL=gic-database-url:latest,GEVENTS_WEBHOOK_SECRETS=gic-webhook-secret:latest,INTERNAL_API_TOKEN=gic-internal-token:latest,ADMIN_API_TOKEN=gic-admin-token:latest"
    ;;
  frontend)
    IMG="$(image_for frontend . --ignore-file=.gcloudignore)"
    BACKEND_URL="$($G run services describe gic-backend --region "$REGION" --format='value(status.url)')"
    log "Deploy frontend (backend = ${BACKEND_URL})"
    # Secrets that exist get attached. Google sign-in stays "not configured" until deploy/set-google-oauth.sh has been run;
    # re-run `deploy/redeploy.sh frontend --no-build` afterwards to attach them.
    SECRETS="INTERNAL_API_TOKEN=gic-internal-token:latest,SESSION_SECRET=gic-session-secret:latest"
    for pair in "GOOGLE_CLIENT_ID=gic-google-client-id" "GOOGLE_CLIENT_SECRET=gic-google-client-secret"; do
      $G secrets describe "${pair#*=}" >/dev/null 2>&1 && SECRETS="${SECRETS},${pair}:latest" || echo "NOTE: secret ${pair#*=} missing, Google sign-in will be disabled"
    done
    # Origins allowed to start/finish sign-in (must match the redirect URIs registered with Google).
    ORIGINS="${APP_ALLOWED_ORIGINS:-https://gic.gitam.edu,https://gic-frontend-xp4aseqcvq-el.a.run.app,https://gic-frontend-202817596039.asia-south1.run.app}"
    # `^#^` makes `#` the separator between KEY=VALUE pairs, so commas inside a value are safe.
    $G run deploy gic-frontend --image "$IMG" --region "$REGION" --service-account "$SA" \
      --allow-unauthenticated --port 8080 --memory 1Gi --cpu 1 --min-instances 0 --max-instances 10 \
      --set-env-vars "^#^BACKEND_URL=${BACKEND_URL}#GEVENTS_REGISTRATION_URL=https://gevents.gitam.edu/registration/ODkyMg==#APP_ALLOWED_ORIGINS=${ORIGINS}" \
      --set-secrets "$SECRETS"
    ;;
  *) echo "unknown target: $TARGET" >&2; exit 2 ;;
esac

log "Done"
$G run services describe "gic-${TARGET}" --region "$REGION" --format='value(status.url)'
