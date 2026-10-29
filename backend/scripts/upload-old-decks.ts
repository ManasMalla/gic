// One-off: puts pitch decks recovered from the old portal into R2 (gic/decks/<reference>/) and links them to their teams.
//   deno run -A --config deno.json scripts/upload-old-decks.ts <plan.json> <folder>            dry run
//   deno run -A --config deno.json scripts/upload-old-decks.ts <plan.json> <folder> --apply
// The plan (reference -> file) is made by a human-checked matching step and kept out of git (it names real teams).
// Safe to re-run: a team that already has a deck is left alone, and every upload is read back before its row is written.
import { prisma } from "../src/db.ts";
import { deckKey, deleteObject, publicUrlFor, putObject, storageEnabled } from "../src/storage.ts";

type Item = { reference: string; team: string; file: string; display_name: string; ext: string; size: number };
const [planPath, folder] = Deno.args;
const apply = Deno.args.includes("--apply");
if (!storageEnabled()) throw new Error("R2 is not configured (R2_* env vars)");
const plan: Item[] = JSON.parse(await Deno.readTextFile(planPath));
const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
};

let done = 0, skipped = 0, failed = 0;
for (const it of plan) {
  const app = await prisma.application.findUnique({ where: { reference: it.reference }, include: { file: { select: { applicationId: true } } } });
  if (!app) { console.log(`! ${it.reference} ${it.team}: no such application`); failed++; continue; }
  if (app.file) { console.log(`- ${it.reference} ${it.team}: already has a deck, left alone`); skipped++; continue; }
  const type = TYPES[it.ext];
  if (!type) { console.log(`! ${it.reference} ${it.team}: unexpected type .${it.ext}`); failed++; continue; }
  const bytes = await Deno.readFile(`${folder}/${it.file}`);
  if (bytes.length !== it.size) { console.log(`! ${it.reference} ${it.team}: size changed on disk`); failed++; continue; }
  const key = deckKey(it.reference, it.display_name);
  console.log(`${apply ? "+" : "would upload"} ${it.reference} ${it.team.padEnd(28).slice(0, 28)} <- ${it.display_name.slice(0, 50)} (${(bytes.length / 1048576).toFixed(1)} MB)`);
  if (!apply) { done++; continue; }
  await putObject(key, bytes, type, it.display_name);
  const url = publicUrlFor(key);
  const check = await fetch(url);
  const got = (await check.arrayBuffer()).byteLength;
  if (!check.ok || got !== bytes.length) { await deleteObject(key); console.log(`! ${it.reference}: read-back failed (${check.status}, ${got} bytes), removed`); failed++; continue; }
  try {
    await prisma.applicationFile.create({ data: { applicationId: app.id, filename: it.display_name, contentType: type, size: bytes.length, bytes: null, objectKey: key, publicUrl: url } });
    done++;
  } catch (e) {
    await deleteObject(key);
    console.log(`! ${it.reference}: database write failed (${(e as Error).message.slice(0, 80)}), removed`);
    failed++;
  }
}
console.log(`\n${apply ? "APPLIED" : "DRY RUN"}: ${done} ${apply ? "uploaded" : "to upload"}, ${skipped} skipped, ${failed} failed`);
await prisma.$disconnect();
