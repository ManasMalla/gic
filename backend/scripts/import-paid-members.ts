// One-off: loads teams that already paid on the old GITAM portal as PAID applications.
//   deno run -A scripts/import-paid-members.ts <paid-members.json>            dry run (default, writes nothing)
//   deno run -A scripts/import-paid-members.ts <paid-members.json> --apply    writes, in one transaction
// Needs DATABASE_URL (+ the usual required env vars, dummies are fine). Re-running is safe: rows already imported are skipped.
import { prisma } from "../src/db.ts";
import type { Prisma } from "../src/generated/prisma/client.ts";
import { FEES_PAISE } from "../src/fees.ts";
import { generateReference } from "../src/reference.ts";

type Row = Record<string, string> & { Amount: number };
const [file, flag] = Deno.args;
const apply = flag === "--apply";
const rows: Row[] = JSON.parse(await Deno.readTextFile(file));

const THEMES: Record<string, string> = {
  "planet & sustainability": "planet-sustainability",
  "big economy": "bio-economy",
  "bio economy & agriculture": "bio-economy",
  "deeptech & manufacturing": "deeptech-manufacturing",
  "sports & fitness": "sports-fitness",
  "d2c & consumer brands": "d2c-consumer",
};
const person = (name: string, courseYear: string, email: string, phone: string) => ({
  name, courseYear, email: email.toLowerCase(), phone, gender: "",
});
const blank = person("", "", "", "");

const plan: { row: Row; skip?: string }[] = [];
for (const r of rows) {
  if (r.Amount <= 1) plan.push({ row: r, skip: "test payment (₹1)" });
  else if (!THEMES[r.Theme.toLowerCase()]) plan.push({ row: r, skip: `unknown theme ${r.Theme}` });
  else plan.push({ row: r });
}

let created = 0;
const skipped: string[] = [];
const work = async (tx: Prisma.TransactionClient) => {
  for (const { row: r, skip } of plan) {
    const label = `#${r["#"]} ${r["Team name"]} <${r.Email}>`;
    if (skip) { skipped.push(`${label}: ${skip}`); continue; }
    const owner = r.Email.toLowerCase();
    const txn = r["Txn ID"];
    if (await tx.application.findUnique({ where: { ownerEmail: owner } }) || await tx.payment.findFirst({ where: { transactionId: txn } })) {
      skipped.push(`${label}: already in the database`); continue;
    }
    const track = r["Participation type"].toLowerCase().startsWith("junior") ? "junior" : "main";
    const data = {
      track, teamName: r["Team name"], institution: r.Institution, address: "", cityState: r["City / State"],
      founder: person(r["Founder name"], r["Founder course/year"], r["Founder email"], r["Founder phone"]),
      cofounder: r["Co-founder email"] ? person(r["Co-founder name"], r["Co-founder course/year"], r["Co-founder email"], r["Co-founder phone"]) : blank,
      member3: blank, member4: blank, member5: blank, member6: blank, declaration: "on", imported: "old-portal",
    };
    const contacts = [{ role: "owner", email: owner, phone: "" }];
    for (const [role, p] of [["founder", data.founder], ["cofounder", data.cofounder]] as const) if (p.email) contacts.push({ role, email: p.email, phone: p.phone });
    const paidAt = new Date();
    const app = await tx.application.create({
      data: {
        reference: generateReference(), ownerEmail: owner, track, teamName: data.teamName, institution: data.institution,
        data: data as unknown as Prisma.InputJsonValue, amountDue: FEES_PAISE[track as "junior" | "main"], status: "paid", paidAt,
        theme: THEMES[r.Theme.toLowerCase()], ideaTitle: r["Idea title"], problemStatement: r["Problem statement"] || null,
        ideaSummary: r["Idea summary"] || null, ideaUpdatedAt: paidAt, contacts: { create: contacts },
      },
    });
    const eventId = `import_${txn}`;
    await tx.paymentEvent.create({
      data: {
        eventId, eventType: "payment.succeeded",
        payload: { imported: "old-portal", cnf_id: r["CNF ID"], transaction_id: txn, amount_rupees: r.Amount, payer: { name: r.Name, email: r.Email, phone: r.Mobile } },
      },
    });
    await tx.payment.create({
      data: {
        eventId, eventType: "payment.succeeded", transactionId: txn, applicationId: app.id, matchStatus: "matched", matchMethod: "manual",
        flags: [], amount: Math.round(r.Amount * 100), currency: "INR", occurredAt: paidAt, reviewedAt: paidAt, reviewNote: `imported from old portal (${r["CNF ID"]})`,
      },
    });
    created++;
    console.log(`+ ${app.reference} ${track.padEnd(6)} ${label}`);
  }
};

try {
  await prisma.$transaction(async (tx) => {
    await work(tx);
    if (!apply) throw new Error("DRY_RUN");
  }, { timeout: 120_000 });
} catch (e) {
  if ((e as Error).message !== "DRY_RUN") throw e;
}
console.log(`\n${apply ? "APPLIED" : "DRY RUN (nothing written)"}: ${created} to create, ${skipped.length} skipped`);
for (const s of skipped) console.log("  skip", s);
await prisma.$disconnect();
