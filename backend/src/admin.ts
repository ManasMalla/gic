import { prisma } from "./db.ts";
import { json } from "./http.ts";
import { normalizeReference } from "./reference.ts";

/** GET /api/admin/payments?status=needs_review,unmatched — payments a human must look at. */
export async function listPayments(url: URL): Promise<Response> {
  const wanted = (url.searchParams.get("status") ?? "needs_review,unmatched").split(",");
  const rows = await prisma.payment.findMany({
    where: { matchStatus: { in: wanted }, reviewedAt: null },
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { event: { select: { payload: true } }, application: { select: { reference: true } } },
  });
  const payments = rows.map((pm) => {
    const payload = (pm.event.payload ?? {}) as { payer?: unknown; reference?: unknown };
    return {
      id: pm.id, event_type: pm.eventType, transaction_id: pm.transactionId, match_status: pm.matchStatus,
      match_method: pm.matchMethod, flags: pm.flags, amount: pm.amount, currency: pm.currency,
      occurred_at: pm.occurredAt, reviewed_at: pm.reviewedAt, review_note: pm.reviewNote,
      application_reference: pm.application?.reference ?? null,
      payer: payload.payer ?? null, reported_reference: typeof payload.reference === "string" ? payload.reference : null,
    };
  });
  return json({ payments });
}

/** POST /api/admin/payments/:id/assign {reference, note?} — a human decides which application this payment belongs to. */
export async function assignPayment(id: string, req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({})) as { reference?: string; note?: string };
  const reference = normalizeReference(body.reference);
  if (!reference) return json({ error: "invalid_reference" }, 400);

  return await prisma.$transaction(async (tx) => {
    // Row locks so two reviewers (or a late webhook) cannot interleave on the same payment/application.
    await tx.$queryRaw`select id from payments where id = ${id}::uuid for update`;
    const pm = await tx.payment.findUnique({ where: { id } });
    if (!pm) return json({ error: "payment_not_found" }, 404);
    await tx.$queryRaw`select id from applications where reference = ${reference} for update`;
    const app = await tx.application.findUnique({ where: { reference } });
    if (!app) return json({ error: "application_not_found" }, 404);

    await tx.payment.update({
      where: { id },
      data: { applicationId: app.id, matchStatus: "matched", matchMethod: "manual", reviewedAt: new Date(), reviewNote: body.note ?? null },
    });
    if (pm.eventType === "payment.succeeded") {
      await tx.application.updateMany({ where: { id: app.id, status: "awaiting_payment" }, data: { status: "paid", paidAt: pm.occurredAt } });
    } else if (pm.eventType === "payment.refunded") {
      await tx.application.updateMany({ where: { id: app.id, status: "paid" }, data: { status: "refunded" } });
    }
    return json({ ok: true, reference });
  });
}

/** POST /api/admin/payments/:id/dismiss {note} — acknowledged, no application (e.g. test payment, handled by refund). */
export async function dismissPayment(id: string, req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({})) as { note?: string };
  const r = await prisma.payment.updateMany({ where: { id }, data: { reviewedAt: new Date(), reviewNote: body.note ?? null } });
  return r.count ? json({ ok: true }) : json({ error: "payment_not_found" }, 404);
}
