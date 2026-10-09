// Application references look like GIC26-7K3M9QX2-R: 8 random Crockford-base32 chars + 1 check char.
// The check char lets us tell a typo (when people key the reference in by hand) from a real reference.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford: no I, L, O, U
const PREFIX = "GIC26";

function checkChar(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) sum += ALPHABET.indexOf(body[i]) * (i + 1);
  return ALPHABET[sum % 32];
}

export function generateReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const body = Array.from(bytes, (b) => ALPHABET[b % 32]).join("");
  return `${PREFIX}-${body}-${checkChar(body)}`;
}

/** Returns the canonical reference, or null if it is malformed or the check char is wrong. */
export function normalizeReference(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const s = input.toUpperCase().replace(/[\s-]/g, "");
  if (!s.startsWith(PREFIX)) return null;
  // Fix look-alikes only in the code part (the prefix itself contains an "I").
  const rest = s.slice(PREFIX.length).replace(/O/g, "0").replace(/[IL]/g, "1");
  if (rest.length !== 9 || [...rest].some((c) => !ALPHABET.includes(c))) return null;
  const body = rest.slice(0, 8);
  if (checkChar(body) !== rest[8]) return null;
  return `${PREFIX}-${body}-${rest[8]}`;
}
