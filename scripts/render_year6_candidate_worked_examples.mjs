import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const artifactToolPath = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const term = (process.argv[2] ?? "autumn").toLowerCase();
if (!["autumn", "spring", "summer"].includes(term)) throw new Error(`Unknown term: ${term}`);
const lessons = JSON.parse(await fs.readFile(path.join(ROOT, `lessons/year-6-maths/${term}/year6-${term}-lessons.json`), "utf8"));
const selected = process.argv[3] ?? "all";
const stageRoot = path.join(ROOT, ".qa", `year6-${term}-pptx`);

for (const item of lessons.filter(item => selected === "all" || selected === `${item.week}-${item.day}`)) {
  const stageDir = path.join(stageRoot, `week-${item.week}`, `${item.day}-${item.slug}`);
  const input = path.join(stageDir, "animated-candidate.pptx");
  const presentation = await PresentationFile.importPptx(await FileBlob.load(input));
  const preview = await presentation.export({ slide: presentation.slides.items[3], format: "png", scale: 0.8 });
  await fs.writeFile(path.join(stageDir, "worked-example.png"), new Uint8Array(await preview.arrayBuffer()));
  console.log(`${item.week}.${item.day} ${item.slug}`);
}
