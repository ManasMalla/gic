import manifest from "@/content/media.generated.json";

type Dims = { width: number; height: number };
const dims = manifest as Record<string, Dims>;

/** Resolve a /media/... path to props for next/image (src + intrinsic size). */
export function media(src: string): { src: string } & Dims {
  const d = dims[src];
  if (!d) throw new Error(`Unknown media "${src}". Run \`npm run media:manifest\`.`);
  return { src, ...d };
}

/** All images in a /media subfolder, in natural (numeric) order. */
export function mediaInDir(dir: string) {
  const prefix = `/media/${dir.replace(/^\/|\/$/g, "")}/`;
  return Object.keys(dims)
    .filter((k) => k.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((src) => ({ src, ...dims[src] }));
}
