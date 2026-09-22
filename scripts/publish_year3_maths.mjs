// Publish only validated Year 3 packs into the local lesson server's directory.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(),qa=path.join(root,'.qa/year3-maths');
const read=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lessons=await read(path.join(qa,'lessons.json'));
const pdfChecks=await read(path.join(qa,'pdf-validation.json'));
if(lessons.length!==150||pdfChecks.length!==600)throw Error('Incomplete Year 3 validation');
const wordChecks=await read(path.join(qa,'teacher-plan-render-report.json'));
if(wordChecks.length!==150||wordChecks.some(x=>x.pages<3||x.pages>4))throw Error('Invalid teacher plan render');
const planChecks=await read(path.join(qa,'plan-validation.json'));
if(planChecks.length!==150)throw Error('Missing plan validation');
const nativeChecks=await read(path.join(qa,'native-animation-validation.json'));
if(nativeChecks.length!==150)throw Error('Missing native animation validation');
const animationLayoutChecks=await read(path.join(qa,'animation-layout-validation.json'));
if(animationLayoutChecks.length!==150)throw Error('Missing animation layout review');
const pacingChecks=await read(path.join(qa,'click-pacing-validation.json'));
if(pacingChecks.length!==150)throw Error('Missing teacher-click pacing validation');
const copies=[];
for(const l of lessons){
 const id=`3-${l.week}-${l.day}`,build=path.join(qa,'build',id),m=await read(path.join(build,'manifest.json'));
 const fit=await read(path.join(build,'text-fit.json'));
 if(fit.length)throw Error('Text overflow: '+id);
 const receipt=await read(path.join(qa,'validation-'+m.finalizationRevision,id+'.json'));
 const ppt=path.join(qa,'final-'+m.finalizationRevision,id+'.pptx');
 if(receipt.finalSha256!==sha(await fs.readFile(ppt))||receipt.packageIntegrity.status!=='pass'||receipt.presentationLayout.finding_count)throw Error('Invalid PowerPoint: '+id);
 const layoutReview=animationLayoutChecks.find(x=>x.id===m.id);
 if(pacingChecks.find(x=>x.id===m.id)?.sha256!==receipt.finalSha256)throw Error('Stale click-pacing validation: '+id);
 if(layoutReview?.sha256!==receipt.finalSha256||layoutReview.reviewedWarnings.length!==receipt.presentationLayout.warning_count)throw Error('Missing or stale animation overlap review: '+id);
 if(m.count!==14||JSON.stringify(l.expected)!==JSON.stringify(m.expectedQuestions))throw Error('Stale PowerPoint: '+id);
 if(nativeChecks.find(x=>x.id===`3:${l.week}.${l.day}`)?.sha256!==receipt.finalSha256)throw Error('Native check is stale: '+id);
 const dest=`lessons/year-3-maths/week-${l.week}/${l.slug}`;
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
 const file=`lessons/year-3-maths/week-${week}/week${week}-lessons.json`;
 await fs.writeFile(file,JSON.stringify(lessons.filter(l=>l.week===week).map(l=>({...l,teachingSlides:{count:14}})),null,2)+'\n');await record(file);
}
await fs.copyFile(path.join(qa,'curriculum.json'),'public/curriculum-plans/maths/year-3.json');
await fs.mkdir('scripts/releases',{recursive:true});
await fs.writeFile('scripts/releases/year3-maths.json',JSON.stringify({year:3,lessons:150,powerPoints:150,worksheets:450,pupilPagesPerWorksheet:1,questionsPerWorksheet:5,teacherPlans:150,preTeach:150,files},null,2)+'\n');
console.log(`Published 150 complete Year 3 packs locally: ${files.length} files.`);
