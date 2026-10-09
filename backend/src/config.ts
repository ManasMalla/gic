/** All configuration comes from environment variables (12-factor). Fails fast when something is missing. */
function required(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const config = {
  port: Number(Deno.env.get("PORT") ?? 8080),
  databaseUrl: required("DATABASE_URL"),
  /** Shared with GEvents/CATs. Comma-separated to allow rotation (all listed secrets are accepted). */
  webhookSecrets: required("GEVENTS_WEBHOOK_SECRETS").split(",").map((s) => s.trim()).filter(Boolean),
  /**
   * On Cloud Run, Cloud SQL is reached through a unix socket at /cloudsql/<project:region:instance>.
   * When set, it overrides the host in DATABASE_URL (which then only supplies user/password/database).
   */
  cloudSqlConnectionName: Deno.env.get("CLOUD_SQL_CONNECTION_NAME") ?? null,
  cloudSqlSocketDir: Deno.env.get("CLOUD_SQL_SOCKET_DIR") ?? "/cloudsql",
  /** Used by the Next.js server to call this API. */
  internalToken: required("INTERNAL_API_TOKEN"),
  /** Used by organisers for the review queue. */
  adminToken: required("ADMIN_API_TOKEN"),
  /** Reject webhooks whose timestamp is further than this from now. */
  replayWindowSeconds: Number(Deno.env.get("WEBHOOK_REPLAY_WINDOW_SECONDS") ?? 300),
  maxDeckBytes: 10 * 1024 * 1024,
  /** No NEW applications after this (existing ones can still pay). Env: REGISTRATION_DEADLINE (ISO-8601). */
  registrationDeadline: new Date(Deno.env.get("REGISTRATION_DEADLINE") ?? "2026-10-31T23:59:59+05:30"),
  /** Paid teams can edit their idea until this moment. Env: IDEA_EDIT_DEADLINE (ISO-8601). */
  ideaEditDeadline: new Date(Deno.env.get("IDEA_EDIT_DEADLINE") ?? "2026-10-31T23:59:59+05:30"),
};
