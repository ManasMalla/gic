// One-off: copies pitch decks that still live in Postgres (bytes) into R2 and records their key + public URL.
//   deno run -A --config deno.json scripts/move-decks-to-r2.ts            dry run
//   deno run -A --config deno.json scripts/move-decks-to-r2.ts --apply
// Needs DATABASE_URL and the R2_* settings. Safe to re-run: only rows that still hold bytes are touched.
import { prisma } from "../src/db.ts";
import { deckKey, deleteObject, publicUrlFor, putObject, storageEnabled } from "../src/storage.ts";

if (!storageEnabled()) throw new Error("R2 is not configured (R2_* env vars)");
const apply = Deno.args.includes("--apply");
const rows = await prisma.applicationFile.findMany({ where: { bytes: { not: null }, objectKey: null }, include: { application: { select: { reference: true } } } });
console.log(`${rows.length} deck(s) in the database`);
for (const f of rows) {
  const key = deckKey(f.application.reference, f.filename);
  console.log(`${apply ? "moving" : "would move"} ${f.application.reference} ${f.filename} (${f.size} bytes) -> ${key}`);
  if (!apply) continue;
  await putObject(key, f.bytes!, f.contentType, f.filename);
  // Only drop the database copy once the public URL really serves the same bytes.
  const check = await fetch(publicUrlFor(key));
  const got = new Uint8Array(await check.arrayBuffer());
  if (!check.ok || got.length !== f.bytes!.length) {
    await deleteObject(key);
    throw new Error(`verification failed for ${f.application.reference}: ${check.status}, ${got.length} vs ${f.bytes!.length} bytes`);
  }
  try {
    await prisma.applicationFile.update({ where: { applicationId: f.applicationId }, data: { objectKey: key, publicUrl: publicUrlFor(key), bytes: null } });
  } catch (e) {
    await deleteObject(key);
    throw e;
  }
}
await prisma.$disconnect();
