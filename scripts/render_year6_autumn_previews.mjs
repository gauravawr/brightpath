import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const artifactToolPath = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const lessons = JSON.parse(await fs.readFile(path.join(ROOT, "public/lessons/year-6-maths/autumn/year6-autumn-lessons.json"), "utf8"));

let completed = 0;
for (const item of lessons) {
  const lessonDir = path.join(ROOT, "public", "lessons", "year-6-maths", "autumn", `week-${item.week}`, item.slug);
  const input = path.join(lessonDir, "teaching-powerpoint-v1.pptx");
  const outputDir = path.join(lessonDir, "preview", "powerpoint");
  await fs.mkdir(outputDir, { recursive: true });
  const presentation = await PresentationFile.importPptx(await FileBlob.load(input));
  const slides = presentation.slides.items;
  if (slides.length !== 12) throw new Error(`${item.slug} has ${slides.length} slides`);
  for (let index = 0; index < slides.length; index += 1) {
    const preview = await presentation.export({ slide: slides[index], format: "png", scale: 0.8 });
    await fs.writeFile(path.join(outputDir, `slide-${index + 1}.png`), new Uint8Array(await preview.arrayBuffer()));
  }
  completed += 1;
  console.log(`${completed}/50 ${item.slug}`);
}

