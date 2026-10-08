// Scans public/media and writes src/content/media.generated.json with intrinsic
// image sizes so <Image> never needs hand-typed dimensions.
// Run: npm run media:manifest   (re-run after adding/removing images)
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/media");
const out = path.resolve("src/content/media.generated.json");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return files.flat();
}

const manifest = {};
for (const file of (await walk(root)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
  if (!/\.(webp|png|jpe?g)$/i.test(file)) continue;
  const { width, height } = await sharp(file).metadata();
  const key = "/media/" + path.relative(root, file).split(path.sep).join("/");
  manifest[key] = { width, height };
}
await writeFile(out, JSON.stringify(manifest, null, 1) + "\n");
console.log(`media manifest: ${Object.keys(manifest).length} images -> ${path.relative(process.cwd(), out)}`);
