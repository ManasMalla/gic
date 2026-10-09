import "server-only";

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const googleConfigured = () => !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

/**
 * Local-only shortcut that signs in any email without Google, so the whole flow can be tested.
 * Hard-disabled on Cloud Run (K_SERVICE is always set there) even if the flag is set by mistake.
 */
export const devLoginEnabled = () => process.env.AUTH_DEV_LOGIN === "true" && !process.env.K_SERVICE;
