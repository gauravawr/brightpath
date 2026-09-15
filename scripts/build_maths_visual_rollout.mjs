// Build the existing Year 1 / Year 6 lesson decks without changing published files.
// node scripts/build_maths_visual_rollout.mjs <private-build-root> [year:week.day ...]
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Board,C,render} from './maths_visual_renderer.mjs';
import {exampleFor} from './maths_visual_models.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(process.argv[2]??path.join(ROOT,'../.qa/maths-rollout/build'));
const selected=process.argv.slice(3);
const runtime=process.env.ARTIFACT_TOOL_PATH??'C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const {Presentation,PresentationFile}=await import(pathToFileURL(runtime).href);
const all=[];
for(const term of ['autumn','spring','summer']){
 const rel=`lessons/year-6-maths/${term}/year6-${term}-lessons.json`;
 for(const item of JSON.parse(await fs.readFile(path.join(ROOT,rel),'utf8')))all.push({...item,year:6,term,source:rel,dir:`lessons/year-6-maths/${term}/week-${item.week}/${item.slug}`,file:'teaching-powerpoint-v1.pptx'});
}
for(const week of [1,2]){
 const rel=`lessons/year-1-maths/week-${week}/week${week}-lessons.json`;
 for(const item of JSON.parse(await fs.readFile(path.join(ROOT,rel),'utf8')))all.push({...item,week,year:1,term:'autumn',source:rel,dir:`lessons/year-1-maths/week-${week}/${item.slug}`,file:week===1&&item.day===1?'teaching-powerpoint-v5.pptx':'interactive-teaching-slides.pptx'});
}
await fs.mkdir(out,{recursive:true});
let completed=0;
const adaptable=text=>text.replace(/\b(?:autumn|spring|summer)(?: term)?\s*/gi,'').replace(/ {2,}/g,' ').trim();
for(const item of all){
 item.title=adaptable(item.title);item.objective=adaptable(item.objective);
 const id=`${item.year}:${item.week}.${item.day}`;
 if(selected.length&&!selected.includes(id))continue;
 const target=path.join(out,`${item.year}-${item.week}-${item.day}`);
 await fs.mkdir(target,{recursive:true});
 const p=Presentation.create({slideSize:{width:1600,height:900}}),b=new Board(p,item);
 b.slide(item.title,'Watch the model. Try the next question. Explain what changes.','Introduce the mathematical idea using the first worked example. The lesson can be placed anywhere in the teaching sequence.');
 b.text(item.objective,100,305,1080,180,36,C.blue,true,'center');
 for(let v=0;v<4;v++)render(b,exampleFor(item,v),v%2?'You do':'I do');
 const finalQuestion=b.counter+1;
 b.slide('You do','Try these questions.','These are the existing expected-level worksheet questions, in their original order. Do not advance to the answer slide until pupils have had time to finish.');
 const sorting=item.year===1&&item.week===1&&item.day===1;
 const qs=sorting?[
  {q:'Sort by colour. Write or draw the red objects in one box and the blue objects in the other.',a:'Red: triangle and square. Blue: circle and triangle.'},
  {q:'A yellow square is in the circle group. Is the sort correct? Explain.',a:'No. A square belongs in the square group when sorting by shape.'},
  {q:'Draw four objects that can be sorted into two colour groups.',a:'Answers vary. Four objects must form two clear colour groups.'},
  {q:'Write your rule in a full sentence.',a:'For example: I sorted the objects by colour.'},
  {q:'Check every object: Does every object follow the same rule?',a:'Check each object against your stated rule. Correct any that do not match.'},
 ]:item.expected.map(q=>({q:adaptable(q.q),a:adaptable(q.a)}));
 if(!Array.isArray(qs)||!qs.length)throw new Error('Missing expected questions: '+id);
 function activity(answers){
  if(sorting&&!answers){
   b.text('1.',65,207,55,65,24,C.blue,true);b.text(qs[0].q,125,207,1100,65,23,C.ink);
   b.poly([[145,325],[175,273],[205,325]],C.red);b.dot(350,278,C.blue,48);b.rect(550,278,48,48,C.red,C.ink,1);b.poly([[745,325],[775,273],[805,325]],C.blue);
   qs.slice(1).forEach((q,i)=>{b.text(`${i+2}.`,65,350+i*74,55,68,23,C.blue,true);b.text(q.q,125,350+i*74,1100,68,23,C.ink);});
   return;
  }
  const cols=item.year===6?2:1,rows=Math.ceil(qs.length/cols),h=440/rows,w=cols===2?555:1120;
  qs.forEach((q,i)=>{
   const col=Math.floor(i/rows),row=i%rows,x=65+col*625,y=211+row*h;
   b.text(`${i+1}.`,x,y,57,h-6,20,C.blue,true);
   b.text(answers?q.a:q.q,x+58,y,w-58,h-6,item.year===1?25:(answers?q.a:q.q).length>150?18:19.2,answers?C.green:C.ink,false);
  });
 }
 activity(false);
 b.slide('Answers','Check your answers. Explain any corrections.','Answers to the preceding complete activity question set, in matching order. Accept mathematically valid alternatives for open questions.');
 activity(true);
 const meta={id,year:item.year,week:item.week,day:item.day,slug:item.slug,dir:item.dir,source:item.source,file:item.file,count:b.counter,activitySlide:finalQuestion,expectedQuestions:qs,slides:b.manifest,mathChecks:b.mathChecks};
 await (await PresentationFile.exportPptx(p)).save(path.join(target,'candidate.pptx'));
 await fs.writeFile(path.join(target,'manifest.json'),JSON.stringify(meta,null,2));
 console.log(`BUILT ${++completed} ${id} ${item.slug}: ${b.counter} slides`);
}
