import { prisma } from "./db.ts";
import { matchPayment, paymentEmails } from "./matching.ts";
import { webhookSchema } from "./schema.ts";

/**
 * Payments that arrived BEFORE their team registered (people often pay on GEvents first) were stored as unmatched.
 * This runs the normal matcher again over those, with the same rules, and links + marks paid only on a clean match.
 * `onlyEmails` limits it to payments whose payer/token email is one of these (used right after a team registers).
 * Returns how many payments were matched. Never throws: a failure here must not break the caller.
 */
export async function reconcilePending(onlyEmails?: string[]): Promise<number> {
  let matched = 0;
  try {
    const pending = await prisma.payment.findMany({
      where: { matchStatus: { in: ["unmatched", "needs_review"] }, applicationId: null, reviewedAt: null, eventType: "payment.succeeded" },
      include: { event: { select: { payload: true } } },
      orderBy: { occurredAt: "asc" },
    });
    for (const pm of pending) {
      const parsed = webhookSchema.safeParse(pm.event.payload);
      if (!parsed.success) continue;
      const { link, emails } = await paymentEmails(parsed.data, { id: pm.eventId });
      if (onlyEmails && !emails.some((e) => onlyEmails.includes(e))) continue;

      const ok = await prisma.$transaction(async (tx) => {
        const fresh = await tx.payment.findUnique({ where: { id: pm.id } });
        if (!fresh || fresh.applicationId || fresh.reviewedAt || fresh.matchStatus === "matched") return false;
        const result = await matchPayment(tx, parsed.data, emails, link?.track ?? null);
        if (result.status !== "matched" || !result.application) return false;
        await tx.payment.update({
          where: { id: pm.id },
          data: { applicationId: result.application.id, matchStatus: "matched", matchMethod: result.method, flags: [], reviewNote: "auto-matched after the team registered" },
        });
        await tx.application.updateMany({ where: { id: result.application.id, status: "awaiting_payment" }, data: { status: "paid", paidAt: pm.occurredAt } });
        console.log(JSON.stringify({ severity: "INFO", message: `reconcile: ${pm.transactionId} -> ${result.application.reference} via ${result.method}`, msg: "reconcile matched", event_id: pm.eventId, reference: result.application.reference }));
        return true;
      });
      if (ok) matched++;
    }
  } catch (e) {
    console.error(JSON.stringify({ severity: "ERROR", msg: "reconcile failed", error: String(e) }));
  }
  return matched;
}
