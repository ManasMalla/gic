import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RegistrationInput } from "./schema";

export type StoredApplication = RegistrationInput & {
  id: string;
  reference: string;
  createdAt: string;
  status: "awaiting-payment" | "paid" | "submitted";
  deck: { name: string; path: string; size: number };
};

export interface RegistrationRepository {
  create(input: RegistrationInput, deck: File): Promise<StoredApplication>;
}

/**
 * Development adapter: JSON + uploaded deck on local disk under .data/ (git-ignored).
 * Swap for a database + object storage (S3/R2) by implementing RegistrationRepository
 * and returning it from getRepository(). Serverless hosts have read-only disks, so this
 * adapter is NOT for production.
 */
class LocalFileRepository implements RegistrationRepository {
  private root = path.join(process.cwd(), ".data");

  async create(input: RegistrationInput, deck: File) {
    const id = randomUUID();
    const reference = "GIC26-" + id.slice(0, 8).toUpperCase();
    const dir = path.join(this.root, "registrations", id);
    await mkdir(dir, { recursive: true });

    const safeName = deck.name.replace(/[^\w.-]+/g, "_");
    const deckPath = path.join(dir, safeName);
    await writeFile(deckPath, Buffer.from(await deck.arrayBuffer()));

    const record: StoredApplication = {
      ...input,
      id,
      reference,
      createdAt: new Date().toISOString(),
      status: "awaiting-payment",
      deck: { name: deck.name, path: path.relative(this.root, deckPath), size: deck.size },
    };
    await writeFile(path.join(dir, "application.json"), JSON.stringify(record, null, 2));
    return record;
  }
}

export function getRepository(): RegistrationRepository {
  return new LocalFileRepository();
}
