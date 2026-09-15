import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {Board,C} from './maths_visual_renderer.mjs';import {renderYearOne} from './year1_complete_renderer.mjs';
const root=path.resolve(process.argv[2]??'../.qa/year1-complete'),only=process.argv.slice(3);
const {Presentation,PresentationFile}=await import(pathToFileURL('C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs').href);
for(const item of JSON.parse(await fs.readFile(path.join(root,'lessons.json'),'utf8'))){const id=`1:${item.week}.${item.day}`;if(only.length&&!only.includes(id))continue;const dir=path.join(root,'build',`1-${item.week}-${item.day}`);await fs.mkdir(dir,{recursive:true});const p=Presentation.create({slideSize:{width:1600,height:900}}),b=new Board(p,item);
 b.slide(item.title,'Watch. Join in. Try it yourself.',item.objective);b.text(item.objective,100,300,1080,150,37,C.blue,true,'center');
 for(const [i,role] of ['I do','We do','You do','I do','You do'].entries())renderYearOne(b,item.examples[i],role);
 b.slide('You do','Try these questions.', 'Expected-level worksheet questions. Pause for independent practice before showing the answers.');const activitySlide=b.counter;
 item.expected.forEach((q,i)=>{b.text(i+1+'.',65,215+i*86,60,76,25,C.blue,true);b.text(q.q,135,215+i*86,1080,76,q.q.length>125?23:26,C.ink);});
 b.slide('Answers','Check and explain.', 'Answers correspond in order to the preceding activity questions.');item.expected.forEach((q,i)=>{b.text(i+1+'.',65,215+i*86,60,76,25,C.blue,true);b.text(q.a,135,215+i*86,1080,76,q.a.length>125?22:25,C.green);});
 const m={id,year:1,week:item.week,day:item.day,slug:item.slug,dir:`public/lessons/year-1-maths/week-${item.week}/${item.slug}`,source:`public/lessons/year-1-maths/week-${item.week}/week${item.week}-lessons.json`,file:'interactive-teaching-slides.pptx',count:b.counter,activitySlide,expectedQuestions:item.expected,slides:b.manifest};
 await (await PresentationFile.exportPptx(p)).save(path.join(dir,'candidate.pptx'));await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(m,null,2));console.log('BUILT '+id+' '+b.counter+' slides');}
