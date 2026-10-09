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

### 2.1 Carry our reference through the payment (must have)

GIC creates an application reference such as `GIC26-2602BDFC` before redirecting. GEvents must:

1. Accept it on the registration URL as a query parameter, e.g. `…/registration/ODkyMg==?ref=GIC26-2602BDFC&track=junior`.
2. Store it against the GEvents registration/transaction.
3. Return it unchanged in every webhook for that payment.

*Fallback if (1) is not possible:* match on payer email + track; we would treat these as "needs manual review".

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
  "reference": "GIC26-2602BDFC",
  "registration": {
    "gevents_registration_id": "8922-004517",
    "event_id": "vYYd83Jo_20y3r9-V0QuaA",
    "track": "junior"
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

- `GET /api/payments?reference=GIC26-2602BDFC` → latest payment state + history
- `GET /api/payments?from=2026-10-01&to=2026-10-31&status=succeeded` → paged list
- Same field names as the webhook; authenticated with an API key (or the same HMAC scheme).
- Plus a **resend** capability: CATs (or an admin screen) can re-fire a webhook for a given `reference`.

### 2.8 Environments & testing

- A **sandbox/staging** GEvents event with test gateway keys that fires real webhooks to our staging URL.
- A way to trigger each event type (`succeeded`, `failed`, `refunded`) on demand.
- Fee amounts: Junior ₹499, Main ₹699 (per team). GIC flags any payment whose `amount` differs.

## 3. What GIC will do on receipt

1. Verify signature + timestamp; reject otherwise.
2. De-duplicate on `event_id`.
3. Look up application by `reference`; validate `amount` against the track's fee.
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

1. Can the registration URL accept a `ref` parameter (and `track`) today? If not, what is the lead time?
2. Which payment gateway is used, and are `gateway_order_id` / `gateway_payment_id` / UTR available at confirmation time?
3. Is GST applied to the fee? If so, is the `amount` inclusive, and is a GST invoice number available?
4. Can GEvents provide a staging event + sandbox gateway before the registration window closes?
5. Egress IP ranges for allow-listing?
6. Who is the on-call contact for failed deliveries during the window?
7. Refund policy: are refunds ever issued, and should GIC be able to request them?

## 6. Acceptance criteria

- [ ] Test payment on staging produces a signed `payment.succeeded` webhook carrying our `reference`.
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
