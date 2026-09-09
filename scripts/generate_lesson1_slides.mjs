import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const artifactToolPath = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1")), "..");
const SKILL_DIR = "C:/Users/garim/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const RUNTIME_PYTHON = "C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href);

const family = resolvePresentationFont();
const handFamily = "Segoe Print";
const lesson = JSON.parse(await fs.readFile(path.join(ROOT, "public/lessons/year-1-maths/week-1/week1-lessons.json"), "utf8"))[0];
const assetRoot = path.join(ROOT, "public/lessons/year-1-maths/shared");
const mascotBytes = await fs.readFile(path.join(assetRoot, "pip-maths-mascot.png"));
const backgroundBytes = await fs.readFile(path.join(assetRoot, "sorting-lesson-background.png"));

const C = {
  red: "#B4232B", coral: "#F15B4A", cream: "#FFF7EA", pale: "#FFF0E7",
  ink: "#17253A", slate: "#40516A", muted: "#6B788A", white: "#FFFFFF",
  line: "#D9DEE7", yellow: "#F6C84C", blue: "#3F7DC0", green: "#4D9A72",
  sky: "#E9F4FB", lavender: "#F3ECFA",
};

function rect(slide, left, top, width, height, fill, geometry = "roundRect", line = "none", lineWidth = 0) {
  return slide.shapes.add({ geometry, position: { left, top, width, height }, fill, line: { fill: line, width: lineWidth } });
}

function addText(slide, value, left, top, width, height, size = 26, color = C.ink, bold = false, align = "left") {
  const box = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { fill: "none", width: 0 } });
  box.text = value;
  box.text.style = { typeface: family, fontSize: size, color, bold, alignment: align, verticalAlignment: "middle", autoFit: "shrinkText" };
  return box;
}

function handText(slide, value, left, top, width, height, size = 26, color = C.ink, bold = false, align = "left") {
  const box = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { fill: "none", width: 0 } });
  box.text = value;
  box.text.style = { typeface: handFamily, fontSize: size, color, bold, alignment: align, verticalAlignment: "middle", autoFit: "shrinkText" };
  return box;
}

function addMascot(slide, left, top, width, height, alt = "Pip, the BrightPath maths mascot") {
  return slide.images.add({ blob: mascotBytes, contentType: "image/png", alt, fit: "contain", position: { left, top, width, height } });
}

function baseSlide(pres, title, number, tag = "LEARN") {
  const slide = pres.slides.add();
  slide.background.fill = C.cream;
  rect(slide, 0, 0, 1280, 18, C.red, "rect");
  addText(slide, `YEAR 1 MATHS  •  AUTUMN  •  WEEK 1  •  DAY 1`, 58, 30, 720, 28, 14, C.red, true);
  rect(slide, 58, 72, 130, 34, C.red);
  addText(slide, tag, 62, 74, 122, 28, 10, C.white, true, "center");
  addText(slide, title, 206, 62, 892, 58, 35, C.ink, true);
  addText(slide, `${number} / 15`, 1120, 42, 100, 24, 13, C.muted, true, "right");
  rect(slide, 58, 678, 1164, 2, C.line, "rect");
  addText(slide, "BrightPath Primary Learning", 58, 687, 360, 20, 12, C.muted);
  addText(slide, "Sort objects into groups", 890, 687, 332, 20, 12, C.muted, false, "right");
  return slide;
}

function label(slide, value, left, top, width, fill = C.pale, color = C.red) {
  rect(slide, left, top, width, 38, fill);
  addText(slide, value, left + 10, top + 3, width - 20, 31, 15, color, true, "center");
}

function note(slide, text) {
  slide.speakerNotes.textFrame.setText(text);
}

function speech(slide, value, left, top, width, height, fill = C.white) {
  rect(slide, left, top, width, height, fill, "roundRect", C.line, 2);
  addText(slide, value, left + 22, top + 12, width - 44, height - 24, 22, C.ink, true, "center");
}

function objectShape(slide, kind, left, top, size, fill) {
  const geometry = kind === "circle" ? "ellipse" : kind === "triangle" ? "triangle" : "rect";
  return rect(slide, left, top, size, size, fill, geometry, C.ink, 2);
}

function hoop(slide, title, left, top, width, height, accent) {
  rect(slide, left, top, width, height, C.white, "roundRect", accent, 6);
  label(slide, title, left + 42, top + 18, width - 84, accent, C.white);
}

const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });

// 1 — Reference-inspired editable title slide.
let s = pres.slides.add();
s.images.add({ blob: backgroundBytes, contentType: "image/png", alt: "Sorting hoops and colourful classroom maths objects", fit: "cover", position: { left: 0, top: 0, width: 1280, height: 720 } });
rect(s, 860, 38, 350, 76, C.white, "roundRect", C.ink, 2);
handText(s, "Date:  __ / __ / ____", 880, 49, 310, 54, 24, C.ink, false, "center");
rect(s, 48, 318, 740, 208, C.white, "roundRect", C.ink, 2);
handText(s, "L.I.", 84, 340, 110, 44, 25, C.red, false);
handText(s, "To sort objects into groups", 84, 390, 650, 98, 34, C.ink, false);
rect(s, 48, 580, 1182, 92, C.ink, "roundRect");
addText(s, "READY?   ✓ sharp pencil   ✓ mini whiteboard   ✓ sorting objects or counters   ✓ listening partner", 78, 597, 1120, 58, 19, C.white, true, "center");
note(s, "Editable opening slide. Change the date before teaching. Read the learning intention together. Check pupils have a sharp pencil, mini whiteboard, sorting objects or counters, and a listening partner. Ask: What do you think the two hoops might help us do?");

// 2 — Explicit teaching before interaction.
s = baseSlide(pres, "What does sorting mean?", 2, "TEACH");
speech(s, "Sorting means putting objects into groups using one clear rule.", 120, 145, 1040, 82, C.white);
hoop(s, "RED", 95, 280, 330, 245, C.red);
hoop(s, "BLUE", 475, 280, 330, 245, C.blue);
objectShape(s, "circle", 165, 385, 58, C.red);
objectShape(s, "square", 280, 385, 58, C.red);
objectShape(s, "circle", 545, 385, 58, C.blue);
objectShape(s, "square", 660, 385, 58, C.blue);
rect(s, 855, 280, 330, 245, C.pale, "roundRect", C.red, 2);
label(s, "NOT A CLEAR SORT", 900, 302, 240, C.red, C.white);
objectShape(s, "circle", 920, 400, 58, C.red);
objectShape(s, "square", 1010, 400, 58, C.blue);
objectShape(s, "triangle", 1100, 400, 58, C.red);
addText(s, "The first two groups follow colour. The last box has no stated rule.", 170, 570, 940, 48, 22, C.slate, true, "center");
note(s, "This is the core teaching definition. Read it aloud, then model the contrast. The red and blue groups use one clear property: colour. The mixed box is not automatically wrong, but without a stated rule we cannot check it. Emphasise that a good sort can be explained and checked.");

// 3 — Previous learning prompt.
s = baseSlide(pres, "Previous learning: same and different", 3, "REVISIT");
addText(s, "Look carefully. What is the same? What is different?", 92, 140, 1096, 64, 30, C.ink, true, "center");
rect(s, 168, 235, 944, 290, C.white, "roundRect", C.line, 2);
objectShape(s, "circle", 278, 320, 92, C.red);
objectShape(s, "circle", 474, 320, 92, C.blue);
objectShape(s, "square", 670, 320, 92, C.red);
objectShape(s, "triangle", 866, 320, 92, C.blue);
label(s, "THINK", 280, 555, 160, C.sky, C.blue);
label(s, "PAIR", 560, 555, 160, C.pale, C.red);
label(s, "SHARE", 840, 555, 160, C.lavender, "#76469A");
note(s, "Allow 20 seconds of silent noticing. Then partners use: ‘The ___ and ___ are the same because…’ and ‘They are different because…’. Listen for colour and shape language. This checks prior knowledge before the new lesson.");

// 4 — Previous learning reveal.
s = baseSlide(pres, "Check our noticing", 4, "REVEAL");
speech(s, "Same colour", 100, 160, 290, 86, C.pale);
speech(s, "Same shape", 495, 160, 290, 86, C.sky);
speech(s, "Different size or type", 890, 160, 290, 86, C.lavender);
addText(s, "An object can have more than one property.", 100, 300, 1080, 56, 31, C.ink, true, "center");
rect(s, 182, 398, 916, 132, C.white, "roundRect", C.line, 2);
addText(s, "A property is something we can notice about an object — for example its colour, shape, size or type.", 220, 420, 840, 88, 26, C.slate, false, "center");
addText(s, "Teacher check: ask three pupils to give one property each.", 260, 580, 760, 34, 18, C.red, true, "center");
note(s, "Click to this slide after pupils have shared. Accept accurate everyday language, then recast it using the word property. If pupils struggle, hold up two real objects and ask one binary question at a time: same colour? same shape?");

// 5 — Vocabulary and mascot introduction.
s = baseSlide(pres, "Words we will use", 5, "VOCABULARY");
addMascot(s, 60, 175, 320, 430);
speech(s, "I’m Pip. Sometimes I sort things wrongly. Can you spot my mistakes?", 350, 155, 820, 94, C.white);
const words = [
  ["SORT", "put things into groups"], ["GROUP", "things that belong together"],
  ["PROPERTY", "something we notice"], ["RULE", "how we decide where things go"],
  ["SAME", "matching in one way"], ["DIFFERENT", "not matching in that way"],
];
words.forEach(([word, meaning], i) => {
  const col = i % 2; const row = Math.floor(i / 2);
  const left = 390 + col * 400; const top = 290 + row * 94;
  label(s, word, left, top, 150, col ? C.sky : C.pale, col ? C.blue : C.red);
  addText(s, meaning, left + 165, top, 220, 38, 18, C.slate);
});
note(s, "Pre-teach pupils may already know colour and shape; emphasise sort, group, property and rule. Add gestures: sweep hands apart for sort; make a circle with arms for group; point to an object detail for property; draw an imaginary line for rule.");

// 6 — Explicit method teaching.
s = baseSlide(pres, "Four steps for a careful sort", 6, "TEACH");
const method = [
  ["1", "NOTICE", "Look at the objects and name their properties."],
  ["2", "CHOOSE", "Choose one property, such as colour."],
  ["3", "SAY + PLACE", "Say the rule, then place one object at a time."],
  ["4", "CHECK", "Check every object against the same rule."],
];
method.forEach(([num, head, body], i) => {
  const left = 70 + i * 300;
  rect(s, left, 165, 270, 400, i % 2 ? C.sky : C.pale, "roundRect", i % 2 ? C.blue : C.red, 2);
  rect(s, left + 95, 195, 80, 80, i % 2 ? C.blue : C.red, "ellipse");
  addText(s, num, left + 95, 205, 80, 58, 30, C.white, true, "center");
  addText(s, head, left + 30, 305, 210, 46, 22, C.ink, true, "center");
  addText(s, body, left + 30, 370, 210, 125, 20, C.slate, false, "center");
});
speech(s, "Remember: one object can have many properties. The rule tells us which one matters now.", 190, 590, 900, 60, C.white);
note(s, "Teach and rehearse these four steps before the worked model. Use gestures and point to each card. Ask pupils to say the sequence back. Keep this language consistent in future Maths lessons so pupils can become independent.");

// 7 — Explicit model.
s = baseSlide(pres, "Teacher model: sort by colour", 7, "MODEL");
hoop(s, "RED GROUP", 70, 160, 535, 420, C.red);
hoop(s, "BLUE GROUP", 675, 160, 535, 420, C.blue);
objectShape(s, "circle", 175, 310, 80, C.red);
objectShape(s, "square", 330, 310, 80, C.red);
objectShape(s, "triangle", 465, 310, 80, C.red);
objectShape(s, "circle", 780, 310, 80, C.blue);
objectShape(s, "square", 935, 310, 80, C.blue);
objectShape(s, "triangle", 1070, 310, 80, C.blue);
addText(s, "My rule: I am sorting by colour.", 250, 606, 780, 40, 24, C.red, true, "center");
note(s, "Use real objects beside the slide. Think aloud: 1) I choose one property. 2) I say my rule. 3) I place one object at a time. 4) I check every object follows the same rule. Ask pupils to repeat the rule before each placement.");

// 8 — Guided participation.
s = baseSlide(pres, "Your turn: where should it go?", 8, "GUIDED");
hoop(s, "RED", 120, 210, 390, 300, C.red);
hoop(s, "BLUE", 770, 210, 390, 300, C.blue);
objectShape(s, "triangle", 590, 300, 100, C.blue);
addText(s, "Point, then explain using the sentence stem.", 200, 135, 880, 50, 28, C.ink, true, "center");
speech(s, "The blue triangle belongs in the ______ group because ______.", 220, 555, 840, 72, C.white);
note(s, "No calling out. Pupils point first, then rehearse with a partner. Cold-call after rehearsal. Expected response: ‘The blue triangle belongs in the blue group because it is blue.’ Ask: Would its shape change our colour rule?");

// 9 — Misconception challenge.
s = baseSlide(pres, "Pip’s mistake: spot it and explain", 9, "MISCONCEPTION");
addMascot(s, 55, 218, 270, 360, "Pip holding sorting cards and looking unsure");
speech(s, "I sorted by colour. I think every object is correct!", 270, 140, 830, 76, C.white);
hoop(s, "RED", 360, 250, 350, 270, C.red);
hoop(s, "BLUE", 800, 250, 350, 270, C.blue);
objectShape(s, "circle", 420, 360, 66, C.red);
objectShape(s, "square", 515, 360, 66, C.red);
objectShape(s, "triangle", 612, 360, 66, C.blue);
objectShape(s, "circle", 855, 360, 66, C.blue);
objectShape(s, "square", 950, 360, 66, C.blue);
addText(s, "Think → point to the mistake → tell your partner why", 350, 565, 800, 46, 23, C.red, true, "center");
note(s, "Give silent think time. The blue triangle is in the red group. Probe: What rule did Pip say? Which property matters for this rule? Do not move the shape until pupils explain.");

// 10 — Misconception correction reveal.
s = baseSlide(pres, "Correct Pip’s sort", 10, "REVEAL");
hoop(s, "RED", 100, 180, 470, 360, C.red);
hoop(s, "BLUE", 710, 180, 470, 360, C.blue);
objectShape(s, "circle", 210, 320, 74, C.red);
objectShape(s, "square", 370, 320, 74, C.red);
objectShape(s, "circle", 800, 320, 74, C.blue);
objectShape(s, "square", 930, 320, 74, C.blue);
objectShape(s, "triangle", 1060, 320, 74, C.blue);
speech(s, "We moved the blue triangle because the rule was colour, not shape.", 230, 575, 820, 62, C.white);
note(s, "Reveal the correction. Ask for a full explanation. Then deliberately suggest moving the red square because it is not a circle; pupils should reject this by restating the colour rule. This checks that the sorting rule stays consistent.");

// 11 — Change the rule.
s = baseSlide(pres, "Same objects, new rule: sort by shape", 11, "TEACH + TRY");
hoop(s, "CIRCLES", 100, 185, 470, 375, C.green);
hoop(s, "SQUARES", 710, 185, 470, 375, "#76469A");
objectShape(s, "circle", 210, 330, 78, C.red);
objectShape(s, "circle", 370, 330, 78, C.blue);
objectShape(s, "square", 820, 330, 78, C.red);
objectShape(s, "square", 980, 330, 78, C.blue);
addText(s, "What changed? What stayed the same?", 270, 585, 740, 44, 26, C.ink, true, "center");
note(s, "Mix the same four physical objects and sort again by shape. Emphasise that the objects did not change; the chosen rule changed. Ask pupils to say both valid rules: by colour and by shape.");

// 12 — Partner reasoning.
s = baseSlide(pres, "Talk partner challenge", 12, "EXPLAIN");
rect(s, 80, 155, 530, 420, C.sky, "roundRect", C.blue, 2);
rect(s, 670, 155, 530, 420, C.pale, "roundRect", C.red, 2);
label(s, "PARTNER A", 215, 185, 260, C.blue, C.white);
label(s, "PARTNER B", 805, 185, 260, C.red, C.white);
addText(s, "Choose a rule and explain how you would sort four objects.", 125, 270, 440, 135, 27, C.ink, true, "center");
addText(s, "Listen. Repeat your partner’s rule, then ask one helpful question.", 715, 270, 440, 135, 27, C.ink, true, "center");
speech(s, "I sorted by ______. I know ______ belongs here because ______.", 190, 465, 900, 74, C.white);
note(s, "Use four real objects per pair. Encourage precise language. Questions pupils can ask: Does every object follow your rule? Could you use a different rule? Is any object difficult to place?");

// 13 — Extension.
s = baseSlide(pres, "Challenge: one set, two correct sorts", 13, "DEEPEN");
addText(s, "Make or draw a set of six objects that can be sorted in two different ways.", 110, 145, 1060, 80, 31, C.ink, true, "center");
rect(s, 115, 255, 480, 280, C.white, "roundRect", C.line, 2);
rect(s, 685, 255, 480, 280, C.white, "roundRect", C.line, 2);
label(s, "RULE 1", 250, 280, 210, C.pale, C.red);
label(s, "RULE 2", 820, 280, 210, C.sky, C.blue);
addText(s, "Draw the two groups.\nWrite: I sorted by…", 170, 355, 370, 110, 24, C.slate, true, "center");
addText(s, "Use the same objects.\nWhat changes?", 740, 355, 370, 110, 24, C.slate, true, "center");
speech(s, "Prove both rules work for every object.", 320, 575, 640, 62, C.cream);
note(s, "Early-finisher reasoning. A suitable set contains at least two colours and two shapes. Ask pupils to compare which rule creates equal groups, if either. Accept other valid properties such as size or type when consistently applied.");

// 14 — Differentiated independent practice, kept at the end of teaching.
s = baseSlide(pres, "Independent practice", 14, "PRACTISE");
addText(s, "Your teacher will give you the worksheet that helps you learn best today.", 160, 145, 960, 66, 29, C.ink, true, "center");
const cards = [
  ["PRACTISE WITH OBJECTS", "Sort one set using the shown rule. Say the rule aloud.", C.pale, C.red, "●"],
  ["WORK INDEPENDENTLY", "Sort the picture sets and explain the rule you used.", C.sky, C.blue, "● ●"],
  ["DEEPER THINKING", "Find two possible rules and explain how the groups change.", C.lavender, "#76469A", "● ● ●"],
];
cards.forEach(([title, body, fill, accent, dots], i) => {
  const left = 55 + i * 407;
  rect(s, left, 245, 370, 300, fill, "roundRect", accent, 2);
  addText(s, dots, left + 55, 265, 260, 38, 22, accent, true, "center");
  addText(s, title, left + 30, 320, 310, 48, 20, C.ink, true, "center");
  addText(s, body, left + 42, 382, 286, 105, 20, C.slate, false, "center");
});
addText(s, "The detailed group choices and adaptations are in the teacher plan.", 220, 600, 840, 36, 18, C.muted, true, "center");
note(s, "This slide appears only after the teaching sequence. Select the worksheet before the lesson using current learning need, not a fixed pupil label. Keep the detailed lower, expected and higher guidance in the teacher plan. Circulate with: ‘What is your rule? Does every object follow it?’");

// 15 — Exit check.
s = baseSlide(pres, "Exit check: ready for tomorrow?", 15, "ASSESS");
addMascot(s, 900, 225, 270, 360);
const qs = ["1. What does sort mean?", "2. Name one property we could use.", "3. Why must the rule stay the same?"];
qs.forEach((q, i) => {
  rect(s, 80, 155 + i * 130, 720, 96, i === 1 ? C.sky : C.white, "roundRect", i === 1 ? C.blue : C.line, 2);
  addText(s, q, 112, 170 + i * 130, 655, 66, 25, C.ink, true);
});
speech(s, "Show me: SECURE   |   NEARLY THERE   |   NEED MORE PRACTICE", 185, 565, 800, 62, C.pale);
note(s, "Expected answers: 1) put objects into groups; 2) colour, shape, size or type; 3) so every object can be checked fairly. Record initials of pupils who need tomorrow’s pre-teach. Do not use confidence alone—combine with explanations and the independent task.");

const stagingDir = path.join(ROOT, ".qa", "lesson1-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "lesson1-v5-candidate.pptx");
await (await PresentationFile.exportPptx(pres)).save(candidatePath);
const baseOutputDir = path.join(stagingDir, "base-output");
await fs.mkdir(baseOutputDir, { recursive: true });
const finalPath = path.join(baseOutputDir, "lesson1-v5-base.pptx");
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
  fontPolicy: { basis: "design", families: [family, handFamily] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "lesson1-v5-base-validation.json"),
});

console.log(finalPath);
