**To:** CATs team
**Subject:** GIC 2026 — payment confirmation webhook, GEvents change request, and gic.gitam.edu domain cut-over

Hi team,

Thanks for the discussion on the GIC website. As agreed, we have rebuilt the site and the registration flow, and GEvents will remain the place where the registration fee is paid. To make this work end-to-end we need three things from CATs. Details below; the full webhook specification is attached (`gevents-payment-webhook.md`).

---

## 1. How the flow will work

1. A team completes its application on gic.gitam.edu (team, idea, pitch deck, members). We store it against the team lead's (founder's) email.
2. We send the team to the GEvents registration page to pay (Junior ₹499 / Main ₹699 per team). The URL carries the founder's email and the track in **one encrypted parameter**, `data` (so nothing personal is readable in the URL).
3. When the payment result is known, **GEvents calls our webhook** with the payment details.
4. We match the payment to the application using the **founder's email** from the webhook, mark it paid and email the team.

## 2. Request: payment confirmation webhook (GEvents → GIC)

Please send a server-to-server HTTPS `POST` to us for each payment outcome.

| | |
|---|---|
| **Test endpoint (available now)** | `https://gic-backend-202817596039.asia-south1.run.app/api/webhooks/gevents/payment` |
| **Production endpoint** | `https://gic.gitam.edu/api/webhooks/gevents/payment` (live once DNS is switched, see section 4) |
| **Method / format** | `POST`, `application/json; charset=utf-8` |
| **Expected response** | `200` with `{"status":"ok"}` within 5 seconds |

**Events:** `payment.succeeded`, `payment.failed`, `payment.refunded`. Please send `succeeded` only after server-side confirmation from the payment gateway, not on the browser redirect.

**Payload (summary):** `event_id` (unique), `event_type`, `occurred_at` (ISO-8601 with offset), `registration` (GEvents registration id, event id, track, and, if you can, our `data` value echoed back unchanged as `registration.data`), `payment` (transaction id, gateway order/payment ids, `amount` in **paise** as an integer, currency, tax, method, paid time, bank/UTR reference, receipt number and URL, failure reason), `payer` (name, **email = the team lead's email**, phone), `refund` (for refunds). A complete example is in the attachment.

**Security:** every request carries
`X-GEvents-Timestamp: <unix seconds>` and `X-GEvents-Signature: sha256=<hex>`, where the signature is `HMAC_SHA256(shared_secret, timestamp + "." + raw_request_body)`. We reject anything with a bad signature or a timestamp more than 5 minutes old. We will share the secret **through a secure channel (not by email)**, with separate secrets for test and production.

**Delivery:** at-least-once; we de-duplicate on `event_id`, so retries are safe. Please retry on any non-2xx or timeout with exponential backoff (about 1 min, 5 min, 30 min, 2 h, 6 h, 12 h). If an event can't be matched to an application we still answer `200` and handle it manually, so you will not see errors for that.

**Also helpful (second priority):**
- A read-only lookup API for reconciliation, e.g. by founder email or by date range.
- A way for your team to re-send a webhook for a given event or transaction id.
- A sandbox/staging GEvents event with test gateway keys that can trigger each of the three event types.

> **Important:** the payload in the attachment is our **proposal**, since we have not seen GEvents' current payment response. If GEvents already sends a callback in a different format, please send us a sample and we will adapt on our side.

## 3. Request: changes on the GEvents registration page

1. **Read the extra `data` URL parameter** and keep it with the registration/transaction, e.g.
   `https://gevents.gitam.edu/registration/ODkyMg==?data=v1.I4-CR28FM3IiDmnP.-JBu8vmhqAEiVYCJWXPv…`
   It is AES-256-GCM encrypted (founder email + track). **Echo it back unchanged** as `registration.data` in the webhook (strongly preferred).
2. **Send the founder's email back as `payer.email`.** This is what we match on, so it must be the team lead's email. If your form lets the payer type a different one, please also keep the original via the echoed `data`.
3. *(Optional)* **Pre-fill the founder email and lock the track/fee** by decrypting `data` with a shared key (we send the key through a secure channel, never by email). The format and a ready-to-use **PHP snippet** are in the attached specification (section 2.1).
4. **Return the user to us after payment** (nice to have): redirect to `https://gic.gitam.edu/register/payment-status` on success or failure (the page works out who they are from their sign-in).
5. **Questions we need answered:**
   - Which payment gateway is used, and are gateway order/payment ids and the bank (UTR) reference available at confirmation time?
   - Is GST applied to the fee? If so, is the amount inclusive, and is an invoice/receipt number generated?
   - Do you issue refunds, and under what conditions?
   - What are GEvents' outbound IP addresses (so we can allow-list them)?
   - Who is the on-call contact for failed deliveries during the registration window?

## 4. Request: pointing gic.gitam.edu at the new site

The site is deployed on Google Cloud behind a Google HTTPS load balancer with a static IP address. To go live on the existing domain we need CATs to make DNS changes, since the domain is under GITAM's control.

**DNS records**

| Type | Name | Value | Notes |
|---|---|---|---|
| `A` | `gic.gitam.edu` | **`8.232.42.155`** | Replaces the current record that points to the old server |
| `CAA` | `gitam.edu` (or `gic.gitam.edu`) | Only needed if you already publish CAA records: please allow `pki.goog` (Google Trust Services) and `letsencrypt.org` | Otherwise the certificate cannot be issued |

**Certificate:** a Google-managed TLS certificate for `gic.gitam.edu` is already requested. It is issued automatically **after** the A record resolves to the IP above, usually within 15–60 minutes. Nothing needs to be installed on your side. HTTP is redirected to HTTPS.

**Suggested cut-over plan**
1. **Now:** lower the TTL of the current `gic.gitam.edu` record to 300 seconds (ideally 24 h before the switch).
2. We confirm the new site works on the temporary Google URL `https://gic-frontend-202817596039.asia-south1.run.app` and run a test payment on the GEvents staging event.
3. **Switch day:** CATs changes the `A` record to `8.232.42.155`. We confirm the certificate becomes `ACTIVE` and test the site and the webhook on the real domain.
4. **Rollback:** if anything is wrong, restore the previous `A` record. The old server should be kept running, unchanged, for at least 7 days after the switch.
5. After the cut-over, `https://gic.gitam.edu/api/webhooks/gevents/payment` becomes the production webhook URL.

**Please also confirm:**
- Are there other hostnames that should redirect to the new site (e.g. `www.gic.gitam.edu`, old paths such as `/pdf/…`)? We have kept the same PDFs and the registration link.
- Is a Cloudflare/WAF or any other proxy in front of the current `gic.gitam.edu`? If so, it must be removed or configured to pass `/api/webhooks/*` through untouched.

## 5. Proposed next steps

| Step | Owner |
|---|---|
| Review this email and the attached spec; answer the questions in section 3 | CATs |
| Share secrets via a secure channel; share a sample of the current GEvents payment callback, if one exists | GIC and CATs |
| `ref` parameter on the registration page + staging webhook | CATs |
| End-to-end test on staging (success, failure, refund, duplicate delivery) | Both |
| DNS switch to `8.232.42.155` | CATs |
| Production verification | Both |

We would like to complete the integration testing **before the registration window closes**, so a call this week would help us fix dates. Please let us know a good time.

Thanks,
Manas Malla
GIC web team

*Attachment: `gevents-payment-webhook.md` (full specification, example payload, acceptance criteria)*
