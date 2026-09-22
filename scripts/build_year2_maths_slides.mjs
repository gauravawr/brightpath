import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Board,C} from './maths_visual_renderer.mjs';
const root=path.resolve(process.argv[2]??'.qa/year2-maths'),only=process.argv.slice(3);
const {Presentation,PresentationFile}=await import(pathToFileURL('C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs').href);
const tess=await fs.readFile('scripts/assets/tess.png');
const colors=[C.blue,C.green,'#875BB2','#D18A23'];
function dots(b,n,x,y,cols=10,size=25,gap=36,color=C.blue){return Array.from({length:n},(_,i)=>({s:b.dot(x+i%cols*gap,y+Math.floor(i/cols)*gap,color,size),x:x+i%cols*gap,y:y+Math.floor(i/cols)*gap}));}
function base(b,n,x,y,onesX=x+380){
 const ts=[],os=[];
 for(let t=0;t<Math.floor(n/10);t++){const cells=[];for(let j=0;j<10;j++)cells.push(b.rect(x+t*36,y+j*13,25,13,C.blue,C.white,.7));ts.push(cells);}
 for(let i=0;i<n%10;i++)os.push({s:b.dot(onesX+i%5*41,y+Math.floor(i/5)*41,C.green,28),x:onesX+i%5*41,y:y+Math.floor(i/5)*41});
 return {ts,os};
}
function lineModel(b,lo,hi,step=1,y=410){const x=120,w=1030; b.line(x,y,w);for(let n=lo;n<=hi;n+=step){const xx=x+(n-lo)/(hi-lo)*w;b.lineTo(xx,y-8,xx,y+10);b.text(n,xx-40,y+20,80,48,hi-lo>30?18:23,C.ink,false,'center');}return n=>x+(n-lo)/(hi-lo)*w;}
function flat(b,name,x,y,s=140,color=C.blue){
 if(name==='circle')return b.dot(x,y,color,s);
 if(['triangle','pentagon','hexagon'].includes(name)){const n=name==='triangle'?3:name==='pentagon'?5:6;return b.poly(Array.from({length:n},(_,i)=>[x+s/2+s/2*Math.cos(-Math.PI/2+i*2*Math.PI/n),y+s/2+s/2*Math.sin(-Math.PI/2+i*2*Math.PI/n)]),color);}
 return b.rect(x,y,name==='rectangle'?s*1.5:s,s,color,C.ink,2);
}
function solid(b,name,x,y,s=160){
 if(name==='cylinder'){return [b.rect(x,y+25,s,s,'#BFDBFE',C.blue,2),b.rect(x,y+s,s,50,'#BFDBFE',C.blue,2,'ellipse'),b.rect(x,y,s,50,C.pale,C.blue,2,'ellipse')];}
 if(name==='square based pyramid'){return [b.poly([[x+s*.5,y],[x,y+s*.8],[x+s*.58,y+s]],'#BFDBFE'),b.poly([[x+s*.5,y],[x+s*.58,y+s],[x+s,y+s*.8]],'#93C5FD')];}
 if(name==='triangular prism'){return [b.poly([[x,y+s],[x+s,y+s],[x+s/2,y]],'#BFDBFE'),b.poly([[x+s,y+s],[x+s+55,y+s-45],[x+s/2+55,y-45],[x+s/2,y]],'#93C5FD')];}
 const w=name==='cuboid'?s*1.5:s;return [b.rect(x,y+40,w,s,'#BFDBFE',C.blue,2),b.poly([[x,y+40],[x+40,y],[x+w+40,y],[x+w,y+40]],C.pale),b.poly([[x+w,y+40],[x+w+40,y],[x+w+40,y+s],[x+w,y+s+40]],'#93C5FD')];
}
function pointer(b,cx,cy,len,color){return b.poly([[cx-5,cy],[cx,cy-len],[cx+5,cy]],color,color);}
// The symmetrical invisible bounds place the rotation centre on the clock hub.
function hand(b,cx,cy,len,color,initial=0){
 const pts=[[cx-5,cy],[cx,cy-len],[cx+5,cy]];const a=initial*Math.PI/180;
 const rotate=([x,y])=>[cx+(x-cx)*Math.cos(a)-(y-cy)*Math.sin(a),cy+(x-cx)*Math.sin(a)+(y-cy)*Math.cos(a)];
 const p=pts.map(rotate),s=b.s.shapes.add({name:'object-'+(++b.id),geometry:'custom',position:{left:(cx-len)*1.25,top:(cy-len)*1.25,width:len*2*1.25,height:len*2*1.25},fill:color,line:{fill:color,width:1},customPaths:[{width:len*2*1.25,height:len*2*1.25,commands:[...p.map(([x,y],i)=>({[i?'lineTo':'moveTo']:{x:(x-cx+len)*1.25,y:(y-cy+len)*1.25}})),{close:{}}]}]});return s;
}
const spin=(b,s,angle,t=1)=>b.ev.push({name:s.name,type:'rotate',angle,trigger:t,duration:1});
function clock(b,h,m,cx=450,cy=400,r=175,animate=true){
 b.dot(cx-r,cy-r,C.white,r*2);
 for(let n=1;n<=12;n++){const a=(n*30-90)*Math.PI/180;b.text(n,cx+(r-30)*Math.cos(a)-23,cy+(r-30)*Math.sin(a)-23,46,46,25,C.ink,true,'center');}
 const hr=hand(b,cx,cy,r*.55,C.blue,animate?0:h%12*30+m*.5),min=hand(b,cx,cy,r*.77,C.green,animate?0:m*6);
 if(animate){spin(b,hr,h%12*30+m*.5);spin(b,min,m*6,2);}b.dot(cx-8,cy-8,C.ink,16);return {hr,min};
}
function calculation(b,m){
 const sub=m.op==='−';
 if(['add20','sub20','addBridge','subBridge','addMethod','subMethod','inverse20'].includes(m.mode)){
  const lo=Math.max(0,Math.floor(Math.min(m.a,m.total)/10)*10-10),hi=Math.ceil(Math.max(m.a,m.total)/10)*10+10;
  const X=lineModel(b,lo,hi,5);const marker=b.dot(X(m.a)-10,373,C.blue,20);
  let first=sub?m.a%10:10-m.a%10;first=Math.min(first,m.b);const middle=m.a+(sub?-first:first),rest=m.b-first;
  b.text('Start at '+m.a,100,235,550,55,34,C.blue,true);b.move(marker,(middle-m.a)/(hi-lo)*1030,0);
  b.show(b.text(`${m.a} ${m.op} ${first} = ${middle}`,100,510,490,60,34,C.blue,true),3);
  if(rest){b.move(marker,(sub?-rest:rest)/(hi-lo)*1030,0);b.show(b.text(`${middle} ${m.op} ${rest} = ${m.total}`,660,510,510,60,34,C.green,true),3);}return;
 }
 if(m.mode==='three'||m.mode==='twoStep'){
  const first=dots(b,m.a,100,260,10,20,29),added=dots(b,m.b,700,260,10,24,34,C.green);
  added.forEach((o,i)=>b.move(o.s,100+((m.a+i)%10)*29-o.x,390+Math.floor((m.a+i)/10)*29-o.y,i?2:1));
  first.forEach((o,i)=>b.move(o.s,0,130,i?2:1));b.show(b.text(`${m.a} + ${m.b} = ${m.a+m.b}`,700,360,500,60,32,C.blue,true));
  if(m.mode==='three'){
   const last=dots(b,m.c,790,480,5,25,37,'#875BB2');last.forEach((o,i)=>b.show(o.s,i?2:1));last.forEach((o,i)=>b.move(o.s,100+((m.a+m.b+i)%10)*29-o.x,390+Math.floor((m.a+m.b+i)/10)*29-o.y,i?2:1));
  }else{
   [...first,...added].slice(-m.c).forEach((o,i)=>{const j=m.a+m.b-m.c+i;b.move(o.s,790+i%5*37-(100+j%10*29),480+Math.floor(i/5)*37-(390+Math.floor(j/10)*29),i?2:1);});
  }
  b.show(b.text(`${m.a+m.b} ${m.mode==='three'?'+':'−'} ${m.c} = ${m.total}`,700,540,500,50,31,C.green,true));return;
 }
 if(['missing','family'].includes(m.mode)){
  const whole=sub?m.a:m.total,part=sub?m.total:m.a;b.text('whole: '+whole,390,240,500,65,37,C.blue,true,'center');b.rect(140,335,1000,110,C.pale,C.blue,2);b.lineTo(640,335,640,445,C.blue);
  b.text(part,140,350,500,75,45,C.blue,true,'center');b.show(b.text(m.b,640,350,500,75,45,C.green,true,'center'));
  if(m.mode==='family')b.show(b.text(`${m.total} − ${m.a} = ${m.b}`,280,490,720,55,35,C.green,true,'center'));return;
 }
 const a=base(b,m.a,130,245,540),at=Math.floor(m.a/10),ao=m.a%10,bt=Math.floor(m.b/10),bo=m.b%10;
 b.text('tens',125,210,350,35,23,C.blue,true);b.text('ones',530,210,340,35,23,C.green,true);
 if(!sub){
  const z=base(b,m.b,130,455,540);z.ts.forEach((cells,t)=>cells.forEach((s,j)=>b.move(s,at*36,-210,t||j?2:1)));
  z.os.forEach((o,i)=>b.move(o.s,540+((ao+i)%5)*41-o.x,245+Math.floor((ao+i)/5)*41-o.y,i?2:1));
  const combined=[...a.os,...z.os];
  if(ao+bo>=10){
   b.show(b.text('10 ones become 1 ten',850,250,330,105,30,C.green,true,'center'));
   combined.slice(0,10).forEach((o,i)=>b.hide(o.s,i?2:1));
   for(let j=0;j<10;j++)b.show(b.rect(130+(at+bt)*36,245+j*13,25,13,C.blue,C.white,.7),2);
   for(let i=10;i<combined.length;i++){const idx=i-10,oldX=540+i%5*41,oldY=245+Math.floor(i/5)*41;b.move(combined[i].s,540+idx%5*41-oldX,245+Math.floor(idx/5)*41-oldY,i===10?1:2);}
  }
 }else{
  let ones=[...a.os];
  if(ao<bo){
   b.show(b.text('1 ten becomes 10 ones',855,260,330,110,30,C.blue,true,'center'));
   const last=a.ts.at(-1);last.forEach((s,j)=>{const xx=540+(ao+j)%5*41,yy=245+Math.floor((ao+j)/5)*41;b.move(s,xx-(130+(at-1)*36),yy-(245+j*13),j?2:1);ones.push({s,x:xx,y:yy});});
  }
  const remain=at-(ao<bo?1:0);for(let t=0;t<bt;t++)a.ts[remain-1-t].forEach((s,j)=>b.move(s,900+t*40-(130+(remain-1-t)*36),190,j?2:1));
  if(bo)ones.slice(-bo).forEach((o,i)=>b.move(o.s,940+i%5*39-o.x,490+Math.floor(i/5)*37-o.y,i?2:1));
  b.text('taken away',880,575,330,35,22,C.grey,true,'center');
 }
}
function teaching(b,e,role){const m=e.model;b.slide(role,e.q,e.a+' Model each action, then ask pupils to explain the change.');if(role==='We do')b.text('Let’s work together',850,40,350,40,23,C.grey,false,'right');
 switch(m.kind){
 case 'place':{
  if(['line','between','compareMissing'].includes(m.mode)){const X=lineModel(b,m.lo,m.hi);if(m.mode==='line'){const d=b.dot(X(m.lo)-10,374,C.blue,20);b.move(d,X(m.n)-X(m.lo),0);}else{for(let n=m.lo+1;n<m.hi;n++)b.show(b.text(n,X(n)-30,295,60,60,34,C.green,true,'center'));}}
  else if(m.mode==='order'){const ordered=[...m.values].sort((a,z)=>a-z);m.values.forEach((n,i)=>{const s=b.text(n,90+i*300,270,270,80,55,colors[i],true,'center');b.move(s,(ordered.indexOf(n)-i)*300,180);});}
  else if(['compare','symbols'].includes(m.mode)){base(b,m.n,90,290,380);base(b,m.b,690,290,980);b.show(b.text(m.n>m.b?'>':m.n<m.b?'<':'=',570,350,100,80,55,C.green,true,'center'));}
  else {const model=base(b,m.n,130,280,650);const t=b.text(Math.floor(m.n/10),180,440,200,60,48,C.blue,true),o=b.text(m.n%10,650,440,200,60,48,C.green,true);b.show(t);b.show(o,2);if(m.mode==='exchange'){model.ts.at(-1).forEach((s,j)=>b.move(s,650+(m.n%10+j)%5*38-(130+(Math.floor(m.n/10)-1)*36),280+Math.floor((m.n%10+j)/5)*38-(280+j*13),j?2:1));b.hide(t);b.hide(o,2);b.show(b.text(`${Math.floor(m.n/10)-1} tens and ${m.n%10+10} ones`,280,510,760,60,38,C.green,true,'center'),2);}}
  break;}
 case 'sequence':m.values.forEach((n,i)=>{b.rect(80+i*235,335,195,90,C.pale,C.line,1);const label=b.text(i===2?'?':n,80+i*235,345,195,68,43,C.blue,true,'center');if(i===2){b.hide(label);const t=b.text(n,80+i*235,240,195,70,43,C.green,true,'center');b.show(t);b.move(t,0,105,3);}});break;
 case 'bonds':{b.text('whole: '+m.total,375,240,530,65,38,C.blue,true,'center');b.rect(180,350,400,120,C.pale,C.blue,2);b.rect(700,350,400,120,C.white,C.green,2);b.text(m.part,180,370,400,70,48,C.blue,true,'center');const s=b.text(m.total-m.part,710,245,380,70,48,C.green,true,'center');b.show(s);b.move(s,0,130,3);break;}
 case 'calc':calculation(b,m);break;
 case 'groups':case 'division':{
  if(['array','commute'].includes(m.mode)){
   const ds=dots(b,m.total,170,250,m.size,28,47);if(m.mode==='commute')ds.forEach((o,i)=>b.move(o.s,700+Math.floor(i/m.size)*47-o.x,250+i%m.size*47-o.y,i?2:1));
   b.show(b.text(`${m.groups} × ${m.size} = ${m.total}`,190,515,870,60,37,C.green,true,'center'));break;
  }
  if(m.mode==='fiveTen'){
   const gap=140;for(let g=0;g<m.groups;g++){b.rect(95+g*gap,260,125,290,C.white,C.blue,2);dots(b,5,110+g*gap,275,1,20,25);const extra=dots(b,5,180+g*gap,275,1,20,25,C.green);extra.forEach((o,i)=>b.show(o.s,g||i?2:1));}break;
  }
  const total=m.total,groups=m.mode==='parity'?Math.ceil(total/2):m.groups,size=m.mode==='parity'?2:m.size;
  const rows=dots(b,total,95,235,20,19,28);const gap=Math.min(95,1000/groups);
  for(let g=0;g<groups;g++){const box=b.rect(95+g*gap,385,gap-7,190,C.white,colors[g%4],2);if(m.kind==='division'&&!m.share)b.show(box,g?2:1);}
  rows.forEach((o,i)=>{const g=m.kind==='division'&&m.share?i%groups:Math.floor(i/size),j=m.kind==='division'&&m.share?Math.floor(i/groups):i%size;b.move(o.s,108+g*gap+(j%2)*28-o.x,398+Math.floor(j/2)*33-o.y,i%size?2:1);});
  break;}
 case 'money':{
  if(m.notes){m.notes.forEach((v,i)=>{b.rect(180+i*490,300,390,160,C.pale,C.green,3);b.text('£'+v,180+i*490,330,390,100,55,C.green,true,'center');});b.show(b.text('£5 + £10 = £15',230,505,820,65,38,C.green,true,'center'));break;}
  const values=m.mode==='twoItems'?[m.price,m.second]:m.mode==='change'?[m.price,100]:m.coins;
  values.forEach((v,i)=>{const x=120+i*260;if(m.mode==='twoItems'||m.mode==='change'&&i===0){b.rect(x,290,200,150,'#FFF7ED',C.line,2);b.text('price',x,253,200,35,22,C.grey,true,'center');}else b.dot(x,290,'#E5C889',150);b.text(v===100?'£1':v+'p',x,322,m.mode==='twoItems'||m.mode==='change'&&i===0?200:150,80,39,C.ink,true,'center');});
  if(['change','twoItems'].includes(m.mode)){const cost=m.price+(m.second??0);b.show(b.text('cost: '+cost+'p',180,495,450,60,34,C.blue,true));b.show(b.text('100p − '+cost+'p = '+(100-cost)+'p',665,495,520,60,32,C.green,true));}
  else {let sum=0;m.coins.forEach((v,i)=>{sum+=v;b.show(b.text(sum+'p',120+i*260,490,160,60,35,C.green,true,'center'));});}
  break;}
 case 'measure':{
  if(['cm','offset','lengthCompare'].includes(m.mode)){const lo=0,hi=Math.max(10,m.end??m.a,m.b??0)+1,X=lineModel(b,lo,hi);const start=m.start??0,end=m.end??m.a;b.rect(X(start),335,X(end)-X(start),40,C.blue);if(m.mode==='lengthCompare')b.rect(X(0),270,X(m.b)-X(0),40,C.green);b.show(b.text((end-start)+' cm',340,500,640,60,38,C.green,true,'center'));}
  else if(['mass','capacity'].includes(m.mode)){const X=lineModel(b,0,m.max,m.step);const s=b.dot(110,365,C.blue,20);b.move(s,m.value/m.max*1030,0);b.text(m.unit,1090,500,100,60,30,C.blue,true);}
  else if(m.mode==='temperature'){b.rect(420,255,80,300,C.white,C.blue,2);b.rect(425,555-m.value*10,70,m.value*10,'#E88A7A');for(let n=0;n<=30;n+=2){b.lineTo(500,555-n*10,530,555-n*10,C.ink,2);if(n%10===0)b.text(n,540,537-n*10,80,38,24,C.ink);}b.show(b.text(m.value+'°C',760,365,300,90,48,C.green,true));}
  else if(m.mode==='metres'){for(let i=0;i<m.a;i++){b.rect(100+i*300,300,265,90,C.pale,C.blue,2);b.text('1 m = 100 cm',100+i*300,310,265,70,27,C.blue,true,'center');}b.show(b.text(`and ${m.b} cm`,400,455,500,75,37,C.green,true,'center'));}
  else if(m.mode==='lengthProblem'){const scale=950/m.a;b.rect(120,300,(m.a-m.b)*scale,65,C.blue);const cut=b.rect(120+(m.a-m.b)*scale,300,m.b*scale,65,'#E4A464');b.move(cut,0,170);b.show(b.text(`${m.a} − ${m.b} = ${m.a-m.b} cm`,220,390,820,65,37,C.green,true,'center'));}
  else{const vals=[m.a,m.b].filter(Number.isFinite);if(m.mode==='unit'){m.choices.forEach((v,i)=>b.text(v,190+i*570,330,420,100,54,colors[i],true,'center'));}else vals.forEach((v,i)=>{b.rect(120,285+i*140,v*850/Math.max(...vals),55,colors[i]);b.text(v+' '+m.unit,1000,280+i*140,200,65,31,colors[i],true);});}
  break;}
 case 'fraction':{
  if(m.shape||['equal','equivalent'].includes(m.mode)){const dens=m.mode==='equivalent'?[2,4]:[m.den];dens.forEach((den,row)=>{let x=160;for(let j=0;j<den;j++){const width=950/den*(m.mode==='equal'&&!m.equal?(j===0?.5:j===den-1?1.5:1):1);const s=b.rect(x,285+row*145,width,100,C.white,'#875BB2',2);if(j<(m.mode==='equivalent'?(row?2:1):m.num)){const fill=b.rect(x+2,287+row*145,width-4,96,'#D6C2ED');b.show(fill,j?2:1);}x+=width;}});}
  else if(m.mode==='count'){for(let j=0;j<5;j++)b.show(b.text(j===0?'0':`${j}/${m.den}`,100+j*230,335,200,95,45,C.blue,true,'center'));}
  else {const ds=dots(b,m.total,105,245,15,24,37,'#875BB2');if(m.mode==='whole')ds.slice(m.total/m.den).forEach((o,i)=>b.show(o.s,i?2:1));for(let g=0;g<m.den;g++)b.rect(110+g*1080/m.den,425,1020/m.den,145,C.white,colors[g%4],2);ds.forEach((o,i)=>b.move(o.s,130+i%m.den*1080/m.den+Math.floor(i/m.den)%5*37-o.x,450+Math.floor(Math.floor(i/m.den)/5)*38-o.y,i%m.den?2:1));}
  break;}
 case 'shape':{
  if(['solid','faces'].includes(m.mode)){solid(b,m.name,460,285,195);}
  else if(m.mode==='sort'){m.names.forEach((name,i)=>flat(b,name,80+i*230,300,115,colors[i%4]));}
  else {flat(b,m.name,430,290,220);if(m.mode==='symmetry'){const cx=m.name==='rectangle'?595:540;b.show(b.lineTo(cx,260,cx,540,'#E18B21',4));b.show(b.lineTo(400,400,m.name==='rectangle'?790:680,400,'#E18B21',4));if(m.name==='square'){b.show(b.lineTo(430,290,650,510,'#E18B21',4));b.show(b.lineTo(650,290,430,510,'#E18B21',4));}}}
  break;}
 case 'direction':{
  if(['position','route'].includes(m.mode)){const x=420,y=240,s=60;for(let row=0;row<5;row++)for(let col=0;col<5;col++)b.rect(x+col*s,y+row*s,s,s,C.white,C.line,1);const d=b.dot(x+17,y+4*s+17,C.blue,25);b.move(d,m.dx*s,0);b.move(d,0,-m.dy*s);}
  else if(m.mode==='pattern'){m.values.forEach((d,i)=>{const s=hand(b,150+i*230,390,80,colors[i%4],d*90);});}
  else {const s=hand(b,580,420,150,C.blue,m.start*90);spin(b,s,(m.clockwise?1:-1)*m.turn*90);}
  break;}
 case 'time':{
  if(m.mode==='duration'){b.text(`${m.hours} × 60 minutes`,220,300,850,100,45,C.blue,true,'center');}
  else if(m.mode==='elapsed'){const hands=clock(b,m.hour,m.minute,445,410,165,false);spin(b,hands.min,m.add*6);spin(b,hands.hr,m.add*.5,2);b.text('add '+m.add+' minutes',730,350,450,90,35,C.green,true);}
  else {clock(b,m.hour,m.minute,450,400,175,role!=='You do'||m.mode==='draw');b.text('short hand: hours',740,310,445,70,29,C.blue,true);b.text('long hand: minutes',740,415,445,70,29,C.green,true);}
  break;}
 case 'data':{
  m.labels.forEach((label,j)=>{const y=265+j*100;b.text(label,75,y,200,70,28,C.ink,true);const count=m.values[j]/m.key;
   if(m.mode==='tally'){for(let i=0;i<m.values[j];i++){const x=325+Math.floor(i/5)*185+i%5*32;const s=i%5===4?b.lineTo(x-138,y+63,x,y+5,colors[j],4):b.lineTo(x,y+5,x,y+65,colors[j],4);if(role!=='You do')b.show(s,i?2:1);}}
   else if(m.mode==='table'){b.text(m.values[j],470,y,280,70,38,colors[j],true);b.line(75,y+77,780,C.line,2);}
   else for(let i=0;i<count;i++){const s=b.rect(315+i*92,y+10,54,54,colors[j],C.ink,1,m.mode==='pictogram'||m.mode==='difference'||m.mode==='complete'?'ellipse':'rect');if(role!=='You do'||j===2&&['draw','complete'].includes(m.mode))b.show(s,i?2:1);}
   if(m.mode!=='table')b.show(b.text(m.values[j],1030,y,160,70,35,colors[j],true));});if(!['tally','table'].includes(m.mode))b.text('Each symbol = '+m.key,355,565,570,50,25,C.grey,true,'center');
  break;}
 }
 const result=e.a.replace(/\s*Accept .*/,'');if(result.length>75)b.show(b.text(result,75,595,1130,70,24,C.green,true,'center'));else b.result(result,600);
}
function mini(b,m,x,y,w,h){
 if(['groups','division','fraction'].includes(m.kind)){const n=m.total??m.groups*m.size,cols=Math.min(12,n),size=Math.min(13,(w-12)/cols-3,(h-10)/Math.ceil(n/cols)-3);dots(b,n,x+5,y+5,cols,size,size+3,'#875BB2');}
 else if(m.kind==='place'){if(m.values)m.values.forEach((n,i)=>b.text(n,x+i*w/m.values.length,y,w/m.values.length,h,22,C.blue,true,'center'));else {base(b,m.n,x+5,y+3,x+w*.6);}}
 else if(m.kind==='sequence'){m.values.forEach((n,i)=>b.text(i===2?'?':n,x+i*w/5,y,w/5,h,20,C.blue,true,'center'));}
 else if(m.kind==='time'){clock(b,m.hour??1,m.minute??0,x+w/2,y+h/2,36,false);}
 else if(m.kind==='shape'){if(['solid','faces'].includes(m.mode))solid(b,m.name,x+35,y+5,40);else flat(b,m.name??'square',x+50,y+7,52);}
 else if(m.kind==='money'){m.coins.slice(0,4).forEach((v,i)=>{b.dot(x+i*65,y+8,'#E5C889',48);b.text(v+'p',x+i*65,y+16,48,28,14,C.ink,true,'center');});}
 else if(m.kind==='data'){m.values.forEach((v,i)=>b.rect(x+i*80,y+h-v*3,50,v*3,colors[i]));}
 else if(m.kind==='calc'){b.text(`${m.a} ${m.op} ${m.b}`,x,y,w,h,27,C.blue,true,'center');}
 else if(m.kind==='bonds'){b.text(`${m.part} + ? = ${m.total}`,x,y,w,h,24,C.blue,true,'center');}
 else if(m.kind==='direction'){hand(b,x+w/2,y+h/2,30,C.blue,(m.start??0)*90);}
 else {b.text(m.value!==undefined?m.value+' '+m.unit:m.a!==undefined?m.a+' '+m.unit:m.choices.join(' / '),x,y,w,h,22,C.blue,true,'center');}
}
for(const item of JSON.parse(await fs.readFile(path.join(root,'lessons.json'),'utf8'))){
 const id=`2:${item.week}.${item.day}`,dir=path.join(root,'build',`2-${item.week}-${item.day}`);if(only.length&&!only.includes(id))continue;await fs.mkdir(dir,{recursive:true});
 const p=Presentation.create({slideSize:{width:1600,height:900}}),b=new Board(p,item);
 b.slide(item.title,'Learning intention and date');b.text(item.objective.replace(/^To /,'I can '),125,250,1030,135,33,C.ink,true,'center');b.text('Date: ____ / ____ / ______',710,480,465,75,28,C.grey);
 for(const [i,role] of ['I do','We do','You do','I do','You do'].entries())teaching(b,item.examples[i],role);
 b.slide('Tess is thinking',item.misconception,'Ask pupils to explain the misconception with the objects or diagram. '+item.check);
 b.s.images.add({blob:tess,contentType:'image/png',alt:'Tess the tortoise thinking',fit:'contain',position:{left:1120,top:265,width:370,height:510}});
 b.text('What would you show Tess?',100,260,750,100,38,C.blue,true);b.show(b.text(item.check,100,440,750,130,30,C.green,true));
 // Give each expected task a large visual before the final all-five overview.
 for(let i=0;i<5;i++)teaching(b,item.expected[i],'You do');
 b.slide('You do','All five questions. Use your one-page worksheet.');
 item.expected.forEach((q,i)=>{b.text(`${i+1}. ${q.q}`,75,220+i*79,1100,72,q.q.length>110?22:26,C.ink);});const activitySlide=b.counter;
 b.slide('Answers','Check each answer and explain your model.');item.expected.forEach((q,i)=>b.show(b.text(`${i+1}. ${q.a}`,75,218+i*81,1120,75,q.a.length>130?21:25,C.green)));
 const manifest={id,year:2,week:item.week,day:item.day,slug:item.slug,count:b.counter,activitySlide,answerSlide:b.counter,expectedQuestions:item.expected,slides:b.manifest,format:'year2-tess-visual',source:`lessons/year-2-maths/week-${item.week}/week${item.week}-lessons.json`,file:'interactive-teaching-slides.pptx'};
 await (await PresentationFile.exportPptx(p)).save(path.join(dir,'candidate.pptx'));await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));console.log('BUILT '+id+' '+b.counter+' slides');
}
