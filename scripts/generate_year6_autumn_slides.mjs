import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const artifactToolPath = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const SKILL_DIR = "C:/Users/garim/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const { resolvePresentationFont } = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href);
const family = resolvePresentationFont();
const handwriting = "Segoe Print";
const term = (process.argv[2] ?? "autumn").toLowerCase();
if (!["autumn", "spring", "summer"].includes(term)) throw new Error(`Unknown term: ${term}`);
const lessons = JSON.parse(await fs.readFile(path.join(ROOT, `public/lessons/year-6-maths/${term}/year6-${term}-lessons.json`), "utf8"));
const characterBytes = await fs.readFile(path.join(ROOT, "public/lessons/year-6-maths/shared/miro-misconception-character.png"));
const stageRoot = path.join(ROOT, ".qa", `year6-${term}-pptx`);
await fs.mkdir(stageRoot, { recursive: true });

const C = {
  navy: "#18324A", teal: "#2C6E73", tealLight: "#E7F1F1", ink: "#17253A",
  muted: "#5F6E7C", cream: "#FBF7F0", white: "#FFFFFF", line: "#D9E0E6",
  warm: "#F4E8DA", red: "#B4232B", green: "#2F785D", gold: "#B7791F",
};

function box(slide, left, top, width, height, fill = C.white, geometry = "roundRect", line = C.line, lineWidth = 1) {
  return slide.shapes.add({ geometry, position: { left, top, width, height }, fill, line: { fill: line, width: lineWidth } });
}

function text(slide, value, left, top, width, height, size = 26, color = C.ink, bold = false, align = "left", typeface = family) {
  const shape = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { fill: "none", width: 0 } });
  shape.text = value;
  shape.text.style = { typeface, fontSize: size, color, bold, alignment: align, verticalAlignment: "middle", autoFit: "shrinkText" };
  return shape;
}

function revealText(slide, value, left, top, width, height, size = 26, color = C.ink, bold = false, align = "left") {
  return text(slide, `[[CLICK]] ${value}`, left, top, width, height, size, color, bold, align);
}

function baseSlide(presentation, item, title, number, phase) {
  const slide = presentation.slides.add();
  slide.background.fill = C.cream;
  box(slide, 0, 0, 1280, 14, C.teal, "rect", C.teal, 0);
  text(slide, phase, 58, 65, 150, 40, 15, C.white, true, "center");
  box(slide, 58, 65, 150, 40, phase === "I DO" ? C.navy : phase === "WE DO" ? C.teal : phase === "YOU DO" ? C.green : C.red, "roundRect", "none", 0);
  // Re-add the phase text above the coloured label.
  text(slide, phase, 58, 66, 150, 38, 15, C.white, true, "center");
  text(slide, title, 232, 58, 850, 58, 34, C.ink, true);
  text(slide, `${number} / 12`, 1110, 40, 105, 26, 13, C.muted, true, "right");
  box(slide, 58, 677, 1164, 2, C.line, "rect", C.line, 0);
  text(slide, "BrightPath Primary Learning", 58, 687, 330, 20, 11, C.muted);
  text(slide, item.title, 700, 687, 522, 20, 11, C.muted, false, "right");
  return slide;
}

function note(slide, value) {
  slide.speakerNotes.textFrame.setText(value);
}

function longDivisionModel(item) {
  if (!item.unit.toLowerCase().includes("division") || item.unit.toLowerCase().includes("fraction")) return null;
  const match = item.modelQuestion.match(/([\d,]+)\s*(?:\/|÷|divided by)\s*([\d,]+)/i);
  if (!match) return null;
  const dividend = Number(match[1].replaceAll(",", ""));
  const divisor = Number(match[2].replaceAll(",", ""));
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || divisor <= 0) return null;
  const digits = String(dividend).split("").map(Number);
  const stages = [];
  let remainder = 0;
  let quotient = "";
  let started = false;
  for (let index = 0; index < digits.length; index += 1) {
    const current = remainder * 10 + digits[index];
    const digit = Math.floor(current / divisor);
    remainder = current - digit * divisor;
    if (!started && digit === 0) continue;
    started = true;
    quotient += String(digit);
    const next = index < digits.length - 1 ? ` Bring down ${digits[index + 1]}.` : "";
    stages.push(`${current} ÷ ${divisor} = ${digit}. Write ${digit}; subtract ${digit * divisor}; remainder ${remainder}.${next}`);
  }
  if (!started) quotient = "0";
  const sideFacts = [[1, 2, 3], [4, 5, 6], [7, 8, 9]].map(group =>
    group.map(value => `${value} × ${divisor} = ${value * divisor}`).join("     ")
  );
  stages.push(`Quotient ${quotient}${remainder ? ` remainder ${remainder}` : ""}. Check: ${quotient} × ${divisor}${remainder ? ` + ${remainder}` : ""} = ${dividend}.`);
  return { kind: "division", sideFacts, stages: stages.slice(0, 4) };
}

function longMultiplicationModel(item) {
  if (!item.unit.toLowerCase().includes("multiplication")) return null;
  const match = item.modelQuestion.match(/([\d,]+)\s*[x×]\s*([\d,]+)/i);
  if (!match) return null;
  const first = Number(match[1].replaceAll(",", ""));
  const second = Number(match[2].replaceAll(",", ""));
  if (!Number.isInteger(first) || !Number.isInteger(second) || second < 10 || second > 99) return null;
  const ones = second % 10;
  const tens = Math.floor(second / 10) * 10;
  return {
    kind: "multiplication",
    sideFacts: [`Ones row: ${first} × ${ones} = ${first * ones}`, `Tens row: ${first} × ${tens} = ${first * tens}`, `Estimate first: ${item.modelSteps[0]}`],
    stages: [
      `Write ${first} × ${second} in place-value columns.`,
      `Multiply by ${ones}: first partial product ${first * ones}.`,
      `Multiply by ${tens}: second partial product ${first * tens}.`,
      `Add the partial products: ${first * ones} + ${first * tens} = ${first * second}.`,
    ],
  };
}

function workedModel(item) {
  return longDivisionModel(item) ?? longMultiplicationModel(item) ?? {
    kind: "general",
    sideFacts: [],
    stages: [
      `Identify the structure: ${item.modelSteps[0]}`,
      `Set up the method: ${item.modelSteps[1]}`,
      `Complete the calculation: ${item.modelAnswer}`,
      `Check the result: ${item.modelSteps[2]}`,
    ],
  };
}

function titleLine(slide, label, value, top) {
  text(slide, label, 90, top, 185, 42, 18, C.teal, true);
  box(slide, 285, top - 5, 900, 58, C.white, "roundRect", C.line, 1.5);
  text(slide, value, 310, top, 850, 45, 25, C.ink, false);
}

function questionRow(slide, number, question, top, fill = C.white, reveal = true) {
  box(slide, 82, top, 1116, 116, fill, "roundRect", C.line, 1.2);
  box(slide, 102, top + 28, 58, 58, C.teal, "ellipse", C.teal, 0);
  text(slide, String(number), 102, top + 32, 58, 50, 20, C.white, true, "center");
  const add = reveal ? revealText : text;
  add(slide, question, 186, top + 20, 975, 76, 23, C.ink, true);
}

async function buildDeck(item) {
  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  let slide = presentation.slides.add();
  slide.background.fill = C.cream;
  box(slide, 0, 0, 1280, 18, C.teal, "rect", C.teal, 0);
  text(slide, "BRIGHTPATH PRIMARY LEARNING", 64, 44, 570, 30, 15, C.teal, true);
  box(slide, 900, 40, 310, 72, C.white, "roundRect", C.navy, 1.5);
  text(slide, "Date:  ____ / ____ / ______", 930, 55, 250, 42, 22, C.ink, false, "center", handwriting);
  text(slide, item.title, 64, 168, 900, 110, 46, C.ink, true);
  box(slide, 64, 312, 850, 150, C.white, "roundRect", C.navy, 2);
  text(slide, "L.I.", 92, 332, 100, 38, 25, C.red, true, "left", handwriting);
  text(slide, item.objective, 92, 375, 790, 64, 27, C.ink, false);
  text(slide, "Ready for learning", 64, 502, 260, 34, 17, C.teal, true);
  text(slide, `Pencil and ruler ready  |  Mini whiteboard ready  |  ${item.resources.split(",")[0]}`, 64, 540, 1080, 62, 20, C.ink, false);
  text(slide, "Today: I do  |  We do  |  You do", 64, 625, 600, 32, 18, C.teal, true);
  note(slide, `Change the date before teaching. Check resources. Read the learning intention aloud and clarify success. Resources: ${item.resources}`);

  slide = baseSlide(presentation, item, "Previous learning", 2, "RETRIEVE");
  questionRow(slide, 1, `Which part of this prior learning is secure? ${item.prior}`, 150, C.white, true);
  questionRow(slide, 2, item.preteach.questions[1].q, 285, C.tealLight, true);
  questionRow(slide, 3, item.preteach.questions[2].q, 420, C.white, true);
  text(slide, "Commit on your whiteboard before discussing.", 260, 575, 760, 48, 20, C.teal, true, "center");
  note(slide, `Reveal each prompt on click. Use responses to identify pupils who need immediate rehearsal. Suggested responses: ${item.preteach.questions.map(q => q.a).join(" | ")}`);

  slide = baseSlide(presentation, item, "New learning", 3, "LEARN");
  text(slide, item.objective, 90, 150, 1100, 70, 31, C.ink, true, "center");
  box(slide, 110, 252, 1060, 2, C.line, "rect", C.line, 0);
  revealText(slide, `Key idea: ${item.modelSteps[0]}`, 125, 280, 1030, 70, 25, C.navy, true);
  revealText(slide, `Then: ${item.modelSteps[1]}`, 125, 375, 1030, 70, 25, C.teal, true);
  revealText(slide, `Check: ${item.modelSteps[2]}`, 125, 470, 1030, 70, 25, C.green, true);
  text(slide, `Vocabulary: ${item.vocabulary.join("  |  ")}`, 120, 585, 1040, 42, 18, C.muted, false, "center");
  note(slide, `Teach the mathematical idea before asking pupils to solve. Define the vocabulary in context: ${item.vocabulary.join(", ")}. Reveal the three statements one at a time.`);

  slide = baseSlide(presentation, item, "Worked example", 4, "I DO");
  const worked = workedModel(item);
  revealText(slide, item.modelQuestion, 96, 132, 1088, 82, 29, C.ink, true, "center");
  if (worked.kind === "division") {
    box(slide, 72, 236, 410, 350, C.white, "roundRect", C.line, 1.3);
    text(slide, "Useful multiples", 98, 252, 356, 34, 18, C.teal, true, "center");
    worked.sideFacts.forEach((fact, index) => revealText(slide, fact, 96, 310 + index * 78, 362, 54, 17, C.ink, true, "center"));
    box(slide, 510, 236, 698, 350, C.tealLight, "roundRect", C.line, 1.3);
    worked.stages.forEach((step, index) => revealText(slide, `${index + 1}. ${step}`, 540, 252 + index * 77, 640, 62, 18, index === worked.stages.length - 1 ? C.green : C.ink, index === worked.stages.length - 1));
  } else {
    if (worked.sideFacts.length) {
      box(slide, 82, 228, 1116, 64, C.tealLight, "roundRect", C.line, 1.2);
      worked.sideFacts.forEach((fact, index) => revealText(slide, fact, 100 + index * 360, 238, 340, 44, 15, C.teal, true, "center"));
    }
    const startTop = worked.sideFacts.length ? 318 : 236;
    worked.stages.forEach((step, index) => {
      box(slide, 105, startTop + index * 78, 50, 50, index === 0 ? C.navy : C.teal, "ellipse", "none", 0);
      text(slide, String(index + 1), 105, startTop + index * 3 + index * 75 + 3, 50, 44, 18, C.white, true, "center");
      revealText(slide, step, 180, startTop - 7 + index * 78, 990, 64, 20, index === worked.stages.length - 1 ? C.green : C.ink, index === worked.stages.length - 1);
    });
  }
  note(slide, `I do. Reveal the question, setup and each calculation stage one click at a time. Pupils watch before copying. Model answer: ${item.modelAnswer}`);

  slide = baseSlide(presentation, item, "Worked answer and check", 5, "I DO");
  text(slide, "Model answer", 105, 160, 260, 40, 19, C.teal, true);
  revealText(slide, item.modelAnswer, 105, 215, 1070, 130, 38, C.ink, true, "center");
  box(slide, 105, 382, 1070, 2, C.line, "rect", C.line, 0);
  revealText(slide, `Reasonableness check: ${item.modelSteps[2]}`, 145, 420, 990, 74, 25, C.green, true, "center");
  revealText(slide, "Explain which step carries the mathematical meaning and why.", 145, 525, 990, 70, 24, C.navy, true, "center");
  note(slide, `Reveal the answer only after completing the method. Check it against the estimate, inverse or representation. Ask pupils to explain why the answer is reasonable.`);

  slide = baseSlide(presentation, item, "Guided example", 6, "WE DO");
  text(slide, item.guidedQuestion, 100, 160, 1080, 105, 32, C.ink, true, "center");
  text(slide, "Think alone", 130, 320, 260, 40, 20, C.navy, true, "center");
  text(slide, "Compare a step", 510, 320, 260, 40, 20, C.teal, true, "center");
  text(slide, "Commit together", 890, 320, 260, 40, 20, C.green, true, "center");
  revealText(slide, "Which representation or operation will we use first?", 180, 405, 920, 54, 23, C.ink, true, "center");
  revealText(slide, `Answer: ${item.guidedAnswer}`, 180, 505, 920, 75, 30, C.teal, true, "center");
  note(slide, `We do. Give silent thinking time before paired talk. Take one step at a time. Do not reveal the answer until every pupil has committed. Answer: ${item.guidedAnswer}`);

  slide = baseSlide(presentation, item, "Miro's misconception", 7, "CHECK");
  slide.images.add({ blob: characterBytes, contentType: "image/png", alt: "Miro, the Year 6 misconception character, holding a mini whiteboard", fit: "contain", position: { left: 845, top: 145, width: 315, height: 470 } });
  text(slide, "Miro thinks...", 95, 160, 300, 48, 22, C.red, true);
  revealText(slide, item.misconception, 95, 220, 680, 145, 29, C.ink, true);
  box(slide, 95, 405, 680, 2, C.line, "rect", C.line, 0);
  text(slide, "What should Miro change?", 95, 438, 620, 45, 22, C.teal, true);
  revealText(slide, item.correction, 95, 495, 680, 110, 24, C.green, true);
  note(slide, `Miro is a deliberate misconception prompt. Reveal his claim, let pupils identify the error, then reveal the correction. Do not present Miro as lacking ability. Correction: ${item.correction}`);

  slide = baseSlide(presentation, item, "Guided check", 8, "WE DO");
  questionRow(slide, 1, item.guidedQuestion, 150, C.white, true);
  questionRow(slide, 2, "Show the first step and explain why it comes first.", 285, C.tealLight, true);
  questionRow(slide, 3, `Compare with the answer: ${item.guidedAnswer}`, 420, C.white, true);
  text(slide, "Agree, disagree or improve the explanation.", 260, 575, 760, 48, 20, C.teal, true, "center");
  note(slide, `Use whole-class response routines. Reveal each prompt separately. Expected answer: ${item.guidedAnswer}. Insist on a reason, not only a numerical response.`);

  slide = baseSlide(presentation, item, "Independent fluency", 9, "YOU DO");
  questionRow(slide, 1, item.practiceQuestion, 150, C.white, true);
  questionRow(slide, 2, "Record every stage clearly. Mark the place value, operation or boundary that matters.", 285, C.tealLight, true);
  questionRow(slide, 3, "Use an inverse, estimate or equivalent representation to check.", 420, C.white, true);
  note(slide, `You do. Pupils complete the core question independently before discussion. Answer: ${item.practiceAnswer}. Circulate and note methods as well as accuracy.`);

  slide = baseSlide(presentation, item, "Reasoning and depth", 10, "YOU DO");
  text(slide, item.challengeQuestion, 105, 160, 1070, 120, 31, C.ink, true, "center");
  revealText(slide, "Show enough evidence for another pupil to follow your reasoning.", 150, 330, 980, 65, 24, C.navy, true, "center");
  revealText(slide, "Can you find a second method, example or counterexample?", 150, 435, 980, 65, 24, C.teal, true, "center");
  revealText(slide, `Teacher check: ${item.challengeAnswer}`, 150, 540, 980, 62, 22, C.green, true, "center");
  note(slide, `Use after secure fluency or as the higher worksheet route. Accept different correct approaches when fully justified. Expected response: ${item.challengeAnswer}`);

  slide = baseSlide(presentation, item, "Independent practice", 11, "PRACTISE");
  text(slide, "Try this example independently", 82, 155, 700, 42, 20, C.teal, true);
  box(slide, 82, 215, 720, 300, C.white, "roundRect", C.line, 1.5);
  text(slide, item.practiceQuestion, 120, 252, 642, 150, 31, C.ink, true, "center");
  text(slide, "Show your method and check your answer.", 135, 430, 610, 42, 20, C.muted, false, "center");
  text(slide, "Answer", 862, 175, 275, 40, 20, C.teal, true, "center");
  box(slide, 840, 230, 320, 285, C.tealLight, "roundRect", C.teal, 1.5);
  revealText(slide, item.practiceAnswer, 875, 275, 250, 130, 34, C.green, true, "center");
  revealText(slide, "Explain how you know.", 875, 420, 250, 46, 19, C.navy, true, "center");
  text(slide, "The answer appears on click after pupils have committed.", 230, 560, 820, 48, 20, C.teal, true, "center");
  note(slide, `Show only the core independent-practice example. Give pupils time to solve and check before revealing the answer at the side. Answer: ${item.practiceAnswer}`);

  slide = baseSlide(presentation, item, "Exit check", 12, "ASSESS");
  item.exitQuestions.forEach((question, index) => questionRow(slide, index + 1, question, 150 + index * 135, index === 1 ? C.tealLight : C.white, true));
  text(slide, "Teacher records: secure  |  revisit  |  pre-teach next", 260, 575, 760, 48, 20, C.teal, true, "center");
  note(slide, `Reveal one exit question at a time. Answers: ${item.exitAnswers.join(" | ")}. Record a specific next step from pupil work and explanation.`);

  const stageDir = path.join(stageRoot, `week-${item.week}`, `${item.day}-${item.slug}`);
  await fs.mkdir(stageDir, { recursive: true });
  const candidatePath = path.join(stageDir, "candidate.pptx");
  await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
  console.log(path.relative(ROOT, candidatePath));
}

const selector = process.argv[3];
const selectedLessons = selector
  ? lessons.filter(item => `${item.week}-${item.day}` === selector)
  : lessons;
if (selector && selectedLessons.length !== 1) {
  throw new Error(`Expected one lesson for selector ${selector}; found ${selectedLessons.length}.`);
}
for (const item of selectedLessons) {
  await buildDeck(item);
}
