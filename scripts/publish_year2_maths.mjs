// Publish only validated Year 2 packs into the local lesson server's directory.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(),qa=path.join(root,'.qa/year2-maths');
const read=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lessons=await read(path.join(qa,'lessons.json'));
const pdfChecks=await read(path.join(qa,'pdf-validation.json'));
if(lessons.length!==150||pdfChecks.length!==600)throw Error('Incomplete Year 2 validation');
const copies=[];
for(const l of lessons){
 const id=`2-${l.week}-${l.day}`,build=path.join(qa,'build',id),m=await read(path.join(build,'manifest.json'));
 const fit=await read(path.join(build,'text-fit.json'));
 if(fit.length)throw Error('Text overflow: '+id);
 const receipt=await read(path.join(qa,'validation-'+m.finalizationRevision,id+'.json'));
 const ppt=path.join(qa,'final-'+m.finalizationRevision,id+'.pptx');
 if(receipt.finalSha256!==sha(await fs.readFile(ppt))||receipt.packageIntegrity.status!=='pass'||receipt.presentationLayout.finding_count||receipt.presentationLayout.warning_count)throw Error('Invalid PowerPoint: '+id);
 if(m.count!==14||JSON.stringify(l.expected)!==JSON.stringify(m.expectedQuestions))throw Error('Stale PowerPoint: '+id);
 const dest=`lessons/year-2-maths/week-${l.week}/${l.slug}`;
 copies.push([ppt,`${dest}/interactive-teaching-slides.pptx`]);
 for(const name of ['lower-worksheet.pdf','expected-worksheet.pdf','higher-worksheet.pdf','pre-teach.pdf','editable-teacher-plan.docx','preview/teacher-plan.pdf'])copies.push([path.join(qa,'resources',id,name),`${dest}/${name}`]);
 for(let slide=1;slide<=14;slide++)copies.push([path.join(build,'preview',`slide-${slide}.png`),`${dest}/preview/powerpoint/slide-${slide}.png`]);
 for(const level of ['lower','expected','higher'])copies.push([path.join(qa,'renders',id,level+'-worksheet','page-1.png'),`${dest}/preview/${level}-worksheet.png`]);
}
// Validate every input exists before changing the published folder.
await Promise.all(copies.map(([source])=>fs.access(source)));
const files=[];
async function record(file){const bytes=await fs.readFile(path.join(root,file));files.push({file,bytes:bytes.length,sha256:sha(bytes)});}
for(const [source,dest] of copies){await fs.mkdir(path.dirname(path.join(root,dest)),{recursive:true});await fs.copyFile(source,path.join(root,dest));await record(dest);}
for(let week=1;week<=30;week++){
 const file=`lessons/year-2-maths/week-${week}/week${week}-lessons.json`;
 await fs.writeFile(file,JSON.stringify(lessons.filter(l=>l.week===week).map(l=>({...l,teachingSlides:{count:14}})),null,2)+'\n');await record(file);
}
await fs.copyFile(path.join(qa,'curriculum.json'),'public/curriculum-plans/maths/year-2.json');
await fs.mkdir('scripts/releases',{recursive:true});
await fs.writeFile('scripts/releases/year2-maths.json',JSON.stringify({year:2,lessons:150,powerPoints:150,worksheets:450,pupilPagesPerWorksheet:1,questionsPerWorksheet:5,teacherPlans:150,preTeach:150,files},null,2)+'\n');
console.log(`Published 150 complete Year 2 packs locally: ${files.length} files.`);
