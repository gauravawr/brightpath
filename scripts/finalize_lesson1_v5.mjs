import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const SKILL_DIR = "C:/Users/garim/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const RUNTIME_PYTHON = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href
);

const stagingDir = path.join(ROOT, ".qa", "lesson1-finalizer");
const candidatePath = path.join(stagingDir, "lesson1-v5-animated-candidate.pptx");
const finalDir = path.join(ROOT, "public", "lessons", "year-1-maths", "week-1", "sort-objects-into-groups");
const finalPath = path.join(finalDir, "teaching-powerpoint-v5.pptx");

await finalizePresentation({
  explicitTotalSlideCount: 15,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: ROOT,
  candidatePath,
  finalPath,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [resolvePresentationFont(), "Segoe Print"] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "lesson1-v5-validation.json"),
});

console.log(finalPath);
