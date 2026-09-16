import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Board,C} from './maths_visual_renderer.mjs';
import {renderYearOne} from './year1_complete_renderer.mjs';

const scriptDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.argv[2]??'../.qa/year1-complete'),only=process.argv.slice(3);
const {Presentation,PresentationFile}=await import(pathToFileURL('C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs').href);
const pip=await fs.readFile(path.join(scriptDir,'assets','pip.png'));

const wordNumbers={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
const numbersIn=text=>{
 const found=[...text.toLowerCase().matchAll(/\b(?:10|[0-9]|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b/g)].map(m=>wordNumbers[m[0]]??Number(m[0]));
 return [...new Set(found.filter(Number.isFinite))];
};
function miniShape(b,name,x,y,size,color){
 if(name==='circle')return b.rect(x,y,size,size,color,C.ink,1,'ellipse');
 if(name==='triangle')return b.poly([[x+size/2,y],[x+size,y+size],[x,y+size]],color);
 if(name==='star'){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?size*.22:size*.48;pts.push([x+size/2+Math.cos(a)*r,y+size/2+Math.sin(a)*r]);}return b.poly(pts,color);}
 return b.rect(x,y,size,size,color,C.ink,1,name==='circle'?'ellipse':undefined);
}
function miniDots(b,n,x,y,w,h,color=C.blue){
 const count=Math.max(0,Math.min(10,Number(n)||0)),cols=5,size=Math.min(24,(w-18)/cols,(h-12)/2);
 for(let i=0;i<count;i++)b.dot(x+8+(i%cols)*(w-16)/cols,y+7+Math.floor(i/cols)*(h-12)/2,color,size);
}
function miniCards(b,values,x,y,w,h,answerMode=false){
 const vals=values.slice(0,6),gap=3,cw=Math.min(48,(w-gap*(vals.length-1))/Math.max(1,vals.length));
 vals.forEach((n,i)=>{const xx=x+i*(cw+gap),digits=String(n).replace(/[^0-9]/g,'').length,font=digits>=3?8:digits>=2?11:14;b.rect(xx,y,cw,h,answerMode?'#DCFCE7':'#EFF6FF',answerMode?C.green:C.blue,1,'roundRect');b.text(String(n),xx,y+3,cw,h-6,font,answerMode?C.green:C.blue,true,'center');});
}
function miniModel(b,item,q,index,x,y,w,h,answerMode=false){
 const m=q.model??{},kind=m.kind??'',nums=numbersIn((answerMode?q.a:q.q)+' '+q.q),blue=C.blue,green=C.green;
 b.rect(x,y,w,h,'#FFFDF6',C.line,1,'roundRect');
 if(item.slug==='sort-objects-into-groups'){
  const objects=[['triangle',C.red],['circle',blue],['square',C.red],['star',blue]];
  if(index===2){miniShape(b,'square',x+20,y+24,42,'#FACC15');b.rect(x+88,y+15,56,56,'none',blue,2,'ellipse');b.text(answerMode?'✕':'?',x+150,y+17,42,42,26,answerMode?C.red:C.blue,true,'center');return;}
  if(answerMode&&(index===0||index===4)){
   b.rect(x+8,y+8,w/2-12,h-16,'none',C.red,1,'roundRect');b.rect(x+w/2+4,y+8,w/2-12,h-16,'none',blue,1,'roundRect');
   b.text('red',x+9,y+9,w/2-14,18,10,C.red,true,'center');b.text('blue',x+w/2+5,y+9,w/2-14,18,10,blue,true,'center');
   const size=Math.min(28,(w/2-30)/2),gap=8,left=x+14,right=x+w/2+10;
   [[objects[0],left],[objects[2],left+size+gap],[objects[1],right],[objects[3],right+size+gap]].forEach(([[s,c],xx])=>miniShape(b,s,xx,y+34,size,c));return;
  }
  objects.forEach(([s,c],i)=>miniShape(b,s,x+12+i*(w-48)/4,y+24,36,c));return;
 }
 if(kind==='shape'){
  if(m.sort&&Array.isArray(m.names)){m.names.slice(0,3).forEach((n,i)=>miniShape(b,n,x+12+i*(w-42)/3,y+22,38,['#60A5FA','#34D399','#A78BFA'][i]));return;}
  const name=m.name??'circle';if(m.solid){const fill=name==='sphere'?'#93C5FD':'#BFDBFE';b.rect(x+w/2-35,y+14,70,70,fill,blue,2,name==='sphere'?'ellipse':undefined);b.text(name,x+5,y+h-28,w-10,24,14,C.ink,true,'center');}else miniShape(b,name,x+w/2-34,y+14,68,blue);return;
 }
 if(kind==='pattern'){
  const unit=m.unit??['circle','triangle'],names=[...unit,...unit,answerMode?unit[0]:'?'];names.forEach((n,i)=>n==='?'?b.text('?',x+8+i*38,y+26,32,34,22,blue,true,'center'):miniShape(b,n,x+8+i*38,y+25,28,i%2?green:blue));return;
 }
 if(['sequence','order'].includes(kind)){const vals=m.values??nums;miniCards(b,vals.map((v,i)=>kind==='sequence'&&i===m.missing&&!answerMode?'?':v),x+8,y+24,w-16,48,answerMode);return;}
 if(kind==='line'||kind==='one'||/track|before|after/.test(q.q.toLowerCase())){
  const max=m.max??10,at=m.n??nums[0]??0;b.line(x+15,y+49,w-30);for(let i=0;i<=10;i++){const xx=x+15+i*(w-30)/10;b.lineTo(xx,y+43,xx,y+56);if(i%2===0)b.text(i,xx-12,y+57,24,28,9,C.grey,false,'center');}const shown=answerMode?(kind==='one'?(m.op===-1?at-1:at+1):(nums.at(-1)??at)):at;b.dot(x+15+Math.max(0,Math.min(max,shown))/max*(w-30)-8,y+31,answerMode?green:blue,16);return;
 }
 if(kind==='compare'){
  miniDots(b,m.a,x+6,y+5,w-12,h/2-7,blue);miniDots(b,m.b,x+6,y+h/2,w-12,h/2-7,green);if(answerMode)b.text(m.a===m.b?'=':m.a>m.b?'>':'<',x+w-35,y+h/2-16,28,32,22,C.ink,true,'center');return;
 }
 if(['add','subtract','word','error','missing','compareCalc','family'].includes(kind)){
  const a=m.a??nums[0]??0,bn=m.b??nums[1]??0,total=m.total??(m.op==='−'?a-bn:a+bn);miniDots(b,a,x+5,y+5,w*.42,h-10,blue);b.text(m.op??'+',x+w*.43,y+h/2-18,w*.12,32,22,C.ink,true,'center');miniDots(b,bn,x+w*.56,y+5,w*.38,h-10,green);if(answerMode)b.text('= '+total,x+w-67,y+h-30,62,25,16,C.green,true,'center');return;
 }
 if(kind==='bonds'){
  const total=m.total??nums[0]??5,part=m.part??Math.floor(total/2);miniDots(b,part,x+5,y+6,w/2-9,h-12,blue);miniDots(b,total-part,x+w/2+4,y+6,w/2-9,h-12,green);if(answerMode)b.text(String(total),x+w/2-18,y+h/2-15,36,30,12,C.ink,true,'center');return;
 }
 if(kind==='count'||kind==='match'||kind==='tens'){
  const n=m.n??nums[0]??0;for(let r=0;r<2;r++)for(let c=0;c<5;c++)b.rect(x+8+c*(w-16)/5,y+7+r*(h-14)/2,(w-20)/5,(h-18)/2,C.white,C.line,1);miniDots(b,n,x+8,y+7,w-16,h-14,answerMode?green:blue);if(answerMode)b.text(String(n),x+w-38,y+4,34,28,10,C.green,true,'center');return;
 }
 if(nums.length){miniCards(b,nums,x+8,y+8,w-16,36,answerMode);miniDots(b,Math.min(10,nums[0]),x+8,y+48,w-16,h-52,answerMode?green:blue);return;}
 miniShape(b,'circle',x+18,y+25,36,blue);miniShape(b,'triangle',x+72,y+25,36,green);miniShape(b,'square',x+126,y+25,36,'#A78BFA');
}

for(const item of JSON.parse(await fs.readFile(path.join(root,'lessons.json'),'utf8'))){
 const id=`1:${item.week}.${item.day}`;if(only.length&&!only.includes(id))continue;
 const dir=path.join(root,'build',`1-${item.week}-${item.day}`);await fs.mkdir(dir,{recursive:true});
 const p=Presentation.create({slideSize:{width:1600,height:900}}),b=new Board(p,item);
 const sheet=(title,notes)=>{b.s=p.slides.add();b.s.background.fill='#FFFDF6';b.id=0;b.ev=[];b.counter++;b.manifest.push({slide:b.counter,role:title,events:b.ev});b.text(title,65,30,1150,68,38,C.blue,true,'center');b.s.speakerNotes.textFrame.setText(notes);};
 const card=(x,y,w=535,h=155,fill=C.white)=>b.rect(x,y,w,h,fill,C.line,2,'roundRect');
 const image=(blob,alt,left,top,width,height)=>b.s.images.add({blob,contentType:'image/png',alt,fit:'contain',position:{left,top,width,height}});

 b.slide(item.title,'Learning intention and date','Write today’s date. Read the single learning intention with the class before teaching.');
 b.text('L.I.',105,255,165,70,38,C.blue,true);
 const learningIntention=/^I can\b/i.test(item.objective)?item.objective:/^To\s+/i.test(item.objective)?item.objective.replace(/^To\s+/i,'I can '):`I can ${item.objective[0].toLowerCase()}${item.objective.slice(1)}`;
 b.text(learningIntention,270,240,880,120,learningIntention.length>85?27:32,C.ink,true);
 b.rect(725,475,430,105,C.white,C.blue,2,'roundRect');
 b.text('Date: ____ / ____ / ______',745,487,390,80,27,C.ink,false,'center');
 b.text('Say it. Show it. Explain it.',120,480,560,85,34,C.green,true,'center');

 for(const [i,role] of ['I do','We do','You do','I do','You do'].entries())renderYearOne(b,item.examples[i],role);

 const pipIsCorrect=(item.week+item.day)%2===0;
 b.slide(pipIsCorrect?'Is Pip correct?':'Can you help Pip?',pipIsCorrect?'Pip has a checking idea. Decide whether it works.':'Pip is unsure. What should Pip check?',pipIsCorrect?'Let pupils justify why Pip’s checking idea is mathematically sound before revealing the confirmation. Pip appears only on this slide.':'Read Pip’s concern. Let pupils explain a correction before revealing the checking rule. Pip appears only on this slide.');
 image(pip,'Pip thinking about a maths misconception',1110,245,390,500);
 b.text('Pip is thinking…',100,235,400,50,29,C.blue,true);
 const checkSentence=item.check.replace(/^[A-Z]/,c=>c.toLowerCase());
 const pipConcern=pipIsCorrect?`Pip says, “I should check that ${checkSentence}” Is Pip correct?`:item.misconception.replace(/^A child\b/i,'Pip');
 const concern=b.text(pipConcern,100,300,750,155,pipConcern.length>120?23:27,C.ink,true,'center');b.show(concern);
 b.text(pipIsCorrect?'Talk to your partner. How do you know?':'Talk to your partner. What should Pip do?',100,480,760,55,28,C.ink,true,'center');
 const reveal=pipIsCorrect?`Yes — Pip is correct. ${item.check}`:item.check;
 const check=b.text(reveal,100,555,760,70,reveal.length>100?23:27,C.green,true,'center');b.show(check);

 sheet('Talk about these together','Keep all five expected-level questions on screen. Give pupils thinking time and use each discussion line to record or collect explanations. Answers are on the final slide.');
 const questionPositions=[[55,110,585],[660,110,585],[55,290,585],[660,290,585],[170,470,960]];
 item.expected.forEach((q,i)=>{const [x,y,w]=questionPositions[i],visualW=i===4?245:175;card(x,y,w,165);miniModel(b,item,q,i,x+12,y+48,visualW,92,false);b.text(`${i+1}. ${q.q}`,x+visualW+28,y+13,w-visualW-40,105,q.q.length>120?15:q.q.length>85?17:19,C.ink,true);b.text('Discuss: ____________________',x+visualW+28,y+125,w-visualW-40,28,16,C.grey);});
 b.text('Look. Point. Count. Explain.',420,650,440,32,21,C.green,true,'center');
 const activitySlide=b.counter;

 sheet('Answers','Reveal one answer card at a time. Ask a child to explain the representation or checking step before showing the next answer.');
 const answerPositions=[[55,110,585],[660,110,585],[55,290,585],[660,290,585],[170,470,960]];
 item.expected.forEach((q,i)=>{const [x,y,w]=answerPositions[i],visualW=i===4?245:175,fill=['#F0FDF4','#FFF7ED','#EFF6FF','#F5F3FF','#FFF7ED'][i];const box=card(x,y,w,165,fill);miniModel(b,item,q,i,x+12,y+48,visualW,92,true);const n=b.text(String(i+1),x+visualW+24,y+14,38,36,23,C.blue,true,'center');const a=b.text(q.a,x+visualW+66,y+10,w-visualW-78,132,q.a.length>135?15:q.a.length>95?17:19,C.green,true,'center');[box,n,a].forEach(s=>b.show(s));});
 b.text('Look at the picture. Say the answer. Check it.',350,650,580,32,21,C.green,true,'center');

 const m={id,year:1,week:item.week,day:item.day,slug:item.slug,dir:`lessons/year-1-maths/week-${item.week}/${item.slug}`,source:`lessons/year-1-maths/week-${item.week}/week${item.week}-lessons.json`,file:'interactive-teaching-slides.pptx',count:b.counter,activitySlide,answerSlide:b.counter,format:'year1-picture-plan',pipIsCorrect,expectedQuestions:item.expected,slides:b.manifest};
 await (await PresentationFile.exportPptx(p)).save(path.join(dir,'candidate.pptx'));
 await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(m,null,2));
 console.log('BUILT '+id+' '+b.counter+' slides');
}
