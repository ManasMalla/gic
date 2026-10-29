"use client";

import { useEffect } from "react";
import { clearStoredReferral, readStoredReferral, REFERRAL_PARAMS, REFERRAL_PATTERN, storeReferral } from "@/lib/referral";

/**
 * Keeps a referral code from being lost on the way to registration.
 *  1. Landing on /?utm=CODE (or ?ref= / ?referral=) stores the code in localStorage. The first one wins.
 *  2. If the visitor is signed in, the stored code is linked to their account on the server, then dropped from the browser.
 *     Signed out, it stays put and is linked on the first page they open after signing in.
 * The registration form is prefilled from the account (or, before the link has landed, from localStorage).
 */
export function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const name of REFERRAL_PARAMS) {
      const value = params.get(name)?.trim();
      if (value && REFERRAL_PATTERN.test(value)) {
        if (!readStoredReferral()) storeReferral(value.toUpperCase());
        break;
      }
    }

    const code = readStoredReferral();
    if (!code) return;
    fetch("/api/me/referral", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) })
      .then((res) => {
        // 401 = not signed in yet: keep the code. Any answer from the server means it has been dealt with (linked, already
        // had a better one, or invalid), so it can go.
        if (res.ok) clearStoredReferral();
      })
      .catch(() => { /* offline: try again on the next page load */ });
  }, []);

  return null;
}
