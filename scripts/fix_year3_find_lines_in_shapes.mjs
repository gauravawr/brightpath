import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Board,C} from './maths_visual_renderer.mjs';

const out='.qa/year3-maths/build/3-24-4';
const {Presentation,PresentationFile}=await import(pathToFileURL('C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs').href);
const item={year:3,week:24,day:4,slug:'find-lines-in-shapes',title:'Find lines in shapes',objective:'To identify horizontal and vertical lines and pairs of parallel and perpendicular lines.'};
const p=Presentation.create({slideSize:{width:1600,height:900}}),b=new Board(p,item);
const purple='#7C3AED',pink='#DB2777';
const expected=[
 {q:'Rectangle: identify the horizontal, vertical, parallel and perpendicular lines.',a:'Top and bottom are horizontal and parallel. Left and right are vertical and parallel. Every corner joins perpendicular lines.'},
 {q:'Right-angled triangle: identify one perpendicular pair. Are any sides parallel?',a:'The horizontal base and vertical side are perpendicular. No sides are parallel.'},
 {q:'Trapezium: find its parallel lines. Does it have a perpendicular pair?',a:'The top and bottom sides are parallel. The left side is perpendicular to both.'},
 {q:'Parallelogram: how many pairs of parallel sides? Any perpendicular sides?',a:'It has two pairs of parallel sides and no perpendicular sides.'},
 {q:'Rotated square: what stays true when the square turns?',a:'It still has two pairs of parallel sides and four perpendicular corners. Its properties do not change when it turns.'}
];
const notes='Pause before each reveal. Ask pupils to point to the lines and explain using horizontal, vertical, parallel and perpendicular.';
function rightAngle(x,y,size=30,color=C.amber){return [b.lineTo(x,y,x+size,y,color,4),b.lineTo(x+size,y,x+size,y-size,color,4),b.lineTo(x+size,y-size,x,y-size,color,4)];}
function turnedRightAngle(cx,cy,r,color=C.amber){const y=cy-r;return [b.lineTo(cx-25,y+25,cx,y+50,color,4),b.lineTo(cx,y+50,cx+25,y+25,color,4)];}
function legend(){b.lineTo(880,248,1040,248,C.blue,6);b.lineTo(880,290,1040,290,C.green,6);b.text('matching parallel pair',1050,225,170,45,18,C.grey);b.text('another parallel pair',1050,268,170,45,18,C.grey);b.rect(900,326,28,28,'none',C.amber,4);b.text('right angle = perpendicular',950,315,270,50,18,C.grey);}
function rectShape(x=320,y=290,w=480,h=250){b.rect(x,y,w,h,C.white,C.ink,4);return {x,y,w,h};}
function triangle(x=350,y=270,w=470,h=280){b.poly([[x,y+h],[x,y],[x+w,y+h]],C.white,C.ink);return {x,y,w,h};}
function trapezium(x=330,y=285,w=500,h=250){b.poly([[x,y+h],[x,y],[x+w-100,y],[x+w,y+h]],C.white,C.ink);return {x,y,w,h};}
function parallelogram(x=340,y=290,w=480,h=240){b.poly([[x,y+h],[x+90,y],[x+w,y],[x+w-90,y+h]],C.white,C.ink);return {x,y,w,h};}
function diamond(cx=575,cy=410,r=190){b.poly([[cx,cy-r],[cx+r,cy],[cx,cy+r],[cx-r,cy]],C.white,C.ink);return {cx,cy,r};}
function revealText(text,y=585){return b.show(b.text(text,90,y,1100,70,text.length>120?21:27,C.green,true,'center'));}
function base(role,q){b.slide(role,q,notes);legend();}
function highlightRectangle(role='I do',question='Which lines are parallel? Which lines are perpendicular?'){
 base(role,question);const s=rectShape();
 b.show(b.lineTo(s.x,s.y,s.x+s.w,s.y,C.blue,7));b.show(b.lineTo(s.x,s.y+s.h,s.x+s.w,s.y+s.h,C.blue,7),2);
 b.show(b.text('The horizontal sides never meet: they are parallel.',180,560,800,46,24,C.blue,true,'center'));
 b.show(b.lineTo(s.x,s.y,s.x,s.y+s.h,C.green,7));b.show(b.lineTo(s.x+s.w,s.y,s.x+s.w,s.y+s.h,C.green,7),2);
 b.group(rightAngle(s.x+6,s.y+s.h-6),1);revealText('Adjacent sides meet at a right angle, so they are perpendicular.',620);
}
function highlightTriangle(role='We do',question='Find one horizontal line, one vertical line and a perpendicular pair.'){
 base(role,question);const s=triangle();
 b.show(b.lineTo(s.x,s.y+s.h,s.x+s.w,s.y+s.h,C.blue,7));b.show(b.text('horizontal',485,545,210,42,22,C.blue,true,'center'),2);
 b.show(b.lineTo(s.x,s.y,s.x,s.y+s.h,C.green,7));b.show(b.text('vertical',185,375,150,42,22,C.green,true,'center'),2);
 b.group(rightAngle(s.x+6,s.y+s.h-6),1);revealText('These two sides meet at a right angle: perpendicular. No sides are parallel.');
}
function highlightTrapezium(role='You do',question='Try first: find the parallel pair and one perpendicular pair.'){
 base(role,question);const s=trapezium();
 b.show(b.lineTo(s.x,s.y,s.x+s.w-100,s.y,C.blue,7));b.show(b.lineTo(s.x,s.y+s.h,s.x+s.w,s.y+s.h,C.blue,7),2);
 b.show(b.text('parallel',470,390,250,54,28,C.blue,true,'center'));
 b.show(b.lineTo(s.x,s.y,s.x,s.y+s.h,C.green,7));b.group(rightAngle(s.x+6,s.y+s.h-6),2);
 revealText('Top and bottom are parallel. The left side is perpendicular to both.');
}
function highlightParallelogram(role='I do',question='How many pairs of parallel lines can you find?'){
 base(role,question);const s=parallelogram();
 b.show(b.lineTo(s.x+90,s.y,s.x+s.w,s.y,C.blue,7));b.show(b.lineTo(s.x,s.y+s.h,s.x+s.w-90,s.y+s.h,C.blue,7),2);
 b.show(b.lineTo(s.x+90,s.y,s.x,s.y+s.h,C.green,7));b.show(b.lineTo(s.x+s.w,s.y,s.x+s.w-90,s.y+s.h,C.green,7),2);
 revealText('Two pairs are parallel. There are no right angles, so no sides are perpendicular.');
}
function highlightDiamond(role='You do',question='This square has turned. What properties stay the same?'){
 base(role,question);const s=diamond();
 b.show(b.lineTo(s.cx,s.cy-s.r,s.cx+s.r,s.cy,C.blue,7));b.show(b.lineTo(s.cx,s.cy+s.r,s.cx-s.r,s.cy,C.blue,7),2);
 b.show(b.lineTo(s.cx+s.r,s.cy,s.cx,s.cy+s.r,C.green,7));b.show(b.lineTo(s.cx-s.r,s.cy,s.cx,s.cy-s.r,C.green,7),2);
 b.group(turnedRightAngle(s.cx,s.cy,s.r),1);
 revealText('Turning changes how it looks, not its properties: 2 parallel pairs and 4 perpendicular corners.');
}
function misconception(){
 b.slide('Tess is thinking','“A square stops having horizontal and vertical sides when it turns, so it is not a square.”',notes);
 b.text('upright',240,240,220,45,24,C.grey,true,'center');b.rect(250,300,210,210,C.white,C.ink,4);
 b.text('turned',710,240,220,45,24,C.grey,true,'center');b.poly([[820,285],[940,405],[820,525],[700,405]],C.white,C.ink);
 const arrow=b.text('↻',540,350,160,100,64,C.blue,true,'center');b.show(arrow);
 b.show(b.text('The line directions change, but the side lengths, parallel pairs and right angles stay the same.',145,570,990,80,27,C.green,true,'center'));
}
function miniShape(kind,x,y,scale=1,withHighlights=false){
 const W=170*scale,H=105*scale;
 if(kind==='rectangle'){b.rect(x,y,W,H,C.white,C.ink,2);if(withHighlights){b.lineTo(x,y,x+W,y,C.blue,4);b.lineTo(x,y+H,x+W,y+H,C.blue,4);}}
 if(kind==='triangle'){b.poly([[x,y+H],[x,y],[x+W,y+H]],C.white,C.ink);if(withHighlights){b.lineTo(x,y,x,y+H,C.green,4);b.lineTo(x,y+H,x+W,y+H,C.blue,4);}}
 if(kind==='trapezium'){b.poly([[x,y+H],[x,y],[x+W-35*scale,y],[x+W,y+H]],C.white,C.ink);if(withHighlights){b.lineTo(x,y,x+W-35*scale,y,C.blue,4);b.lineTo(x,y+H,x+W,y+H,C.blue,4);}}
 if(kind==='parallelogram'){b.poly([[x,y+H],[x+35*scale,y],[x+W,y],[x+W-35*scale,y+H]],C.white,C.ink);if(withHighlights){b.lineTo(x+35*scale,y,x+W,y,C.blue,4);b.lineTo(x,y+H,x+W-35*scale,y+H,C.blue,4);}}
 if(kind==='diamond'){b.poly([[x+W/2,y],[x+W,y+H/2],[x+W/2,y+H],[x,y+H/2]],C.white,C.ink);if(withHighlights){b.lineTo(x+W/2,y,x+W,y+H/2,C.blue,4);b.lineTo(x+W/2,y+H,x,y+H/2,C.blue,4);}}
}

b.slide(item.title,'Learning intention and date');b.text(item.objective,110,270,1060,135,34,C.blue,true,'center');b.text('Key words: horizontal · vertical · parallel · perpendicular · right angle',125,430,1030,65,27,C.green,true,'center');b.text('Date: ____ / ____ / ______',710,530,460,55,25,C.grey);
highlightRectangle();highlightTriangle();highlightTrapezium();highlightParallelogram();highlightDiamond();misconception();
highlightRectangle('You do',expected[0].q);highlightTriangle('You do',expected[1].q);highlightTrapezium('You do',expected[2].q);highlightParallelogram('You do',expected[3].q);highlightDiamond('You do',expected[4].q);
b.slide('You do','Try all five. Point to each line before naming its relationship.',notes);
['rectangle','triangle','trapezium','parallelogram','diamond'].forEach((k,i)=>{const row=i<3?0:1,col=i<3?i:i-2;const x=(row?280:90)+col*390,y=230+row*220;miniShape(k,x,y,.9);b.text(`${i+1}. ${['rectangle','right-angled triangle','trapezium','parallelogram','rotated square'][i]}`,x-5,y+105,220,50,19,C.ink,true,'center');});
b.text('For each shape: find parallel pairs, perpendicular pairs, and any horizontal or vertical lines.',120,590,1040,55,23,C.blue,true,'center');
b.slide('Answers','Check each shape and explain how you know.',notes);
['rectangle','triangle','trapezium','parallelogram','diamond'].forEach((k,i)=>{const y=205+i*88;miniShape(k,75,y,0.45,true);b.show(b.text(`${i+1}. ${expected[i].a}`,190,y-2,1015,70,expected[i].a.length>115?18:20,C.green));});

const manifest={id:'3:24.4',year:3,week:24,day:4,slug:item.slug,count:b.counter,activitySlide:13,answerSlide:14,expectedQuestions:expected,slides:b.manifest,format:'year3-visual-v2',source:'lessons/year-3-maths/week-24/week24-lessons.json',file:'interactive-teaching-slides.pptx'};
await fs.mkdir(out,{recursive:true});await (await PresentationFile.exportPptx(p)).save(path.join(out,'candidate.pptx'));await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
const styles=['rectangle','rightTriangle','trapezium','parallelogram','rotatedSquare'];
const enriched=expected.map((v,i)=>({...v,answer:v.a,model:{type:'lines',style:styles[i]},kind:'shape',mode:'linesShape',steps:['Name any horizontal and vertical lines.','Trace lines that stay the same distance apart.','Mark every right angle where perpendicular lines meet.','Explain using the shape, not its orientation.']}));
for(const file of ['.qa/year3-maths/lessons.json','lessons/year-3-maths/week-24/week24-lessons.json']){
 const data=JSON.parse(await fs.readFile(file,'utf8')),lesson=data.find(v=>v.week===24&&v.day===4);
 Object.assign(lesson,{objective:item.objective,vocabulary:['horizontal','vertical','parallel','perpendicular','right angle'],warmup:'Sort line cards into horizontal, vertical, parallel and perpendicular examples.',teacherModel:enriched[0].steps,guided:enriched[1].q,independent:'Pause on every You do slide. Pupils identify the lines before each colour-coded reveal.',plenary:'Explain which properties stay the same when a shape is turned.',misconception:'A square stops being a square when it turns because its sides are no longer horizontal and vertical.',check:'Turning a shape changes its orientation, but its parallel and perpendicular relationships stay the same.',activity:{title:'Shape line sorting activity',file:'practical-activity.pdf',description:'Two-page activity: a full-page teacher display followed by one A4 page with four trim-ready pupil cards. Prompts use stars instead of question numbers.'},preteach:{focus:'Recognise horizontal and vertical lines and a right angle.',steps:enriched[0].steps.slice(0,3),questions:enriched.slice(0,3)},lower:enriched,expected:enriched,higher:enriched.map(v=>({...v,q:v.q+' Prove your answer using marks on the diagram.',a:v.a+' Accept an accurate marked diagram and explanation.',answer:v.a+' Accept an accurate marked diagram and explanation.'})),examples:enriched});
 await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
}
console.log(`BUILT 3:24.4 ${b.counter} slides`);
