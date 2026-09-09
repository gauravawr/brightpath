import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const SKILL_DIR = "C:/Users/garim/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const RUNTIME_PYTHON = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href);
const family = resolvePresentationFont();
const term = (process.argv[2] ?? "autumn").toLowerCase();
if (!["autumn", "spring", "summer"].includes(term)) throw new Error(`Unknown term: ${term}`);
const lessons = JSON.parse(await fs.readFile(path.join(ROOT, `public/lessons/year-6-maths/${term}/year6-${term}-lessons.json`), "utf8"));
const stageRoot = path.join(ROOT, ".qa", `year6-${term}-pptx`);

let completed = 0;
for (const item of lessons) {
  const stageDir = path.join(stageRoot, `week-${item.week}`, `${item.day}-${item.slug}`);
  const candidatePath = path.join(stageDir, "animated-candidate.pptx");
  const finalDir = path.join(ROOT, "public", "lessons", "year-6-maths", term, `week-${item.week}`, item.slug);
  await fs.mkdir(finalDir, { recursive: true });
  const finalPath = path.join(finalDir, "teaching-powerpoint-v3.pptx");
  await finalizePresentation({
    explicitTotalSlideCount: 12,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
    workspaceDir: ROOT,
    candidatePath,
    finalPath,
    pythonExecutable: RUNTIME_PYTHON,
    integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
    fontPolicy: { basis: "design", families: [family, "Segoe Print"] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(stageDir, "validation-v3.json"),
  });
  completed += 1;
  console.log(`${completed}/${lessons.length} ${path.relative(ROOT, finalPath)}`);
}
