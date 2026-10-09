# GEvents → GIC: Payment Confirmation Webhook

**Status:** Draft v0.1 · 8 Oct 2026
**Audience:** CATs / GEvents team (provider) · GIC web team (consumer)
**Purpose:** When a team pays the registration fee on GEvents, GEvents notifies the GIC website so the team's application is marked **paid** automatically, with full payment details for records and reconciliation.

> **Note:** the payload, headers, signing scheme and retry policy below are a **proposal** written by the GIC team. We have not seen GEvents' current payment response. All gateway-specific values in the example (gateway name, `order_`/`pay_` ids, UTR, receipt format, registration id) are illustrative. CATs: if GEvents already emits a callback, send us a sample and we will adapt our receiver.

---

## 1. Background

The GIC website (new) owns the application: team, idea, pitch deck, accounts. GEvents only collects the fee. Today there is no way for GIC to know a payment happened, so we need GEvents to tell us.

```
Team ──fills application──▶ GIC site ──redirect (with ref)──▶ GEvents ──pays──▶ Gateway
                                ▲                                  │
                                └────── webhook: payment result ───┘
```

## 2. Requirements for CATs

### 2.1 Identify the team: the founder's email, encrypted in the URL (must have)

We do **not** send an application reference. Instead the team lead's (founder's) email and the track travel to GEvents in
**one encrypted URL parameter**, `data`, so no personal data is readable in the URL, browser history or access logs:

```
https://gevents.gitam.edu/registration/ODkyMg==?data=v1.I4-CR28FM3IiDmnP.-JBu8vmhqAEiVYCJWXPv…
```

GEvents must:

1. **Keep the founder email on the registration** (pre-filled from `data`, see below, or collected on the form) and send it
   back in every webhook as **`payer.email`**. This is what we match on. It must be the *team lead's* email as entered on
   our site, so if the form lets the payer change it, please also send the original in `registration.data` (point 3).
2. Send the **track** as `registration.track` (`junior` / `main`) if you have it.
3. *(Strongly preferred)* Store the raw `data` value and echo it back unchanged in the webhook as **`registration.data`**.
   It is authenticated encryption, so if present we trust its email/track even when the payer typed something else.
4. *(Optional)* **Decrypt `data` yourself to pre-fill the founder email and lock the track/fee.** This needs the shared key,
   which we give you over a secure channel (never email). Format below.

**`data` format** (AES-256-GCM)

```
data      = "v1." + base64url(iv, 12 bytes) + "." + base64url(ciphertext || authTag, tag = last 16 bytes)
plaintext = JSON {"e": "<founder email, lower-case>", "t": "junior" | "main", "iat": <unix seconds>}
AAD       = "gic-pay-v1"
key       = 32 random bytes, shared with you as standard base64
```
Tokens are valid for 14 days from `iat`. Every token is different (random IV), even for the same team.

**PHP example** (PHP ≥ 7.1; GEvents runs PHP 7.4):

```php
function b64url_decode(string $s): string {
    return base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4));
}

/** Returns ['e' => email, 't' => track, 'iat' => int] or null when the token is invalid/tampered. */
function gic_decrypt_data(string $token, string $keyB64): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3 || $parts[0] !== 'v1') return null;
    $iv  = b64url_decode($parts[1]);
    $raw = b64url_decode($parts[2]);
    if (strlen($iv) !== 12 || strlen($raw) < 17) return null;
    $tag = substr($raw, -16);
    $ct  = substr($raw, 0, -16);
    $plain = openssl_decrypt($ct, 'aes-256-gcm', base64_decode($keyB64), OPENSSL_RAW_DATA, $iv, $tag, 'gic-pay-v1');
    if ($plain === false) return null;
    $o = json_decode($plain, true);
    return is_array($o) && isset($o['e'], $o['t']) ? $o : null;
}
```

*If none of this is possible:* send `payer.email` and `payment.amount`; we will still match when exactly one awaiting application
fits that email + fee, and put anything ambiguous in a manual-review queue.

### 2.2 Endpoint we provide

| | |
|---|---|
| URL | `POST https://gic.gitam.edu/api/webhooks/gevents/payment` (staging URL to be shared) |
| Content-Type | `application/json; charset=utf-8` |
| Transport | HTTPS, TLS 1.2+ |
| Success response | `200 OK` with `{"status":"ok"}` within **5 s** |

### 2.3 Events to send

| `event_type` | When |
|---|---|
| `payment.succeeded` | Gateway confirms money received (**required**) |
| `payment.failed` | Payment failed / cancelled / expired (**required**) |
| `payment.refunded` | Full or partial refund issued (**required**, even if rare) |

Send exactly one event per state change. Do **not** send `payment.succeeded` on redirect-back from the gateway alone; only after server-side gateway confirmation.

### 2.4 Payload (v1)

```json
{
  "event_id": "evt_01JAB3X9K2",
  "event_type": "payment.succeeded",
  "api_version": "1",
  "occurred_at": "2026-10-09T14:32:10+05:30",
  "registration": {
    "gevents_registration_id": "8922-004517",
    "event_id": "vYYd83Jo_20y3r9-V0QuaA",
    "track": "junior",
    "data": "v1.I4-CR28FM3IiDmnP.-JBu8vmhqAEiVYCJWXPv…"
  },
  "payment": {
    "status": "succeeded",
    "transaction_id": "GEV-2026-00098123",
    "gateway": "razorpay",
    "gateway_order_id": "order_Nx12abC34",
    "gateway_payment_id": "pay_Nx12abC99",
    "amount": 49900,
    "currency": "INR",
    "tax_amount": 0,
    "fee_amount": 0,
    "method": "upi",
    "paid_at": "2026-10-09T14:32:08+05:30",
    "bank_reference": "UTR123456789012",
    "receipt_number": "RCPT-2026-1234",
    "receipt_url": "https://gevents.gitam.edu/receipts/RCPT-2026-1234.pdf",
    "failure_code": null,
    "failure_reason": null
  },
  "payer": {
    "name": "Asha Test",
    "email": "asha@example.com",
    "phone": "9876543210"
  },
  "refund": null
}
```

Field rules:

- `payer.email`: **required**: the team lead's email (see 2.1). It is our primary match key.
- `registration.data`: the `data` URL parameter echoed back unchanged (optional but strongly preferred).
- `amount`, `tax_amount`, `fee_amount`: **integers in paise** (₹499 → `49900`). No floats.
- All timestamps ISO-8601 with offset.
- For `payment.refunded`, populate `refund`: `{ "refund_id", "amount", "reason", "refunded_at" }`.
- For `payment.failed`, set `failure_code` / `failure_reason`.
- New fields may be added later; consumers ignore unknown fields. Breaking changes bump `api_version`.

### 2.5 Authentication & integrity (must have)

Each request carries:

```
X-GEvents-Timestamp: 1791556330          (unix seconds)
X-GEvents-Signature: sha256=<hex>
```

`signature = HMAC_SHA256(shared_secret, timestamp + "." + raw_request_body)`

- GIC rejects requests whose timestamp is more than **5 minutes** off (replay protection) or whose signature does not match (constant-time compare).
- The shared secret is exchanged out-of-band (never by email in plain text), separate for staging and production, and rotatable (two active secrets during rotation).
- Optional: GEvents publishes its egress IP ranges so GIC can allow-list.

### 2.6 Delivery guarantees

- **At-least-once.** GIC de-duplicates on `event_id`; duplicates get `200`.
- **Retries** on any non-2xx or timeout: exponential backoff, e.g. 1 min, 5 min, 30 min, 2 h, 6 h, 12 h (≈24 h total), then mark as failed and alert CATs.
- **No ordering guarantee**; GIC orders by `occurred_at`.
- GIC returns `4xx` only for permanent errors (bad signature, malformed body); GEvents should not retry `400/401/403` more than once.

### 2.7 Pull API for reconciliation (should have)

So we can recover from missed webhooks:

- `GET /api/payments?email=founder@example.com` → latest payment state + history for that team lead
- `GET /api/payments?from=2026-10-01&to=2026-10-31&status=succeeded` → paged list
- Same field names as the webhook; authenticated with an API key (or the same HMAC scheme).
- Plus a **resend** capability: CATs (or an admin screen) can re-fire a webhook for a given `event_id` / transaction id.

### 2.8 Environments & testing

- A **sandbox/staging** GEvents event with test gateway keys that fires real webhooks to our staging URL.
- A way to trigger each event type (`succeeded`, `failed`, `refunded`) on demand.
- Fee amounts: Junior ₹499, Main ₹699 (per team). GIC flags any payment whose `amount` differs.

## 3. What GIC will do on receipt

1. Verify signature + timestamp; reject otherwise.
2. De-duplicate on `event_id`.
3. Match the payment to an application, strongest signal first:
   (a) a transaction id we have already seen (refunds/follow-ups);
   (b) the decrypted `registration.data` token, if echoed back;
   (c) the **founder's email** (`payer.email`) with the same track and exact fee, when exactly **one** awaiting application fits;
   (d) any team member's / account owner's email under the same conditions.
   Anything ambiguous, a wrong amount/track, or a second payment for an already-paid application goes to a manual-review
   queue and is **never** auto-marked paid. Validate `amount` against the track's fee.
4. Persist the full payment record (append-only).
5. `succeeded` → mark application **paid**, email the team a confirmation + receipt link.
   `failed` → keep **awaiting payment**, let the team retry.
   `refunded` → mark **refunded** and notify admins.
6. Respond `200` quickly; heavy work runs asynchronously.

## 4. Non-functional requirements

| | Target |
|---|---|
| Delivery latency | < 30 s from gateway confirmation (p95) |
| Availability of GIC endpoint | 99.5 % during registration window; retries cover downtime |
| Logging | CATs keep webhook delivery logs (request, response code, attempts) ≥ 90 days |
| Security | Secrets in a vault; no card/UPI credentials ever included in payloads |
| Data protection | Payer PII only as listed above; retained per GITAM policy |

## 5. Open questions for CATs

1. Can the registration page read an extra `data` URL parameter, keep it on the registration, and return the founder email as `payer.email` (and ideally echo `data`)? Do you want the decryption key to pre-fill the email? If not, what is the lead time?
2. Which payment gateway is used, and are `gateway_order_id` / `gateway_payment_id` / UTR available at confirmation time?
3. Is GST applied to the fee? If so, is the `amount` inclusive, and is a GST invoice number available?
4. Can GEvents provide a staging event + sandbox gateway before the registration window closes?
5. Egress IP ranges for allow-listing?
6. Who is the on-call contact for failed deliveries during the window?
7. Refund policy: are refunds ever issued, and should GIC be able to request them?

## 6. Acceptance criteria

- [ ] Test payment on staging produces a signed `payment.succeeded` webhook whose `payer.email` is the founder email we sent, and (ideally) `registration.data` echoing our token.
- [ ] A payment made with the founder email typed in different letter-case/spacing still matches.
- [ ] Two test teams sharing a teammate email are not mixed up (the founder's application is chosen).
- [ ] Failed and refunded test payments produce the matching events.
- [ ] Bad signature and stale timestamp are rejected by GIC.
- [ ] Re-delivery of the same `event_id` does not double-process.
- [ ] Killing the GIC endpoint for 10 minutes results in successful retried delivery afterwards.
- [ ] Reconciliation pull for a date range matches webhook history 1:1.

## 7. Timeline (proposed)

| Milestone | Owner | Target |
|---|---|---|
| Agree contract (this doc) | CATs + GIC | _TBD_ |
| `ref` pass-through on GEvents | CATs | _TBD_ |
| Staging webhook live | CATs | _TBD_ |
| GIC consumer + end-to-end test | GIC | _TBD_ |
| Production cut-over | Both | before registration window closes |

## 8. Debugging: what we log

For every call to the webhook endpoint (accepted or rejected, logged **before** signature verification) our logs record the
HTTP method/path, client IP, **all request headers** (our own credentials are redacted), the security headers
(`x-gevents-signature`, `x-gevents-timestamp` and the clock skew in seconds), the body size, its SHA-256 and the **full JSON
payload**. A rejected signature also logs hints such as "timestamp looks like milliseconds", "signature not 64 hex chars" or
"timestamp is N seconds away from now". This lets us diagnose integration problems quickly; send us the approximate time of a
test call and the `event_id`. The logs contain payer email/phone; access is limited to project owners and retention is the
Google Cloud Logging default (30 days). Verbose payload logging can be switched off with `WEBHOOK_DEBUG_LOG=false`.
