import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {Board,C,render} from './maths_visual_renderer.mjs';import {dots,flat,solid,hand,spin,clock} from './year3_visual_helpers.mjs';
const root='.qa/year4-maths',only=process.argv.slice(2),colors=[C.blue,C.green,'#875BB2'];
const {Presentation,PresentationFile}=await import(pathToFileURL('C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs').href);
const tess=await fs.readFile('scripts/assets/pip.png');
function teach(b,q,role){
 const m=q.model,t=m.type;const original=b.slide.bind(b);b.slide=(r,_question,notes)=>original(r,q.q,notes);let native;
 if(t==='place')native={kind:'place',n:m.n};
 if((t==='calculation'||t==='measureCalc')&&!['mentalAdd','mentalSub','mentalTens','mentalHundreds','bridge','missingAdd','missingSub'].includes(q.mode))native={kind:'column',a:q.mode==='inverseAdd'||q.mode==='inverseSub'?m.total:m.a,b:m.b,op:q.mode==='inverseAdd'?'−':q.mode==='inverseSub'?'+':m.op};
 if(t==='multiply')native={kind:'multiply',a:m.a,b:m.b};
 if(t==='estimate')native={kind:'estimate',a:m.a,b:m.b,unit:100};
 if(t==='compensate')native={kind:'compensate',a:m.a,b:m.b,near:m.a+1};
 if(native){if(b.item.slug==='subtraction-word-problems'&&native.kind==='column')native.pauseBeforeExchange=true;const result=b.result.bind(b);b.result=(ignored,y=610)=>b.show(b.text(q.a.replace(/ Accept .*/,''),70,y,1140,55,q.a.length>105?23:29,C.green,true,'center'));render(b,native,role);b.result=result;b.slide=original;return;}
 b.slide(role,q.q,q.steps.join(' '));b.slide=original;
 if(t==='calculation'){
  if(['missingAdd','missingSub'].includes(q.mode)){
   const whole=m.op==='+'?m.total:m.a,known=m.op==='+'?m.a:m.total;b.text('whole = '+whole,370,265,540,70,40,C.blue,true,'center');b.rect(140,390,1000,100,C.pale,C.blue,2);const width=1000*known/whole;b.lineTo(140+width,390,140+width,490,C.blue,2);b.text(known,140,400,width,75,42,C.blue,true,'center');const missing=b.text('?',990,510,180,75,34,C.green,true,'center');b.hide(missing);b.show(b.text(m.b,990,510,180,75,34,C.green,true,'center'),2);
  }else{
   const lo=Math.min(m.a,m.total)-5,hi=Math.max(m.a,m.total)+5,X=v=>140+(v-lo)/(hi-lo)*1000;b.line(140,410,1000);const marker=b.dot(X(m.a)-11,375,C.blue,22);b.text(m.a,X(m.a)-65,445,130,50,30,C.blue,true,'center');
   const first=q.mode==='bridge'?Math.min(m.b,100-m.a%100):m.b,mid=m.a+(m.op==='+'?first:-first);b.move(marker,X(mid)-X(m.a),0);b.show(b.text(m.op+' '+first,250,280,300,65,36,C.green,true,'center'));b.show(b.text(mid,X(mid)-65,445,130,50,30,C.green,true,'center'),2);
   if(m.b>first){b.move(marker,X(m.total)-X(mid),0);b.show(b.text(m.op+' '+(m.b-first),730,280,300,65,36,C.green,true,'center'));b.show(b.text(m.total,X(m.total)-65,510,130,50,30,C.green,true,'center'),2);}
  }
 }else if(t==='moreLess'){
  b.text(m.values[1],450,300,350,90,54,C.blue,true,'center');
  for(const j of [0,2]){const shape=b.text(m.values[j],450,300,350,90,54,colors[j],true,'center');b.show(shape);b.move(shape,(j-1)*365,150,3);b.show(b.text((j===0?'−':'+')+m.delta,105+j*365,260,330,70,35,C.green,true,'center'),2);}
 }else if(t==='numbers'){
  const sorted=[...m.values].sort((a,z)=>a-z);m.values.forEach((n,i)=>{const label=typeof n==='number'&&!Number.isInteger(n)?Number(n.toFixed(2)):n;const s=b.text(label,100+i*360,270,330,85,50,colors[i],true,'center');b.move(s,(sorted.indexOf(n)-i)*360,185);});
 }
 else if(t==='sequence'||t==='fractionSequence'){
  m.values.forEach((n,i)=>{const s=b.text(t==='fractionSequence'?`${n}/${m.den}`:n,100+i*220,345,190,75,40,C.blue,true,'center');if(i===m.missing)b.show(s);});
 }
 else if(t==='numberline'||t==='fractionLine'){
  const lo=m.start??0,hi=m.end??m.max,step=m.step??1/m.den,N=Math.round((hi-lo)/step),X=n=>130+(n-lo)/(hi-lo)*1020;
  b.line(130,410,1020);for(let i=0;i<=N;i++){b.lineTo(130+i*1020/N,400,130+i*1020/N,420);if(i===0||i===N||N<=10){const label=t==='fractionLine'?`${i}/${m.den}`:Number((lo+i*step).toFixed(2));b.text(label,82+i*1020/N,432,96,58,19,C.blue,false,'center');}}
  const value=m.value??m.num/m.den,marker=b.dot(X(role==='You do'?value:lo)-10,376,C.green,20);if(role!=='You do')b.move(marker,X(value)-X(lo),0);b.show(b.text(t==='fractionLine'?`${m.num}/${m.den}`:value, X(value)-90,275,180,65,40,C.green,true,'center'));
 }
 else if(['groups','double','division'].includes(t)){
  const total=t==='division'?m.a:m.groups*m.size,count=t==='division'?m.b:m.groups,per=t==='division'?Math.floor(total/count):m.size;
  if(t==='division'&&q.mode==='remainderStory'){
   const cars=per+(m.remainder?1:0),columns=6,rows=Math.ceil(cars/columns),gw=1060/columns,gh=250/rows;
   // Each outlined car shows its seats. The final amber car makes the
   // remainder visible and shows why one more car is required.
   for(let g=0;g<cars;g++){
    const x=100+g%columns*gw,y=350+Math.floor(g/columns)*gh,partial=g===cars-1&&m.remainder;
    b.rect(x+5,y,gw-20,Math.min(48,gh-15),partial?'#FFF7E6':C.white,partial?C.amber:C.line,1.5,'roundRect');
    b.dot(x+30,y+Math.min(43,gh-20),C.grey,11);b.dot(x+gw-48,y+Math.min(43,gh-20),C.grey,11);
    for(let seat=0;seat<count;seat++)b.rect(x+32+seat*27,y+14,17,17,C.white,C.line,1,'ellipse');
   }
   const ds=dots(b,total,100,235,20,16,25,C.blue);
   ds.forEach((o,i)=>{const g=Math.min(Math.floor(i/count),cars-1),seat=i%count,xx=132+g%columns*gw+seat*27,yy=364+Math.floor(g/columns)*gh;b.move(o.s,xx-o.x,yy-o.y,i?2:1);});
  }else if(t==='division'&&total>120){
   b.text(`${m.a} ÷ ${count}`,300,245,680,80,46,C.blue,true,'center');
   const width=900/count;for(let g=0;g<count;g++){b.rect(190+g*width,390,width-12,120,C.white,C.line,2);const value=b.text(per,190+g*width,415,width-12,70,36,C.green,true,'center');b.show(value,g?2:1);}
   b.show(b.text(`${count} equal groups of ${per}`,300,545,680,55,29,C.green,true,'center'),3);
  }else{
   const columns=Math.min(count,6),rows=Math.ceil(count/columns),gw=1060/columns,gh=160/rows;
   for(let g=0;g<count;g++)b.rect(100+g%columns*gw,400+Math.floor(g/columns)*gh,gw-10,gh-8,C.white,C.line,1);
   // Keep the group outlines behind the counters. PowerPoint preserves creation
   // order as z-order, so creating the white boxes after the counters hid them.
   const ds=dots(b,total,100,235,20,16,25,C.blue);
   ds.forEach((o,i)=>{const g=i%count,k=Math.floor(i/count),remainder=t==='division'&&i>=per*count;const xx=remainder?1090:115+g%columns*gw+k%Math.max(1,Math.floor((gw-25)/21))*21;const yy=remainder?540+(i-per*count)*22:412+Math.floor(g/columns)*gh+Math.floor(k/Math.max(1,Math.floor((gw-25)/21)))*22;b.move(o.s,xx-o.x,yy-o.y,i%count?2:1);});
  }
  if(t==='double')b.show(b.text(`Double ${m.groups*4}: ${m.groups*4} + ${m.groups*4}`,160,560,960,45,28,C.green,true,'center'));
 }
 else if(['fraction','equivalent','fractionCalc','fractionOf','fractionCompare'].includes(t)){
  const strip=(num,den,y,fill=true)=>{for(let j=0;j<den;j++){b.rect(140+j*1000/den,y,1000/den,62,C.white,'#875BB2',2);if(j<num&&fill)b.show(b.rect(142+j*1000/den,y+2,1000/den-4,58,'#B79BD6'),j?2:1);}};
  if(t==='fractionCompare'){m.nums.forEach((n,i)=>{strip(n,m.dens[i],250+i*95);b.text(`${n}/${m.dens[i]}`,60,250+i*95,70,60,27,C.blue,true,'center');});}
  else if(t==='fractionOf'){
   strip(m.num,m.den,390);b.text(m.reverse?'one part = '+m.total/m.den:'whole = '+m.total,350,265,600,65,38,C.blue,true,'center');for(let j=0;j<m.den;j++)b.show(b.text(m.total/m.den,140+j*1000/m.den,400,1000/m.den,45,30,j<m.num?C.white:C.blue,true,'center'));
  }else {strip(m.num,m.den,285);if(t==='equivalent'){strip(m.num*m.factor,m.den*m.factor,430);b.show(b.text('Each part splits into '+m.factor,250,365,780,45,29,C.green,true,'center'));}if(t==='fractionCalc'){strip(m.value,m.den,445);b.show(b.text(`${m.num}/${m.den} ${m.op} ${m.other}/${m.den}`,300,365,680,50,32,C.blue,true,'center'));}}
 }
 else if(t==='rectangle'){
  b.rect(345,290,470,240,C.pale,C.blue,2);b.text(m.a+' cm',470,222,240,60,37,C.blue,true,'center');b.text(m.missing?'? cm':m.b+' cm',840,370,250,60,37,C.blue,true,'center');
  const marker=b.dot(333,278,C.green,24);b.move(marker,470,0);b.move(marker,0,240);b.move(marker,-470,0);b.move(marker,0,-240);b.show(b.text(`${m.a} + ${m.b} + ${m.a} + ${m.b} = ${m.total}`,300,555,700,48,29,C.green,true,'center'));
 }
 else if(t==='money'||t==='twoStep'||t==='convert'||t==='timeCompare'){
  let lines=[];
  if(t==='money')lines=m.op==='change'?[`${m.a}p + ${m.b}p = ${m.a+m.b}p`,`${m.pay}p − ${m.a+m.b}p = ${m.total}p`]:q.mode==='moneyRead'?[`${m.a}p = ${Math.floor(m.a/100)} pounds and ${m.a%100} pence`]:[`${m.a}p ${m.op} ${m.b}p = ${m.total}p`];
  if(t==='twoStep')lines=[`${m.a} + ${m.b} = ${m.a+m.b}`,`${m.a+m.b} − ${m.c} = ${m.total}`];
  if(t==='convert')lines=[`1 ${m.big} = ${m.factor} ${m.unit}`,`${m.a} × ${m.factor} = ${m.a*m.factor}`,`${m.a*m.factor} + ${m.b} = ${m.total} ${m.unit}`];
  if(t==='timeCompare')lines=[`${m.a} × 60 = ${m.a*60} seconds`,`${m.b} − ${m.a*60} = ${m.b-m.a*60} seconds`];
  lines.forEach((v,i)=>{const s=b.text(v,130,230+i*115,1020,75,35,colors[i%3],true,'center');b.show(s);b.move(s,0,30,3);});
 }
 else if(t==='clock'){
  for(let k=0;k<60;k++){const a=(k*6-90)*Math.PI/180;b.lineTo(460+160*Math.cos(a),415+160*Math.sin(a),460+168*Math.cos(a),415+168*Math.sin(a),C.blue,1);}
  if(m.roman){const cx=460,cy=415,r=170;b.dot(cx-r,cy-r,C.white,r*2);['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'].forEach((n,i)=>{const a=((i+1)*30-90)*Math.PI/180;b.text(n,cx+(r-30)*Math.cos(a)-35,cy+(r-30)*Math.sin(a)-25,70,50,23,C.blue,true,'center');});const hr=hand(b,cx,cy,90,C.blue,role==='You do'?m.hour*30+m.minute*.5:0),min=hand(b,cx,cy,130,C.green,role==='You do'?m.minute*6:0);if(role!=='You do'){spin(b,hr,m.hour*30+m.minute*.5);spin(b,min,m.minute*6);}}
  else {const hands=clock(b,m.hour,m.minute,460,415,170,role!=='You do');if(m.add){spin(b,hands.min,m.add*6);spin(b,hands.hr,m.add*.5,2);}}
  for(let k=0;k<60;k++){const a=(k*6-90)*Math.PI/180;b.lineTo(460+160*Math.cos(a),415+160*Math.sin(a),460+168*Math.cos(a),415+168*Math.sin(a),C.blue,1);}
  b.show(b.text(`${m.hour}:${String(m.minute).padStart(2,'0')}`,790,330,350,100,46,C.green,true,'center'));
 }
 else if(t==='calendar'){
  b.text(m.label,225,250,830,70,38,C.blue,true,'center');for(let row=0;row<4;row++)for(let col=0;col<7;col++)b.rect(280+col*100,340+row*45,100,45,C.pale,C.line,1);
 }
 else if(t==='angle'){
  const cx=450,cy=490,len=240,a=-m.angle*Math.PI/180;b.lineTo(cx,cy,cx+len,cy,C.blue,5);const arm=b.lineTo(cx,cy,cx+len*Math.cos(a),cy+len*Math.sin(a),C.green,5);if(role!=='You do')b.show(arm);b.show(b.lineTo(cx,cy,cx,cy-len,C.amber,2));b.text('Compare with a right angle',720,285,460,110,29,C.green,true);
 }
 else if(t==='turn'){const arrow=hand(b,590,410,145,C.blue,0);spin(b,arrow,m.turn*90);}
 else if(t==='solid'){solid(b,m.name,450,290,190);if(m.rotated)b.show(b.text('The orientation changes; the properties stay the same.',200,545,900,60,27,C.green,true,'center'));}
 else if(t==='polygon'){
  const points={
   'equilateral triangle':[[460,535],[650,220],[840,535]],
   'isosceles triangle':[[420,535],[650,220],[880,535]],
   'scalene triangle':[[390,535],[560,245],[910,535]],
   rectangle:[[390,270],[880,270],[880,535],[390,535]],
   rhombus:[[650,225],[910,400],[650,575],[390,400]],
   trapezium:[[480,260],[800,260],[920,535],[350,535]]
  }[m.name];
  const shape=b.poly(points,C.pale,C.blue,4);if(role!=='You do')b.show(shape);
 }
 else if(t==='coordinate'){
  const ox=360,oy=625,step=40;for(let j=0;j<=10;j++){b.lineTo(ox+j*step,oy-10*step,ox+j*step,oy,C.line,1);b.lineTo(ox,oy-j*step,ox+10*step,oy-j*step,C.line,1);b.text(j,ox+j*step-22,oy+4,44,42,15,C.grey,false,'center');if(j)b.text(j,ox-46,oy-j*step-18,38,38,15,C.grey,false,'center');}
  const start=b.dot(ox+m.x*step-10,oy-m.y*step-10,C.blue,20);b.text(`(${m.x}, ${m.y})`,ox+m.x*step-55,oy-m.y*step-58,110,42,22,C.blue,true,'center');
  if(m.dx||m.dy){const finish=b.dot(ox+m.x*step-10,oy-m.y*step-10,C.green,20);b.hide(finish);b.show(finish);b.move(finish,m.dx*step,-m.dy*step,2);b.show(b.text(`(${m.x+m.dx}, ${m.y+m.dy})`,ox+(m.x+m.dx)*step-70,oy-(m.y+m.dy)*step-58,140,42,22,C.green,true,'center'),3);}
 }
 else if(t==='symmetry'){
  const vertical=m.axis==='vertical',axisX=650,axisY=405;b.lineTo(vertical?axisX:300,vertical?190:axisY,vertical?axisX:1000,vertical?610:axisY,C.green,4);
  const left=[[420,290],[535,245],[565,350],[500,455],[390,410]],mirror=left.map(([x,y])=>vertical?[2*axisX-x,y]:[x,2*axisY-y]);b.poly(left,C.pale,C.blue,4);const other=b.poly(mirror,'#D8F3E8',C.green,4);if(m.complete)b.show(other);
 }
 else if(t==='grid'||t==='ruler'){
  for(let j=0;j<=10;j++)b.lineTo(270+j*70,245,270+j*70,525,C.line,1);for(let j=0;j<=4;j++)b.lineTo(270,245+j*70,970,245+j*70,C.line,1);
  if(t==='grid'){const wide=m.name==='rectangle'?350:210,bottom=m.name==='rectangle'?455:525;for(const v of [[410,315,410+wide,315],[410+wide,315,410+wide,bottom],[410+wide,bottom,410,bottom],[410,bottom,410,315]])b.show(b.lineTo(...v,C.blue,4));}
  else b.text('Use a real ruler. This screen grid is not to scale.',150,555,980,45,26,C.grey,false,'center');
 }
 else if(t==='lines'){
  if(m.style==='crossLines'){b.lineTo(250,300,1050,300,C.blue,5);b.show(b.lineTo(250,500,1050,500,C.blue,5));b.show(b.lineTo(650,240,650,560,C.green,5));}else if(m.style==='rectangle'){b.rect(360,270,500,270,C.white,C.blue,4);b.show(b.lineTo(360,280,860,280,C.green,4));b.show(b.lineTo(360,530,860,530,C.green,4));}
  else if(m.style==='perpendicular'){b.lineTo(250,400,1050,400,C.blue,5);b.show(b.lineTo(650,240,650,560,C.green,5));}
  else if(m.style==='vertical'){b.lineTo(450,240,450,550,C.blue,5);b.show(b.lineTo(800,240,800,550,C.green,5));}
  else {b.lineTo(250,300,1050,300,C.blue,5);b.show(b.lineTo(250,500,1050,500,C.green,5));}
 }
 else if(t==='data'){
  const max=m.key*10;for(let j=0;j<3;j++){b.text(m.labels[j],100,245+j*105,180,70,29,C.blue,true);
   if(m.mode==='table')b.text(m.values[j],650,245+j*105,250,70,39,colors[j],true,'center');
   else if(m.mode==='pictogram'){for(let k=0;k<m.values[j]/m.key;k++)b.dot(320+k*78,258+j*105,colors[j],39);}
   else {const s=b.rect(320,260+j*105,m.values[j]/max*760,55,colors[j]);if(m.mode==='drawBar'&&j===2)b.show(s);}}
  if(m.mode==='pictogram')b.text('Each circle = '+m.key,330,560,730,45,28,C.grey,true,'center');else if(m.mode!=='table'){for(let n=0;n<=10;n+=2)b.text(n*m.key,290+n*76,555,60,40,23,C.grey,false,'center');}
 }
 else throw Error('No model '+t);
 b.show(b.text(q.a.replace(/ Accept .*/,''),70,607,1140,52,q.a.length>110?23:29,C.green,true,'center'));
}
for(const item of JSON.parse(await fs.readFile(root+'/lessons.json','utf8'))){
 const id=`4:${item.week}.${item.day}`;if(only.length&&!only.includes(id))continue;const dir=path.join(root,'build',`4-${item.week}-${item.day}`);await fs.mkdir(dir,{recursive:true});const p=Presentation.create({slideSize:{width:1600,height:900}}),b=new Board(p,item);
 b.slide(item.title,'Learning intention and date');b.text(item.objective,125,270,1030,140,34,C.blue,true,'center');b.text('Date: ____ / ____ / ______',710,490,460,60,28,C.grey);
 for(const [i,role] of ['I do','We do','You do','I do','You do'].entries())teach(b,item.examples[i],role);
 b.slide('Pip is thinking',item.misconception);b.s.images.add({blob:tess,contentType:'image/png',alt:'Pip the penguin',fit:'contain',position:{left:1120,top:270,width:330,height:480}});b.text('Show Pip your model',100,280,750,80,38,C.blue,true);b.show(b.text(item.check,100,430,750,135,30,C.green,true));
 for(const q of item.expected)teach(b,q,'You do');
 b.slide('You do','All five questions');item.expected.forEach((q,i)=>b.text(`${i+1}. ${q.q}`,75,215+i*82,1120,78,q.q.length>115?22:26,C.ink));const activitySlide=b.counter;
 b.slide('Answers','Check and explain');item.expected.forEach((q,i)=>b.show(b.text(`${i+1}. ${q.a}`,75,215+i*82,1120,78,q.a.length>115?22:26,C.green)));
 const manifest={id,year:4,week:item.week,day:item.day,slug:item.slug,count:b.counter,activitySlide,answerSlide:b.counter,expectedQuestions:item.expected,slides:b.manifest,format:'year4-visual',source:`lessons/year-4-maths/week-${item.week}/week${item.week}-lessons.json`,file:'interactive-teaching-slides.pptx'};
 await (await PresentationFile.exportPptx(p)).save(path.join(dir,'candidate.pptx'));await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));console.log('BUILT '+id+' '+b.counter+' slides');
}
