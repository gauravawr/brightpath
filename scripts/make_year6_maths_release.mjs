import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('lessons/year-6-maths');
const selected = new Set();
async function addFile(file) {
  const absolute = path.resolve(file);
  const relative = path.relative(path.resolve('.'), absolute).split(path.sep).join('/');
  selected.add(relative);
}
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) await addFile(full);
  }
}

let lessonCount = 0;
for (const term of ['autumn', 'spring', 'summer']) {
  const dataFile = path.join(root, term, `year6-${term}-lessons.json`);
  await addFile(dataFile);
  const lessons = JSON.parse(await fs.readFile(dataFile, 'utf8'));
  if (lessons.length !== 50) throw new Error(`${term} has ${lessons.length} lessons`);
  for (const item of lessons) {
    await walk(path.join(root, term, `week-${item.week}`, item.slug));
    lessonCount += 1;
  }
  await walk(path.join(root, 'evaluations', term));
}
await walk(path.join(root, 'shared'));

const files = [];
for (const file of [...selected].sort()) {
  const bytes = await fs.readFile(file);
  files.push({ file, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
}
const manifest = {
  year: 6,
  lessons: lessonCount,
  powerPoints: 150,
  teacherPlans: 150,
  preTeach: 150,
  differentiatedWorksheetPacks: 150,
  pupilWorksheetLevels: 450,
  termEvaluations: 3,
  files,
};
await fs.mkdir('scripts/releases', { recursive: true });
await fs.writeFile('scripts/releases/year6-maths.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared ${files.length} Year 6 release files for ${lessonCount} lessons.`);
