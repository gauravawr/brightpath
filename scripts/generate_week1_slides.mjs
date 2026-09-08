import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const WEEK = Number(process.argv[2] ?? 1);
const SKILL_DIR = "C:/Users/garim/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const RUNTIME_PYTHON = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href);
const family = resolvePresentationFont();
const lessons = JSON.parse(await fs.readFile(path.join(ROOT, `public/lessons/year-1-maths/week-${WEEK}/week${WEEK}-lessons.json`), "utf8"));
const stageRoot = path.join(ROOT, `.week${WEEK}-pptx-staging`);
await fs.mkdir(stageRoot, { recursive: true });

const C = { red: "#B91C1C", red2: "#DC2626", pale: "#FEF2F2", ink: "#0F172A", slate: "#334155", muted: "#64748B", white: "#FFFFFF", line: "#E2E8F0", amber: "#F59E0B", green: "#10B981" };

function shape(slide, geometry, left, top, width, height, fill, radius = 0) {
  return slide.shapes.add({ geometry, position: { left, top, width, height }, fill, line: { fill: "none", width: 0 } });
}
function text(slide, value, left, top, width, height, size = 26, color = C.ink, bold = false, align = "left") {
  const box = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { fill: "none", width: 0 } });
  box.text = value;
  box.text.style = { typeface: family, fontSize: size, color, bold, alignment: align, verticalAlignment: "middle", autoFit: "shrinkText" };
  return box;
}
function baseSlide(pres, lesson, section, number) {
  const slide = pres.slides.add();
  slide.background.fill = C.white;
  shape(slide, "rect", 0, 0, 1280, 14, C.red);
  text(slide, `YEAR 1 MATHS  •  AUTUMN WEEK ${WEEK}  •  DAY ${lesson.day}`, 64, 28, 850, 28, 15, C.red, true);
  text(slide, section, 64, 62, 1050, 58, 34, C.ink, true);
  text(slide, `${number} / 8`, 1120, 38, 95, 28, 14, C.muted, true, "right");
  shape(slide, "rect", 64, 674, 1152, 2, C.line);
  text(slide, "BrightPath Primary Learning", 64, 682, 400, 22, 12, C.muted, false);
  return slide;
}
function pill(slide, value, left, top, width, fill = C.pale, color = C.red) {
  shape(slide, "roundRect", left, top, width, 46, fill);
  text(slide, value, left + 12, top + 4, width - 24, 38, 17, color, true, "center");
}
function addCounters(slide, count, left, top, color = C.red, spacing = 74) {
  for (let i = 0; i < count; i++) {
    shape(slide, "ellipse", left + i * spacing, top, 54, 54, color);
  }
}
function twoColumnPrompt(slide, leftTitle, leftBody, rightTitle, rightBody) {
  shape(slide, "roundRect", 64, 150, 552, 460, C.pale);
  shape(slide, "roundRect", 640, 150, 576, 460, "#FFF7ED");
  pill(slide, leftTitle, 92, 178, 210);
  text(slide, leftBody, 94, 246, 492, 320, 26, C.slate, false);
  pill(slide, rightTitle, 668, 178, 210, "#FFEDD5", "#9A3412");
  text(slide, rightBody, 670, 246, 516, 320, 26, C.slate, false);
}

async function build(lesson) {
  const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  let s = baseSlide(pres, lesson, lesson.title, 1);
  pill(s, "Learning objective", 64, 150, 220);
  text(s, lesson.objective, 64, 220, 760, 150, 31, C.slate, true);
  shape(s, "roundRect", 880, 160, 336, 380, C.pale);
  text(s, "Today we will…", 916, 194, 270, 50, 25, C.red, true, "center");
  addCounters(s, Math.min(lesson.day + 1, 5), 922, 286, C.red, 58);
  text(s, "Look • Think • Talk • Try", 908, 390, 278, 90, 24, C.ink, true, "center");
  s.speakerNotes.textFrame.setText(`Introduce the learning objective in child-friendly language. Revisit: ${lesson.warmup}`);

  s = baseSlide(pres, lesson, "Notice and wonder", 2);
  text(s, lesson.hook, 64, 145, 1152, 85, 36, C.ink, true, "center");
  shape(s, "roundRect", 160, 270, 960, 260, C.pale);
  addCounters(s, 3, 270, 356, C.red, 88);
  addCounters(s, 2, 720, 356, C.amber, 88);
  pill(s, "30 seconds: silent thinking", 430, 560, 420);
  s.speakerNotes.textFrame.setText(`Give silent thinking time. Invite pupils to say what they notice without evaluating answers. Warm-up: ${lesson.warmup}`);

  s = baseSlide(pres, lesson, "Teacher model: think aloud", 3);
  shape(s, "roundRect", 64, 150, 1152, 450, C.pale);
  lesson.teacherModel.forEach((step, i) => {
    shape(s, "ellipse", 92, 185 + i * 94, 54, 54, C.red);
    text(s, String(i + 1), 92, 190 + i * 94, 54, 44, 21, C.white, true, "center");
    text(s, step, 170, 180 + i * 94, 980, 65, 25, C.slate, i === 0);
  });
  s.speakerNotes.textFrame.setText(`Model using real objects where possible. Misconception to address: ${lesson.misconception}`);

  s = baseSlide(pres, lesson, "Your turn: try it", 4);
  shape(s, "roundRect", 120, 160, 1040, 320, "#FFF7ED");
  text(s, lesson.tryQuestion, 165, 205, 950, 190, 34, C.ink, true, "center");
  pill(s, "Use objects or draw your thinking", 390, 510, 500, "#FFEDD5", "#9A3412");
  text(s, "Do not call out — show your teacher when you are ready.", 180, 580, 920, 44, 20, C.muted, false, "center");
  s.speakerNotes.textFrame.setText("Give 60-90 seconds. Scan responses. Ask one pupil to explain and another to agree, disagree or add on.");

  s = baseSlide(pres, lesson, "Check and explain", 5);
  pill(s, "Answer reveal", 64, 150, 200, "#ECFDF5", "#047857");
  shape(s, "roundRect", 64, 220, 1152, 250, "#ECFDF5");
  text(s, lesson.tryAnswer, 100, 250, 1080, 180, 34, C.ink, true, "center");
  text(s, "How do you know?  •  What did you check?  •  Is there another way?", 110, 510, 1060, 70, 23, C.slate, true, "center");
  s.speakerNotes.textFrame.setText(`Reveal after pupils have committed to an answer. Expected explanation: ${lesson.tryAnswer}`);

  s = baseSlide(pres, lesson, "Talk partner challenge", 6);
  twoColumnPrompt(s, "Partner A", lesson.talkQuestion, "Partner B", "Listen carefully. Then explain your partner's idea back to them.");
  text(s, "Sentence stem: I think… because…", 320, 620, 640, 38, 21, C.red, true, "center");
  s.speakerNotes.textFrame.setText(`Allow rehearsal before sharing. Possible response: ${lesson.talkAnswer}`);

  s = baseSlide(pres, lesson, "Choose the right practice", 7);
  const cols = [64, 448, 832];
  const labels = [["Lower support", "Use objects and adult prompts", C.pale], ["Expected", "Work independently, then explain", "#FFF7ED"], ["Higher challenge", "Prove, compare or generalise", "#ECFDF5"]];
  labels.forEach(([label, body, fill], i) => {
    shape(s, "roundRect", cols[i], 160, 352, 390, fill);
    text(s, i === 0 ? "●" : i === 1 ? "● ●" : "● ● ●", cols[i] + 30, 195, 292, 55, 29, i === 2 ? "#047857" : C.red, true, "center");
    text(s, label, cols[i] + 24, 265, 304, 55, 25, C.ink, true, "center");
    text(s, body, cols[i] + 34, 340, 284, 120, 22, C.slate, false, "center");
  });
  text(s, "Your teacher may move you to a different sheet today — that is good learning.", 170, 585, 940, 45, 20, C.muted, true, "center");
  s.speakerNotes.textFrame.setText(`Choose by current learning need. Independent task: ${lesson.independent}`);

  s = baseSlide(pres, lesson, "Exit check", 8);
  lesson.exitQuestions.slice(0, 3).forEach((q, i) => {
    shape(s, "roundRect", 80, 160 + i * 140, 1120, 105, i % 2 === 0 ? C.pale : "#FFF7ED");
    shape(s, "ellipse", 105, 185 + i * 140, 54, 54, C.red);
    text(s, String(i + 1), 105, 191 + i * 140, 54, 42, 20, C.white, true, "center");
    text(s, q, 185, 175 + i * 140, 970, 75, 27, C.ink, true);
  });
  text(s, "Show: thumbs up / sideways / down — How confident do you feel?", 170, 590, 940, 48, 21, C.red, true, "center");
  s.speakerNotes.textFrame.setText(`Answers: ${lesson.exitAnswers.join(" | ")}. Use responses to decide the next lesson's pre-teach group.`);

  const deckStage = path.join(stageRoot, lesson.slug);
  await fs.mkdir(deckStage, { recursive: true });
  const candidatePath = path.join(deckStage, "candidate.pptx");
  await (await PresentationFile.exportPptx(pres)).save(candidatePath);
  const finalPath = path.join(ROOT, `public/lessons/year-1-maths/week-${WEEK}`, lesson.slug, "interactive-teaching-slides.pptx");
  await finalizePresentation({
    explicitTotalSlideCount: 8,
    requiredNativeTableOwnerSlides: [], requiredNativeChartOwnerSlides: [],
    workspaceDir: ROOT, candidatePath, finalPath, pythonExecutable: RUNTIME_PYTHON,
    integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
    fontPolicy: { basis: "design", families: [family] }, verifyArtifactToolImport: true,
    receiptPath: path.join(deckStage, "validation.json"),
  });
  console.log(path.relative(ROOT, finalPath));
}

for (const lesson of lessons) await build(lesson);
