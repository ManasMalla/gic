import { defineConfig } from "prisma/config";

// Only used by the Prisma CLI (generate / migrate diff). The running service builds its own connection in src/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: Deno.env.get("DATABASE_URL") ?? "postgres://postgres:dev@localhost:5432/gic" },
});
