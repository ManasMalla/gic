import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";
import { config } from "./config.ts";

/** Connection settings from DATABASE_URL; on Cloud Run the host becomes the Cloud SQL unix-socket directory. */
function poolConfig(): pg.PoolConfig {
  let u: URL;
  try {
    u = new URL(config.databaseUrl);
  } catch {
    // Never let the parser's message through: it embeds the full URL, including the password.
    throw new Error("DATABASE_URL could not be parsed (value redacted)");
  }
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.slice(1)),
    // node-postgres treats a host starting with "/" as a socket directory and appends `.s.PGSQL.5432`.
    host: config.cloudSqlConnectionName ? `${config.cloudSqlSocketDir}/${config.cloudSqlConnectionName}` : u.hostname,
    ...(config.cloudSqlConnectionName ? {} : { port: Number(u.port || 5432) }),
    max: 10,
  };
}

export const prisma = new PrismaClient({ adapter: new PrismaPg(poolConfig()) });
export type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;

/**
 * Applies prisma/migrations/*\/migration.sql in order. Every migration is idempotent SQL, so this is safe on a database
 * that already has the tables (production predates Prisma) and on every start.
 * New migrations: edit prisma/schema.prisma, then `deno task db:diff` prints the SQL to review into a new folder.
 */
export async function migrate() {
  const dir = new URL("../prisma/migrations/", import.meta.url);
  const names: string[] = [];
  for await (const e of Deno.readDir(dir)) if (e.isDirectory) names.push(e.name);
  const client = new pg.Client(poolConfig());
  await client.connect();
  try {
    await client.query("create table if not exists _gic_migrations (name text primary key, applied_at timestamptz not null default now())");
    for (const name of names.sort()) {
      const done = await client.query("select 1 from _gic_migrations where name = $1", [name]);
      if (done.rowCount) continue;
      await client.query("begin");
      try {
        await client.query(await Deno.readTextFile(new URL(`${name}/migration.sql`, dir)));
        await client.query("insert into _gic_migrations (name) values ($1)", [name]);
        await client.query("commit");
      } catch (e) {
        await client.query("rollback");
        throw e;
      }
      console.log(`migrated ${name}`);
    }
  } finally {
    await client.end();
  }
}
