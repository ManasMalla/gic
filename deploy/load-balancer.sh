#!/usr/bin/env bash
# Puts gic-frontend and gic-backend behind ONE global HTTPS load balancer on a static IP,
# so https://gic.gitam.edu serves the site and routes /api/webhooks/* + /api/admin/* to the backend.
# Idempotent. Run after deploy/deploy.sh. The managed certificate only becomes ACTIVE once DNS for
# the domain points at the printed IP (CATs own that DNS record).
set -euo pipefail

PROJECT="${PROJECT:-gic-gitam}"
REGION="${REGION:-asia-south1}"
DOMAIN="${DOMAIN:-gic.gitam.edu}"
G="gcloud --project=${PROJECT} --quiet"
log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
exists() { "$@" >/dev/null 2>&1; }

log "Static IP"
exists $G compute addresses describe gic-ip --global || $G compute addresses create gic-ip --global --ip-version=IPV4
IP="$($G compute addresses describe gic-ip --global --format='value(address)')"

log "Serverless NEGs + backend services"
for svc in frontend backend; do
  exists $G compute network-endpoint-groups describe "gic-${svc}-neg" --region="$REGION" || \
    $G compute network-endpoint-groups create "gic-${svc}-neg" --region="$REGION" \
      --network-endpoint-type=serverless --cloud-run-service="gic-${svc}"
  exists $G compute backend-services describe "gic-${svc}-bs" --global || {
    $G compute backend-services create "gic-${svc}-bs" --global --load-balancing-scheme=EXTERNAL_MANAGED
    $G compute backend-services add-backend "gic-${svc}-bs" --global \
      --network-endpoint-group="gic-${svc}-neg" --network-endpoint-group-region="$REGION"
  }
done

log "URL map (default → website; /api/webhooks/* and /api/admin/* → backend)"
if ! exists $G compute url-maps describe gic-urlmap; then
  $G compute url-maps create gic-urlmap --default-service=gic-frontend-bs
  $G compute url-maps add-path-matcher gic-urlmap --path-matcher-name=gic-paths \
    --default-service=gic-frontend-bs \
    --backend-service-path-rules="/api/webhooks/*=gic-backend-bs,/api/admin/*=gic-backend-bs" \
    --new-hosts="$DOMAIN"
fi

log "Managed certificate for ${DOMAIN}"
exists $G compute ssl-certificates describe gic-cert --global || \
  $G compute ssl-certificates create gic-cert --global --domains="$DOMAIN"

log "HTTPS proxy + forwarding rule (443)"
exists $G compute target-https-proxies describe gic-https-proxy || \
  $G compute target-https-proxies create gic-https-proxy --url-map=gic-urlmap --ssl-certificates=gic-cert
exists $G compute forwarding-rules describe gic-https --global || \
  $G compute forwarding-rules create gic-https --global --load-balancing-scheme=EXTERNAL_MANAGED \
    --address=gic-ip --target-https-proxy=gic-https-proxy --ports=443

log "HTTP → HTTPS redirect (80)"
if ! exists $G compute url-maps describe gic-redirect; then
  cat > /tmp/gic-redirect.yaml <<'YAML'
name: gic-redirect
defaultUrlRedirect:
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
  httpsRedirect: true
YAML
  $G compute url-maps import gic-redirect --global --source=/tmp/gic-redirect.yaml
fi
exists $G compute target-http-proxies describe gic-http-proxy || \
  $G compute target-http-proxies create gic-http-proxy --url-map=gic-redirect
exists $G compute forwarding-rules describe gic-http --global || \
  $G compute forwarding-rules create gic-http --global --load-balancing-scheme=EXTERNAL_MANAGED \
    --address=gic-ip --target-http-proxy=gic-http-proxy --ports=80

log "Done"
echo "Static IP for DNS (A record ${DOMAIN}) : ${IP}"
echo "Certificate status: $($G compute ssl-certificates describe gic-cert --global --format='value(managed.status)')"
