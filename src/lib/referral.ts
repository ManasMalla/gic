/** Where a visitor's referral code is kept in the browser, and which link parameters carry it. Client-side only. */
export const REFERRAL_KEY = "gic_referral";
/** https://gic.gitam.edu/?utm=CODE is the link we hand out; ref and referral are accepted too. */
export const REFERRAL_PARAMS = ["utm", "ref", "referral"] as const;
export const REFERRAL_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;

export const readStoredReferral = (): string | null => {
  try {
    return window.localStorage.getItem(REFERRAL_KEY);
  } catch {
    return null; // storage can be blocked (private mode, cleared site data)
  }
};
export const storeReferral = (code: string) => {
  try {
    window.localStorage.setItem(REFERRAL_KEY, code);
  } catch { /* the account link below still works once they sign in on the same visit */ }
};
export const clearStoredReferral = () => {
  try {
    window.localStorage.removeItem(REFERRAL_KEY);
  } catch { /* nothing to clear */ }
};
