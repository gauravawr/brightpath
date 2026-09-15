// Native, editable maths models. Motion is added by animate_simplify_fractions.ps1.
// Run: node scripts/build_simplify_fractions.mjs <private-build-directory>
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const runtime = process.env.ARTIFACT_TOOL_PATH ?? 'C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const { Presentation, PresentationFile } = await import(pathToFileURL(runtime).href);
const out = path.resolve(process.argv[2] ?? '../.qa/simplify-fractions/build');
await fs.mkdir(out, { recursive: true });
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const C = { ink:'#172B4D', blue:'#1D4ED8', pale:'#EFF6FF', green:'#11745A', grey:'#52647A', line:'#BCD0EA', white:'#FFFFFF', amber:'#9A5800', red:'#B42332' };
const animation = [];
let slide, number=0, serial=0, events;
function shape(name,x,y,w,h,fill='none',stroke='none',sw=0,geometry='rect') {
  return slide.shapes.add({name,geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:sw}});
}
function txt(value,x,y,w,h,size=30,color=C.ink,bold=false,name,align='left') {
  const s=shape(name??`s${number}-text-${++serial}`,x,y,w,h);
  s.text=value; s.text.style={typeface:'Arial',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'none'};
  return s;
}
function line(name,x,y,w,color=C.ink,weight=3){return shape(name,x,y,w,weight,color);}
function add(title,prompt,notes){
  slide=deck.slides.add(); number++; serial=0; events=[];animation.push({slide:number,events});
  slide.background.fill=C.white;
  txt('BRIGHTPATH  /  YEAR 6  /  SPRING · WEEK 11 · DAY 2',56,24,1100,24,16,C.blue,true);
  txt(title,56,76,1168,65,44,C.ink,true);
  txt(prompt,56,150,1168,64,26,C.grey);
  line('footer-rule',56,662,1168,C.line,1);
  txt('Simplify fractions',56,675,720,22,15,C.grey);
  txt(`${number} / 12`,1100,675,124,22,15,C.grey,false,undefined,'right');
  slide.speakerNotes.textFrame.setText(`Year 6 Spring, week 11, day 2. ${notes}\nPresent in Slide Show. Each page click advances one mathematical decision. All fraction pieces and numbers are editable. Blue shows the fraction, amber shows the common divisor, green shows the simplest form. Ask pupils to predict each result before clicking.`);
}
function event(name,type='appear',trigger=1,extra={}){events.push({name,type,trigger,...extra});}
function reveal(s,trigger=1,type='appear'){event(s.name,type,trigger);return s;}
function move(s,dx,dy,trigger=1){event(s.name,'move',trigger,{dx,dy,duration:0.85});}
function fraction(n,d,x,y,w=130,size=64,color=C.blue,prefix=`f-${number}-${serial++}`){
  const top=txt(String(n),x,y,w,80,size,color,true,`${prefix}-n`,'center');
  const bar=line(`${prefix}-bar`,x,y+83,w,color,4);
  const bot=txt(String(d),x,y+91,w,80,size,color,true,`${prefix}-d`,'center');
  return [top,bar,bot];
}
function revealAll(shapes,trigger=1){shapes.forEach((s,i)=>reveal(s,i===0?trigger:2));}
function strip(n,d,x,y,width=800,height=70,prefix='strip'){
  const cells=[];for(let i=0;i<d;i++) cells.push(shape(`${prefix}-${i}`,x+i*width/d,y,width/d,height,i<n?C.blue:C.white,C.ink,2));return cells;
}
function board(n,d,factor,rn,rd,title,prompt,notes){
  add(title,prompt,notes);
  fraction(n,d,170,290,150,78);
  txt('=',718,358,70,70,62,C.ink,false,undefined,'center');
  line('answer-bar',865,373,150,C.green,4);
  const bank=txt(String(factor),570,220,100,64,48,C.amber,true,'factor-bank','center');
  txt('common factor',690,229,240,45,24,C.amber);
  const divN=txt('÷',409,295,65,78,58,C.amber,false,'divide-n','center');
  const divD=txt('÷',409,387,65,78,58,C.amber,false,'divide-d','center');
  const facN=txt(String(factor),570,220,100,64,48,C.amber,true,'factor-n','center');
  const facD=txt(String(factor),570,220,100,64,48,C.amber,true,'factor-d','center');
  reveal(divN);reveal(facN,2);move(facN,-66,82,3);
  const top=txt(String(rn),623,289,110,82,76,C.green,true,'result-n','center');
  reveal(top);move(top,262,0,3);
  reveal(divD);reveal(facD,2);move(facD,-66,174,3);
  const bottom=txt(String(rd),623,381,110,82,76,C.green,true,'result-d','center');
  reveal(bottom);move(bottom,262,0,3);
  reveal(txt('Divide both by the same common factor.',130,507,1020,50,32,C.ink,true,'rule','center'));
  reveal(txt(`${rn} and ${rd} have no common factor greater than 1.`,130,572,1020,44,27,C.green,false,'check','center'));
}

add('Simplify fractions','Same amount. Fewer, larger equal parts.',
  'Introduce equivalent fractions with the same whole. The numerator counts shaded parts and the denominator counts all equal parts. Explain that simplifying renames the amount. Click to reveal the equivalent fraction.');
strip(6,8,170,275,800,85,'intro');
fraction(6,8,310,435,110,62);
txt('=',565,479,80,70,62,C.ink,false,undefined,'center');
revealAll(fraction(3,4,780,435,110,62,C.green));

add('Which factors belong to both?','Find numbers that divide 12 and 18 exactly.',
 'Ask for factor pairs of 12 and 18. Reveal common factors 1, 2, 3 and 6. HCF means highest common factor. Explain why 6 is useful: it simplifies in one division.');
txt('12',70,262,120,60,46,C.blue,true);txt('18',70,375,120,60,46,C.blue,true);
const xs=[255,410,565,720,875,1030];
[1,2,3,4,6,12].forEach((v,i)=>txt(String(v),xs[i],262,100,65,44,C.ink,true,`factor12-${v}`,'center'));
[1,2,3,6,9,18].forEach((v,i)=>txt(String(v),xs[i],375,100,65,44,C.ink,true,`factor18-${v}`,'center'));
for(const v of [1,2,3,6]){
  const a=[1,2,3,4,6,12].indexOf(v),b=[1,2,3,6,9,18].indexOf(v);
  reveal(line(`under12-${v}`,xs[a]+15,329,70,C.amber,5));
  reveal(line(`under18-${v}`,xs[b]+15,442,70,C.amber,5),2);
}
reveal(txt('Highest common factor = 6',160,520,960,65,40,C.green,true,'hcf','center'));

add('Pair the eighths','Watch each pair move together. How many groups are shaded?',
 'Start with 6 shaded eighths out of 8. Click four times: each pair moves to the lower row. No piece changes colour or size. The spaces separate groups, not additional parts of the whole. Count 3 shaded groups out of 4 equal groups. Reveal 6/8 = 3/4.');
txt('8 equal pieces; 6 shaded',140,220,990,42,28,C.blue);
const pieces=strip(6,8,140,280,800,70,'pair');
for(let i=0;i<4;i++){
 move(pieces[2*i],i*14,150); move(pieces[2*i+1],i*14,150,2);
 reveal(txt(String(i+1),140+i*214,506,200,44,28,C.grey,true,`group-${i}`,'center'),3);
}
reveal(txt('6 eighths = 3 quarters',140,580,990,50,38,C.green,true,'equivalent','center'));

board(6,8,2,3,4,'The same grouping, written as numbers','Two eighths make one quarter.',
 'Connect directly to the regrouped pieces. Move divisor 2 beside numerator 6, calculate 3, then watch 3 move into the answer numerator. Repeat for denominator 8. Discuss why both numbers must be divided by 2. The result 3/4 is in simplest form.');

add('Find the highest common factor','Our example: simplify 42/56.',
 'Generate factors systematically in pairs. Reveal matching factors 1, 2, 7, 14 in both rows. Reveal that 14 is the highest common factor. Ask pupils to calculate 42 divided by 14 and 56 divided by 14 before advancing.');
txt('42',60,264,95,65,44,C.blue,true);txt('56',60,384,95,65,44,C.blue,true);
const a42=[1,2,3,6,7,14,21,42],a56=[1,2,4,7,8,14,28,56];
for(const [vals,y,p] of [[a42,264,'a'],[a56,384,'b']]) vals.forEach((v,i)=>txt(String(v),190+i*127,y,102,66,39,C.ink,true,`${p}${v}`,'center'));
for(const v of [1,2,7,14]){
 reveal(line(`a-line-${v}`,200+a42.indexOf(v)*127,334,82,C.amber,5));
 reveal(line(`b-line-${v}`,200+a56.indexOf(v)*127,454,82,C.amber,5),2);
}
reveal(txt('Highest common factor = 14',140,537,1000,65,40,C.green,true,'hcf14','center'));

board(42,56,14,3,4,'Simplify 42/56','Use the highest common factor: 14.',
 'Click 1: move 14 beside 42. Click 2: reveal quotient 3 and move it into the numerator of the answer. Click 3: move a second 14 beside 56. Click 4: reveal quotient 4 and move it into the denominator. Emphasise that the same division acts on both. Final clicks reveal the rule and the simplest-form check.');

add('A different route to the same fraction','We can divide in stages, using a common factor each time.',
 'Ask whether dividing by 2 first is valid. Reveal 21/28. It is equivalent but not yet simplest because 7 divides both. Reveal division by 7 and 3/4. Compare with division by 14: 2 times 7 equals 14.');
fraction(42,56,100,325,130,66);
reveal(txt('÷ 2',285,252,200,65,40,C.amber,true,'stage1','center'));
reveal(txt('=',335,368,70,65,54,C.ink,false,'eq1','center'),2);
revealAll(fraction(21,28,490,325,130,66),1);
reveal(txt('÷ 7',680,252,200,65,40,C.amber,true,'stage2','center'));
reveal(txt('=',735,368,70,65,54,C.ink,false,'eq2','center'),2);
revealAll(fraction(3,4,930,325,130,66,C.green));
reveal(txt('÷ 2, then ÷ 7 has the same effect as ÷ 14.',100,557,1080,60,32,C.green,true,'compare','center'));

board(18,24,6,3,4,'Your turn with the teacher','Simplify 18/24. Predict each number before it moves.',
 'Give pupils thinking time before using the sequence. Ask for common factors and HCF 6. Use the four calculation clicks only after predictions. Accept 9/12 then 3/4 as an alternative route. Ask why 9/12 is not simplest.');

add('Both numbers must change','Miro divides only the numerator by 2. Is the amount still the same?',
 'The upper strip shows 6/8. Reveal the lower strip showing 3/8: the shaded amount has halved. This is not equivalent. Reveal the correction 6/8 = 3/4, dividing both by 2. Do not teach simplification as merely making the numerator smaller.');
strip(6,8,110,265,720,64,'correct-strip');txt('6/8',910,266,190,70,48,C.blue,true);
const wrong=strip(3,8,110,393,720,64,'wrong-strip');revealAll(wrong);
reveal(txt('3/8',910,390,190,70,48,C.red,true,'wrong-fraction'),2);
reveal(txt('The shaded amount has changed.',110,481,1080,45,28,C.red,true,'wrong-caption'));
reveal(txt('6 ÷ 2 = 3     and     8 ÷ 2 = 4',110,546,1080,48,34,C.green,true,'correction','center'));
reveal(txt('6/8 = 3/4',110,600,1080,42,30,C.green,true,'correct-answer','center'),2);

add('Simplify each fraction','Write the common factor you used. Check that you cannot simplify further.',
 'Mini-whiteboard practice. Allow working time before any answer reveal. Click to check one question at a time. Answers: 8/12=2/3 using 4; 15/25=3/5 using 5; 24/36=2/3 using 12; 35/49=5/7 using 7. Accept valid multi-step routes.');
[[8,12,2,3,4],[15,25,3,5,5],[24,36,2,3,12],[35,49,5,7,7]].forEach(([n,d,rn,rd,f],i)=>{
 const x=80+i*300;txt(String.fromCharCode(65+i),x,236,180,42,25,C.grey,true,undefined,'center');fraction(n,d,x+35,300,120,64);
 reveal(txt(`${rn}/${rd}`,x,520,190,56,42,C.green,true,`practice-${i}`,'center'));
 reveal(txt(`both ÷ ${f}`,x,585,190,40,24,C.amber,false,`factor-${i}`,'center'),2);
});

add('Equivalent, but is it simplest?','Alex says: “16/24 = 8/12, so I have finished.”',
 'Ask pupils to explain why 8/12 is equivalent but not simplest. Common factor 4 still divides 8 and 12. Reveal division by 4, then move 2 and 3 into the answer. Confirm HCF(2,3)=1.');
fraction(16,24,100,300,130,66);txt('=',282,345,75,65,54);fraction(8,12,390,300,130,66);
reveal(txt('both ÷ 4',600,233,230,60,38,C.amber,true,'divide4','center'));
reveal(txt('=',655,345,70,65,54,C.ink,false,'reason-eq'),2);
line('reason-bar',940,383,130,C.green,4);
const r2=txt('2',740,300,120,80,66,C.green,true,'reason-n','center');reveal(r2);move(r2,205,0,3);
const r3=txt('3',740,391,120,80,66,C.green,true,'reason-d','center');reveal(r3);move(r3,205,0,3);
reveal(txt('2 and 3 share only the factor 1.',120,546,1040,65,34,C.green,true,'simplest','center'));

add('Exit check','Simplify 30/42. Explain why your answer is in its simplest form.',
 'Pupils work independently and write the divisor used. Reveal common factor 6, then numerator 5 and denominator 7. Ask for the simplest-form explanation: 5 and 7 have no common factor greater than 1. If pupils divide only one number, revisit slide 9. If pupils stop at 15/21, revisit slide 11.');
fraction(30,42,250,300,150,76);txt('=',570,352,90,80,64);
reveal(txt('both ÷ 6',420,228,440,55,38,C.amber,true,'exit-factor','center'));
revealAll(fraction(5,7,800,300,150,76,C.green));
reveal(txt('5 and 7 have no common factor greater than 1.',100,545,1080,65,31,C.green,true,'exit-check','center'));

await (await PresentationFile.exportPptx(deck)).save(path.join(out,'candidate.pptx'));
await fs.writeFile(path.join(out,'animation.json'),JSON.stringify(animation,null,2));
console.log(`Built ${number} slides in ${out}; ${animation.reduce((n,s)=>n+s.events.length,0)} effects.`);
