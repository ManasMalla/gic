import postgres from "postgres";
import { config } from "./config.ts";

function connect() {
  try {
    return postgres(config.databaseUrl, {
      max: 10,
      onnotice: () => {},
      // The driver ignores `?host=` for sockets; it only honours an explicit `path`.
      ...(config.cloudSqlConnectionName
        ? { path: `${config.cloudSqlSocketDir}/${config.cloudSqlConnectionName}/.s.PGSQL.5432` }
        : {}),
    });
  } catch {
    // Never let the driver's message through: it embeds the full URL, including the password.
    throw new Error("DATABASE_URL could not be parsed (value redacted)");
  }
}

export const sql = connect();
export type Sql = typeof sql;

export async function migrate() {
  const dir = new URL("./migrations/", import.meta.url);
  const files: string[] = [];
  for await (const e of Deno.readDir(dir)) if (e.name.endsWith(".sql")) files.push(e.name);
  for (const f of files.sort()) {
    await sql.unsafe(await Deno.readTextFile(new URL(f, dir)));
    console.log(`migrated ${f}`);
  }
}
