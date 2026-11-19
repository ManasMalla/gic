import ExcelJS from "exceljs";
import { connection } from "next/server";
import { getSession } from "@/lib/auth/session";
import { backend } from "@/lib/backend";

type Person = { name?: string; email?: string; phone?: string; courseYear?: string };
type TeamData = Record<string, Person | string | undefined>;
type Row = {
  reference: string; teamName: string; track: "junior" | "main"; status: string; createdAt: string; paidAt: string | null; institution: string | null; theme: string | null;
  ideaTitle: string | null; problemStatement: string | null; ideaSummary: string | null; pitchVideoLink: string | null; submittedAt: string | null; referralCode: string | null;
  ownerEmail: string | null; data: TeamData | null; deckUrl: string | null; videoFileUrl: string | null; paidAmount: number | null;
};

const GREEN = "FF007367";
const IST = { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" } as const;
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-GB", IST) : "");
const person = (p?: Person) => (p && (p.name || p.email) ? [p.name, p.email, p.phone, p.courseYear].filter(Boolean).join("; ") : "");
const OTHERS = [["member3", "Member 3"], ["member4", "Member 4"], ["member5", "Member 5"], ["member6", "Member 6"]] as const;

const COLUMNS: [string, number][] = [
  ["#", 5], ["Reference", 19], ["Team name", 24], ["Track", 13], ["Payment", 10], ["Amount paid (₹)", 12], ["Paid on", 12], ["Registered on", 12], ["Institution", 28], ["Stream / programme", 22], ["Theme", 20],
  ["Idea title", 34], ["Problem statement", 50], ["Idea summary", 50], ["Pitch deck link", 36], ["Pitch video link", 36], ["Idea submitted", 10],
  ["Founder", 42], ["Co-founder", 42], ["Other members", 50], ["Referral code", 12],
];

function addSheet(wb: ExcelJS.Workbook, name: string, rows: Row[]) {
  const ws = wb.addWorksheet(name, { views: [{ state: "frozen", xSplit: 3, ySplit: 1 }] });
  ws.columns = COLUMNS.map(([header, width]) => ({ header, width }));
  rows.forEach((r, i) => {
    const d = (r.data ?? {}) as Record<string, Person | undefined>;
    const stream = typeof r.data?.stream === "string" ? r.data.stream : "";
    const paid = r.status === "paid";
    const row = ws.addRow([
      i + 1, r.reference, r.teamName, r.track === "main" ? "Senior (Main)" : "Junior", paid ? "Paid" : "Not paid", r.paidAmount ? r.paidAmount / 100 : "", date(r.paidAt), date(r.createdAt),
      r.institution ?? "", stream, r.theme ?? "", r.ideaTitle ?? "", r.problemStatement ?? "", r.ideaSummary ?? "", r.deckUrl ?? "", r.pitchVideoLink || r.videoFileUrl || "",
      r.submittedAt ? "Yes" : "No", person(d.founder), person(d.cofounder),
      OTHERS.flatMap(([k, label]) => (person(d[k]) ? [`${label}: ${person(d[k])}`] : [])).join("\n"), r.referralCode ?? "",
    ]);
    row.alignment = { vertical: "top", wrapText: true };
    row.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: paid ? "FFD9F2D9" : "FFFBE3D6" } };
  });
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.alignment = { vertical: "middle", wrapText: true };
  head.eachCell((c) => (c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } }));
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };
}

/** GET /admin/applications/export?<same filters as the list>: an Excel file of every matching application (admins only; the backend enforces it). */
export async function GET(req: Request) {
  await connection();
  const user = await getSession();
  if (!user) return new Response("Sign in first", { status: 401 });

  const url = new URL(req.url);
  const qs = new URLSearchParams(url.searchParams);
  qs.delete("page");
  const res = await backend(`/api/staff/applications/export?${qs}`, user.email);
  if (!res.ok) return new Response("Not allowed", { status: res.status === 403 ? 403 : 502 });
  const rows = ((await res.json()) as { applications: Row[] }).applications.sort((a, b) => Number(b.status === "paid") - Number(a.status === "paid"));

  const wb = new ExcelJS.Workbook();
  const summary = wb.addWorksheet("Summary");
  summary.getColumn(1).width = 22;
  summary.addRow(["GITAM Innovation Challenge 2026 - applicants"]).font = { bold: true, size: 14 };
  summary.addRow(["As of", new Date().toLocaleDateString("en-GB", IST)]);
  summary.addRow([]);
  summary.addRow(["", "Total", "Paid", "Not paid", "Idea submitted"]).font = { bold: true };
  for (const [label, track] of [["All tracks", null], ["Senior (Main)", "main"], ["Junior", "junior"]] as const) {
    const set = rows.filter((r) => !track || r.track === track);
    summary.addRow([label, set.length, set.filter((r) => r.status === "paid").length, set.filter((r) => r.status !== "paid").length, set.filter((r) => r.submittedAt).length]);
  }
  addSheet(wb, "All applicants", rows);
  addSheet(wb, "Paid", rows.filter((r) => r.status === "paid"));
  addSheet(wb, "Not paid", rows.filter((r) => r.status !== "paid"));

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(buffer, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="GIC-2026-applicants-${stamp}.xlsx"`,
      "cache-control": "private, no-store",
    },
  });
}
