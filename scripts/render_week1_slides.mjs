import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const WEEK = Number(process.argv[2] ?? 1);
const sourceRoot = path.join(ROOT, `public/lessons/year-1-maths/week-${WEEK}`);
const outputRoot = path.join(ROOT, `.qa/pptx-week-${WEEK}`);
await fs.mkdir(outputRoot, { recursive: true });
for (const entry of await fs.readdir(sourceRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const input = path.join(sourceRoot, entry.name, "interactive-teaching-slides.pptx");
  try { await fs.access(input); } catch { continue; }
  const presentation = await PresentationFile.importPptx(await FileBlob.load(input));
  const out = path.join(outputRoot, entry.name);
  await fs.mkdir(out, { recursive: true });
  for (let index = 0; index < presentation.slides.items.length; index++) {
    const slide = presentation.slides.items[index];
    const preview = await presentation.export({ slide, format: "png", scale: 1.25 });
    await fs.writeFile(path.join(out, `slide-${String(index + 1).padStart(2, "0")}.png`), new Uint8Array(await preview.arrayBuffer()));
  }
  console.log(`${entry.name}: ${presentation.slides.items.length} slides`);
}
