// Editable classroom diagrams and calculation algorithms, with native motion paths.
export const C={ink:'#172B4D',blue:'#1D4ED8',green:'#11745A',amber:'#9A5800',red:'#B42332',grey:'#52647A',pale:'#EFF6FF',line:'#BCD0EA',white:'#FFFFFF'};
export const gcd=(a,b)=>b?gcd(b,a%b):a;
const lcm=(a,b)=>a*b/gcd(a,b),fmt=n=>Number.isInteger(n)?n.toLocaleString('en-GB'):String(+n.toFixed(6));
const factors=n=>Array.from({length:n},(_,i)=>i+1).filter(x=>n%x===0);
const frac=(a,b)=>`${a}/${b}`;
const reduced=(a,b)=>{const g=gcd(a,b);return [a/g,b/g];};
const answerFraction=(a,b)=>{[a,b]=reduced(a,b);return b===1?String(a):a>b?`${Math.floor(a/b)} ${a%b}/${b}`:frac(a,b);};

export class Board {
 constructor(presentation,item){this.p=presentation;this.item=item;this.manifest=[];this.counter=0;this.mathChecks=[];}
 slide(role,question,notes=''){
  this.s=this.p.slides.add();this.s.background.fill=this.item.year===1?'#FFFDF6':this.item.year===2?'#F8FAFF':C.white;this.id=0;this.ev=[];this.counter++;
  this.manifest.push({slide:this.counter,role,events:this.ev});
  const cover=this.counter===1;
  if(this.item.year<=2){
   const phase=role==='I do'?['#DBEAFE','#2563EB']:role==='We do'?['#FEF3C7','#B45309']:role==='You do'?['#F3E8FF','#7C3AED']:role==='Answers'?['#D1FAE5','#047857']:['#DBEAFE','#2563EB'];
   this.rect(42,20,1196,cover?140:74,this.item.year===1?phase[0]:'#EAF0FA');
   this.rect(42,20,9,cover?140:74,phase[1]);
   this.rect(55,cover?170:105,1170,cover?90:100,C.white,'#DCE6F4',1);
   if(this.item.year===1){this.rect(55,658,290,5,'#60A5FA');this.rect(348,658,290,5,'#FBBF24');this.rect(641,658,290,5,'#A78BFA');this.rect(934,658,291,5,'#34D399');}
  }
  this.text(role,55,30,1170,cover?130:60,cover&&role.length>45?35:44,C.blue,true);
  if(role==='You do')this.text('You try.',960,40,265,46,28,C.grey,false,'right');
  this.text(question,55,cover?170:105,1170,cover?85:100,28,C.ink,true);
  this.rect(55,673,1170,1,C.line);
  this.text('BrightPath · '+this.item.title,55,682,1090,24,13,C.grey);
  this.text(String(this.counter),1160,682,65,24,13,C.grey,false,'right');
  this.s.speakerNotes.textFrame.setText(`${this.item.title}. ${role}. ${role==='You do'?'Pause before clicking. Let pupils try independently, then reveal and discuss every step. ':''}${notes}\nAll moving objects are editable. Each click advances a mathematical step. The final two slides reproduce the existing expected-level activity questions and answers.`);
  return this.s;
 }
 rect(x,y,w,h,fill='none',stroke='none',sw=0,geometry='rect'){
  const name='object-'+(++this.id);
  return this.s.shapes.add({name,geometry,position:{left:x*1.25,top:y*1.25,width:w*1.25,height:h*1.25},fill,line:{fill:stroke,width:sw*1.25}});
 }
 text(t,x,y,w,h,size=30,color=C.ink,bold=false,align='left'){
  const s=this.rect(x,y,w,h);s.text=String(t);s.text.style={typeface:'Arial',fontSize:size*1.25,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'none'};return s;
 }
 line(x,y,w,color=C.ink,sw=3){return this.rect(x,y,w,sw,color);}
 lineTo(x1,y1,x2,y2,color=C.ink,sw=3){return this.s.shapes.add({name:'object-'+(++this.id),geometry:'line',position:{left:Math.min(x1,x2)*1.25,top:Math.min(y1,y2)*1.25,width:Math.abs(x2-x1)*1.25,height:Math.abs(y2-y1)*1.25,verticalFlip:(x2-x1)*(y2-y1)<0},line:{fill:color,width:sw*1.25},fill:'none'});}
 poly(points,fill=C.pale,stroke=C.blue){
  const minx=Math.min(...points.map(p=>p[0])),miny=Math.min(...points.map(p=>p[1]));const w=Math.max(...points.map(p=>p[0]))-minx,h=Math.max(...points.map(p=>p[1]))-miny;
  return this.s.shapes.add({name:'object-'+(++this.id),geometry:'custom',position:{left:minx*1.25,top:miny*1.25,width:w*1.25,height:h*1.25},fill,line:{fill:stroke,width:2.5},customPaths:[{width:w*1.25,height:h*1.25,commands:[...points.map((p,i)=>({[i?'lineTo':'moveTo']:{x:(p[0]-minx)*1.25,y:(p[1]-miny)*1.25}})),{close:{}}]}]});
 }
 show(s,t=1){this.ev.push({name:s.name,type:'appear',trigger:t});return s;}
 hide(s,t=1){this.ev.push({name:s.name,type:'exit',trigger:t});}
 group(ss,t=1){ss.forEach((s,i)=>this.show(s,i?2:t));return ss;}
 move(s,dx,dy,t=1){this.ev.push({name:s.name,type:'move',dx,dy,trigger:t,duration:.8});}
 fraction(a,b,x,y,w=120,size=58,color=C.blue){return [this.text(a,x,y,w,70,size,color,true,'center'),this.line(x,y+72,w,color,3),this.text(b,x,y+80,w,70,size,color,true,'center')];}
 strip(a,b,x,y,w=840,h=50,prefix){const xs=[];for(let i=0;i<b;i++)xs.push(this.rect(x+i*w/b,y,w/b,h,i<a?C.blue:C.white,C.ink,1.1));return xs;}
 dot(x,y,color=C.blue,size=44){return this.rect(x,y,size,size,color,C.ink,1,'ellipse');}
 result(t,y=585){return this.show(this.text(t,75,y,1130,62,30,C.green,true,'center'));}
 check(a,b,label){if(Math.abs(a-b)>1e-6)throw new Error(`Math check: ${label}: ${a} != ${b}`);this.mathChecks.push(label);}
}

export function render(b,p,role){
 const renderer=renderers[p.kind];if(!renderer)throw new Error('No visual renderer: '+p.kind);
 renderer(b,p,role);
}
const renderers={};

renderers.place=(b,p,r)=>{
 b.slide(r,p.mode==='value'?`What is the value of ${p.digit} in ${fmt(p.n)}?`:`Read ${fmt(p.n)}. What does each digit represent?`,'Move each digit from the number into its place-value column. Read the three-digit periods.');
 const ds=String(p.n).split(''),labels=['ten\nmillions','millions','hundred\nthousands','ten\nthousands','thousands','hundreds','tens','ones'].slice(-ds.length);let target;
 ds.forEach((d,i)=>{
  const x=70+i*(1140/ds.length);b.rect(x,335,1140/ds.length,150,C.pale,C.line,1);b.text(labels[i],x,265,1140/ds.length,65,19,C.grey,false,'center');
  const t=b.text(d,x,215,1140/ds.length,65,52,C.blue,true,'center');b.move(t,0,165);if(Number(d)===p.digit&&!target)target=[d,10**(ds.length-i-1),x];
 });
 if(target)b.result(`${target[0]} × ${fmt(target[1])} = ${fmt(target[0]*target[1])}`);
 else b.result(ds.map((d,i)=>Number(d)*10**(ds.length-i-1)).filter(Boolean).map(fmt).join(' + '));
};
renderers.compare=(b,p,r)=>{
 const vals=p.values;b.slide(r,`Put these numbers in order, smallest first: ${vals.map(fmt).join(', ')}.`,'Compare the greatest place first. Move each whole number to its ordered position.');
 const sorted=[...vals].sort((a,z)=>a-z);const w=vals.length===2?440:340;
 vals.forEach((n,i)=>{const x=90+i*(w+20);const t=b.text(fmt(n),x,250,w,75,43,C.blue,true,'center');b.move(t,(sorted.indexOf(n)-i)*(w+20),190);});
 for(let i=0;i<vals.length-1;i++)b.show(b.text('<',70+(i+1)*(w+20)-25,447,55,65,42,C.ink,true,'center'));
 b.result('Compare from the greatest place. Stop at the first different digit.');
};
renderers.numberLine=(b,p,r)=>{
 b.slide(r,`What is the difference between ${p.a} and ${p.b}?`,'Count intervals, not tick marks. First travel to zero, then to the positive endpoint.');
 const min=p.a-1,max=p.b+1,step=1000/(max-min),X=n=>140+(n-min)*step;
 b.line(140,380,1000);for(let n=min;n<=max;n++){b.lineTo(X(n),368,X(n),392);b.text(n,X(n)-28,402,56,40,23,C.grey,false,'center');}
 const dot=b.dot(X(p.a)-12,349,C.blue,24);b.move(dot,-p.a*step,0);b.show(b.text(`${-p.a} steps`,X(p.a),280,-p.a*step,55,26,C.amber,true,'center'),3);
 b.move(dot,p.b*step,0);b.show(b.text(`${p.b} steps`,X(0),280,p.b*step,55,26,C.amber,true,'center'),3);
 b.result(`${-p.a} + ${p.b} = ${p.b-p.a}`);
};
renderers.round=(b,p,r)=>{
 const lo=Math.floor(p.n/p.unit)*p.unit,hi=lo+p.unit,mid=(lo+hi)/2,ans=Math.round(p.n/p.unit)*p.unit;
 b.slide(r,p.boundary?`What is the smallest whole number that rounds to ${fmt(hi)} to the nearest ${fmt(p.unit)}?`:`Round ${fmt(p.n)} to the nearest ${fmt(p.unit)}.`,'Mark the two multiples and halfway point. Compare the position with halfway.');
 b.line(170,380,920);for(const [n,x]of[[lo,170],[mid,630],[hi,1090]]){b.lineTo(x,362,x,399);b.text(fmt(n),x-145,415,290,55,28,C.ink,true,'center');}
 b.show(b.text('halfway',495,480,270,45,28,C.grey,false,'center'));
 const pos=170+(p.n-lo)/p.unit*920;const d=b.dot(150,275,C.blue,30);b.move(d,pos-165,72);b.show(b.text(fmt(p.n),pos-160,255,320,55,32,C.blue,true,'center'),3);
 b.result(p.boundary?`The boundary is ${fmt(mid)}.`:`${fmt(p.n)} rounds to ${fmt(ans)}.`);
};

renderers.column=(b,p,r)=>{
 const dec=Math.max((String(p.a).split('.')[1]??'').length,(String(p.b).split('.')[1]??'').length),scale=10**dec;
 const ai=Math.round(p.a*scale),bi=Math.round(p.b*scale),total=p.op==='+'?ai+bi:ai-bi;
 if(total<0)throw new Error('Negative subtraction model needs number-line renderer');
 const N=Math.max(String(ai).length,String(bi).length,String(total).length),ad=String(ai).padStart(N,'0').split('').map(Number),bd=String(bi).padStart(N,'0').split('').map(Number);
 b.slide(r,`Calculate ${fmt(p.a)} ${p.op} ${fmt(p.b)}.`,'Align the place values. Reveal one column at a time, including every carry or exchange.');
 const dx=78,start=850-N*dx;const x=i=>start+i*dx;
 ad.forEach((v,i)=>b.text(v,x(i),260,70,65,45,C.blue,true,'center'));
 bd.forEach((v,i)=>b.text(v,x(i),347,70,65,45,C.blue,true,'center'));
 b.text(p.op,start-70,347,55,65,44);b.line(start-20,423,N*dx+35);
 if(dec)for(const y of[298,385,478])b.dot(x(N-dec)-10,y,C.ink,7);
 let carry=0,oldStatus;let working=[...ad];
 for(let i=N-1;i>=0;i--){
  const box=b.rect(x(i)-3,251,76,166,'none',C.amber,3);b.show(box);if(oldStatus)b.hide(oldStatus,2);
  let result,explanation;
  if(p.op==='+'){
   const sum=ad[i]+bd[i]+carry;result=sum%10;explanation=`${ad[i]} + ${bd[i]}${carry?` + ${carry}`:''} = ${sum}`;carry=Math.floor(sum/10);
   if(carry&&i>0){const c=b.text(carry,x(i),216,70,38,26,C.amber,true,'center');b.show(c,2);b.move(c,-dx,0,3);}
  }else{
   if(working[i]<bd[i]){
    let j=i-1;while(working[j]===0)j--;
    working[j]--;b.show(b.text(working[j],x(j),210,70,40,25,C.amber,true,'center'),p.pauseBeforeExchange?1:2);
    for(let k=j+1;k<i;k++){working[k]=9;b.show(b.text('9',x(k),210,70,40,25,C.amber,true,'center'),2);}
    working[i]+=10;const ten=b.text('10',x(j),215,70,38,25,C.amber,true,'center');b.show(ten,2);b.move(ten,(i-j)*dx,0,3);
   }
   result=working[i]-bd[i];explanation=`${working[i]} − ${bd[i]} = ${result}`;
  }
  oldStatus=b.text(explanation,100,544,1080,60,31,C.ink,true,'center');b.show(oldStatus,p.pauseBeforeExchange?1:2);
  b.show(b.text(result,x(i),438,70,70,49,C.green,true,'center'),p.pauseBeforeExchange?1:3);b.hide(box,2);
 }
 b.check(total/scale,p.op==='+'?p.a+p.b:p.a-p.b,'column result');
 b.result(`${fmt(p.a)} ${p.op} ${fmt(p.b)} = ${fmt(total/scale)}`,610);
};
renderers.multiply=(b,p,r)=>{
 const dec=(String(p.a).split('.')[1]??'').length,scale=10**dec,A=Math.round(p.a*scale),digits=String(A).split('').map(Number),bs=String(p.b).split('').map(Number).reverse();
 const N=String(A*p.b).length,dx=72,start=910-N*dx,x=i=>start+i*dx;
 b.slide(r,`Calculate ${fmt(p.a)} × ${p.b}.`,'Reveal each digit multiplication and the carried amount. On a tens row, reveal the zero placeholder before calculating. For a decimal, use the same place-value scale in the answer.');
 const pad=N-digits.length;
 const src=digits.map((v,i)=>b.text(v,x(i+pad),232,64,60,42,C.blue,true,'center'));
 b.text('×',start-60,310,60,60,42);b.text(p.b,x(N-2),310,136,60,42,C.blue,true,'right');b.line(start-15,375,N*dx+25);
 if(dec){b.dot(x(N-dec)-7,272,C.ink,7);bs.forEach((_,row)=>b.dot(x(N-dec)-7,432+row*80,C.ink,7));}
 let old,carryShapes=[];
 bs.forEach((digit,row)=>{
  let carry=0;const y=391+row*80;
  if(row){b.show(b.text('0',x(N-1),y,64,65,45,C.amber,true,'center'));}
  for(let i=digits.length-1;i>=0;i--){
   const product=digits[i]*digit+carry,part=product%10,next=Math.floor(product/10);
   const status=b.text(`${digit} × ${digits[i]}${carry?` + ${carry}`:''} = ${product}`,85,566,1110,47,30,C.ink,true,'center');
   b.show(status);if(old)b.hide(old,2);old=status;
   for(const s of carryShapes)b.hide(s,2);carryShapes=[];
   const at=i+pad-row;
   if(i===0&&product>=10){
    b.show(b.text(Math.floor(product/10),x(at-1),y,64,65,43,C.green,true,'center'),3);
    b.show(b.text(product%10,x(at),y,64,65,43,C.green,true,'center'),2);
   }else b.show(b.text(part,x(at),y,64,65,43,C.green,true,'center'),3);
   if(next&&i>0){const t=b.text(next,x(i+pad),190,64,40,25,C.amber,true,'center');b.show(t,2);b.move(t,-dx,0,3);carryShapes.push(t);}
   carry=next;
  }
 });
 if(bs.length>1){
  const first=p.a*(p.b%10),second=p.a*Math.floor(p.b/10)*10;
  b.result(`Now add the partial products: ${fmt(first)} + ${fmt(second)}.`,612);
  renderers.column(b,{a:first,b:second,op:'+'},r);
 }else b.result(`${fmt(p.a)} × ${p.b} = ${fmt(p.a*p.b)}`,612);
 // Decimal places are indicated by the original expression and final exact result.
};
renderers.divide=(b,p,r)=>{
 const places=p.remainder?0:Math.max((String(p.a).split('.')[1]??'').length,Number.isInteger(p.a/p.b)?0:3),str=p.a.toFixed(places),clean=str.replace('.',''),dot=str.indexOf('.');
 const digits=clean.split('').map(Number);let rem=0,qs=[],steps=[];
 digits.forEach((d,i)=>{let value=rem*10+d,q=Math.floor(value/p.b);rem=value%p.b;qs.push(q);steps.push({value,q,rem,d,i});});
 b.slide(r,`Calculate ${fmt(p.a)} ÷ ${p.b}.`,'Work left to right. Divide, multiply back, subtract, then bring down the next digit. Digits move into the next partial dividend. Leading zero quotient digits are omitted unless needed for a decimal.');
 const dx=Math.min(75,750/digits.length),start=320;
 b.text(p.b,150,337,120,70,46,C.blue,true,'center');b.lineTo(285,322,285,425);b.line(285,322,810);
 digits.forEach((d,i)=>b.text(d,start+i*dx,339,70,65,44,C.blue,true,'center'));
 if(dot>=0){b.dot(start+dot*dx-5,382,C.ink,7);b.dot(start+dot*dx-5,285,C.ink,7);}
 let started=false,old=[];
 for(const st of steps){
  if(!started&&st.q===0&&st.i<(dot<0?digits.length-1:dot-1))continue;started=true;
  const q=b.text(st.q,start+st.i*dx,240,70,65,43,C.green,true,'center');b.show(q);for(const t of old)b.hide(t,2);
  const a=b.text(`${p.b} fits into ${st.value}: ${st.q} times`,100,458,550,54,31,C.ink,true);
  const z=b.text(`${st.value} − ${st.q*p.b} = ${st.rem}`,650,458,530,54,31,C.ink,true);b.group([a,z],2);old=[a,z];
  if(st.i<digits.length-1){const t=b.text(digits[st.i+1],start+(st.i+1)*dx,339,70,65,44,C.amber,true,'center');b.show(t,2);b.move(t,850-(start+(st.i+1)*dx),195,3);old.push(t);}
 }
 const quotient=p.remainder?`${Math.floor(p.a/p.b)} remainder ${p.a%p.b}`:fmt(p.a/p.b);
 b.result(p.remainder?`${quotient}; ${Math.ceil(p.a/p.b)} groups are needed to fit everyone.`:`${fmt(p.a)} ÷ ${p.b} = ${quotient}`,607);
};

renderers.factors=(b,p,r)=>{
 const nums=[p.a,p.b,p.c].filter(Boolean),isPairs=p.mode==='pairs';
 b.slide(r,isPairs?`Find every factor pair of ${p.a}.`:`Find the ${p.mode==='hcf'?'highest common factor':'lowest common multiple'} of ${nums.join(' and ')}.`,'Reveal each row in turn. Identify values that occur in all rows.');
 if(isPairs){const pairs=factors(p.a).filter(n=>n<=Math.sqrt(p.a));pairs.forEach((n,i)=>{const y=245+i*52;b.group([b.text(n,240,y,180,44,30,C.blue,true,'center'),b.text('×',470,y,60,44,30),b.text(p.a/n,580,y,180,44,30,C.blue,true,'center'),b.text('= '+p.a,845,y,170,44,30,C.green,true)]);});}
 else{
  const common=p.mode==='hcf'?nums.reduce(gcd):nums.reduce(lcm);
  nums.forEach((n,i)=>{const vals=p.mode==='hcf'?factors(n):Array.from({length:Math.min(common/n,12)},(_,k)=>n*(k+1));const selected=vals.length>12?vals.filter(x=>x===common||x<=Math.sqrt(n)).slice(0,11).concat([n]):vals;
   b.text(n,60,253+i*115,100,60,33,C.blue,true);const w=1000/Math.max(selected.length,1);
   selected.forEach((v,j)=>{const t=b.text(v,170+j*w,253+i*115,w,60,Math.min(32,w*.49),C.ink,true,'center');b.show(t,j?2:1);if(v===common)b.show(b.line(180+j*w,316+i*115,w-20,C.amber,4));});
  });b.result(`${p.mode.toUpperCase()} = ${common}`);
 }
};
renderers.properties=(b,p,r)=>{
 b.slide(r,`Which are prime, square or cube numbers: ${p.prime}, ${p.square**2}, ${p.cube**3}?`,'Use arrays to show square and cube structure. For the prime, test prime divisors no greater than its square root.');
 const size=Math.min(19,250/p.square);for(let i=0;i<p.square;i++)for(let j=0;j<p.square;j++)b.show(b.rect(460+j*size,255+i*size,size,size,C.blue,C.white,1),i+j?2:1);
 b.show(b.text(`${p.square} × ${p.square} = ${p.square**2}`,440,530,330,60,29,C.green,true));
 for(let k=0;k<p.cube;k++)b.show(b.rect(875+k*13,420-k*26,190,35,C.pale,C.blue,2),k?2:1);
 b.show(b.text(`${p.cube}³ = ${p.cube**3}`,860,530,330,60,29,C.green,true));
 b.text(p.prime,100,245,240,90,60,C.blue,true,'center');[2,3,5,7].filter(n=>n<=Math.sqrt(p.prime)).forEach((n,i)=>b.show(b.text(`${p.prime} ÷ ${n}: remainder ${p.prime%n}`,65,337+i*40,355,38,23,C.ink,true,'center')));b.show(b.text('Only factors: 1 and '+p.prime,65,498,360,38,23,C.ink,true,'center'));b.show(b.text('prime',100,530,240,60,30,C.green,true,'center'));
};

function chain(b,r,q,steps,notes=''){
 b.slide(r,q,notes||'Identify the operation represented by each part. Reveal one calculation at a time, then follow the result into the next step.');
 steps.forEach(([expr,result],i)=>{
  const y=228+i*(340/Math.max(steps.length,3));b.show(b.text(expr,85,y,720,67,34,C.ink,true));
  const t=b.text(fmt(result),785,y,320,67,40,C.green,true,'center');b.show(t,3);b.move(t,45,0,3);
 });
}
renderers.expression=(b,p,r)=>chain(b,r,`Calculate ${p.a} ${p.op} ${p.b} × ${p.c}.`,[[`${p.b} × ${p.c} =`,p.b*p.c],[`${p.a} ${p.op} ${p.b*p.c} =`,p.op==='+'?p.a+p.b*p.c:p.a-p.b*p.c]],'Multiply before adding or subtracting. The multiplication result replaces the product in the expression.');
renderers.brackets=(b,p,r)=>chain(b,r,`Calculate ${p.a} ÷ (${p.b} + ${p.c}).`,[[`${p.b} + ${p.c} =`,p.b+p.c],[`${p.a} ÷ ${p.b+p.c} =`,p.a/(p.b+p.c)]]);
renderers.distribute=(b,p,r)=>chain(b,r,`Calculate ${p.a} × (${p.b} + ${p.c}) in two ways.`,[[`${p.a} × ${p.b} =`,p.a*p.b],[`${p.a} × ${p.c} =`,p.a*p.c],[`${p.a*p.b} + ${p.a*p.c} =`,p.a*(p.b+p.c)]]);
renderers.compensate=(b,p,r)=>chain(b,r,`Calculate ${fmt(p.a)} + ${fmt(p.b)} efficiently.`,[[`${fmt(p.near)} + ${fmt(p.b)} =`,p.near+p.b],[`${fmt(p.near+p.b)} − ${p.near-p.a} =`,p.a+p.b]]);
renderers.estimate=(b,p,r)=>{const a=Math.round(p.a/p.unit)*p.unit,unit2=p.secondUnit??p.unit,z=Math.round(p.b/unit2)*unit2;chain(b,r,`Estimate ${fmt(p.a)} ${p.op??'+'} ${fmt(p.b)} by rounding.`,[[`${fmt(p.a)} rounds to`,a],[`${fmt(p.b)} rounds to`,z],[`${fmt(a)} ${p.op??'+'} ${fmt(z)} ≈`,p.op==='×'?a*z:a+z]]);};
renderers.multistep=(b,p,r)=>{const first=p.op==='remaining'?p.a+p.b:p.a*p.b;const ans=p.op==='remaining'||p.op==='budget'?p.c-first:p.op==='÷'?first/p.c:p.op==='+'?first+p.c:first-p.c;const expr=p.op==='remaining'?`${fmt(p.c)} − (${fmt(p.a)} + ${fmt(p.b)})`:p.op==='budget'?`${fmt(p.c)} − ${fmt(p.a)} × ${fmt(p.b)}`:`${fmt(p.a)} × ${fmt(p.b)} ${p.op} ${fmt(p.c)}`;chain(b,r,`Calculate ${expr}.`,[[`${fmt(p.a)} ${p.op==='remaining'?'+':'×'} ${fmt(p.b)} =`,first],[p.op==='budget'||p.op==='remaining'?`${fmt(p.c)} − ${fmt(first)} =`:`${fmt(first)} ${p.op} ${fmt(p.c)} =`,ans]]);};
renderers.mixed=(b,p,r)=>chain(b,r,`Calculate ${p.a} ÷ ${p.b} + ${p.c} × ${p.d}.`,[[`${p.a} ÷ ${p.b} =`,p.a/p.b],[`${p.c} × ${p.d} =`,p.c*p.d],[`${p.a/p.b} + ${fmt(p.c*p.d)} =`,p.a/p.b+p.c*p.d]]);
renderers.scaleDivision=(b,p,r)=>chain(b,r,`If ${p.a} ÷ ${p.b} = ${p.a/p.b}, find ${p.a} ÷ ${p.b*p.scale}.`,[[`${p.b} × ${p.scale} =`,p.b*p.scale],[`${p.a/p.b} ÷ ${p.scale} =`,p.a/(p.b*p.scale)]]);
renderers.twoProducts=(b,p,r)=>chain(b,r,`Find ${p.a} × ${p.b} − ${p.c} × ${p.d}.`,[[`${p.a} × ${p.b} =`,p.a*p.b],[`${p.c} × ${p.d} =`,p.c*p.d],[`${p.a*p.b} − ${p.c*p.d} =`,p.a*p.b-p.c*p.d]]);

function fractionBoard(b,p,r,mult=false){
 const k=mult?p.k:gcd(p.a,p.b),n=mult?p.a*k:p.a/k,d=mult?p.b*k:p.b/k;
 b.slide(r,mult?`Write ${p.a}/${p.b} with denominator ${d}.`:`Simplify ${p.a}/${p.b}.`,'Apply the same operation to numerator and denominator. The divisor or multiplier moves into each row, then each result moves into the new fraction.');
 b.fraction(p.a,p.b,160,300,150,55);
 b.line(310,372,300,C.blue,3);b.text('=',720,334,85,80,57);b.line(910,372,140,C.green,3);
 b.text(k,550,220,100,62,43,C.amber,true,'center');b.text(mult?'multiplier':'common factor',675,230,350,46,25,C.amber);
 for(const [value,y,dy] of [[n,300,82],[d,380,162]]){
  const op=b.text(mult?'×':'÷',365,y,70,70,48,C.amber,true,'center');b.show(op);
  const f=b.text(k,550,220,100,62,43,C.amber,true,'center');b.show(f,2);b.move(f,-50,dy,3);
  const t=b.text(value,650,y,130,70,55,C.green,true,'center');b.show(t);b.move(t,265,0,3);
 }
 b.result(mult?'The same value, renamed with more equal parts.':`${n} and ${d} share no common factor greater than 1.`);
 b.check(p.a/p.b,n/d,'equivalent fraction');
}
renderers.simplify=(b,p,r)=>{
 // The smaller starter model makes the regrouping concrete before formal HCF work.
 const g=gcd(p.a,p.b),nn=p.a/g,dd=p.b/g;
 b.slide(r,`Group the pieces: ${nn*2}/${dd*2} = ?`,'Move each pair together. All pieces keep their size and colour. Count shaded groups and total groups.');
 const cells=b.strip(nn*2,dd*2,130,265,Math.min(920,dd*180),65);const w=Math.min(920,dd*180)/(dd*2);
 for(let i=0;i<dd;i++){b.move(cells[i*2],i*8,175);b.move(cells[i*2+1],i*8,175,2);b.show(b.text(i+1,130+i*(w*2+8),520,w*2,40,24,C.grey,true,'center'),3);}
 b.result(`${nn*2}/${dd*2} = ${nn}/${dd}`,600);
 fractionBoard(b,p,r);
};
renderers.equivalent=(b,p,r)=>fractionBoard(b,p,r,true);
renderers.fraction=(b,p,r)=>{
 const q=`Calculate ${answerFraction(p.a,p.b)} ${p.op} ${answerFraction(p.c,p.d)}.`;
 if(p.a>p.b||p.c>p.d){
  b.slide(r,q,'Convert each mixed number into equal fractional parts before calculating.');
  [[p.a,p.b],[p.c,p.d]].forEach(([n,d],i)=>{const y=245+i*175;b.text(answerFraction(n,d),85,y,220,70,40,C.blue,true);b.show(b.text(`${Math.floor(n/d)} × ${d} + ${n%d} = ${n}`,350,y,730,65,34,C.ink,true));b.group(b.fraction(n,d,1080,y-25,100,36),3);});
 }
 if(p.cancel){
  b.slide(r,q,'Cancel common factors across a numerator and the other denominator before multiplying.');
  const g=gcd(p.a,p.d),h=gcd(p.c,p.b);
  b.fraction(p.a,p.b,140,255,120,50);b.text('×',360,290,70,70,45);b.fraction(p.c,p.d,480,255,120,50);
  b.show(b.text(`${p.a} and ${p.d}: divide both by ${g}.`,680,250,480,80,28,C.amber,true));
  b.show(b.text(`${p.c} and ${p.b}: divide both by ${h}.`,680,355,480,80,28,C.amber,true));
  const left=b.fraction(p.a/g,p.b/h,140,255,120,40,C.green),right=b.fraction(p.c/h,p.d/g,480,255,120,40,C.green);
  b.group(left);left.forEach(t=>b.move(t,0,235,2));b.group(right);right.forEach(t=>b.move(t,0,235,2));
  p={...p,a:p.a/g,b:p.b/h,c:p.c/h,d:p.d/g};
 }
 b.slide(r,q,'Use equal-sized parts for addition or subtraction. For multiplication, partition in both directions. For division by a whole number, split each part into that many equal pieces.');
 b.fraction(p.a,p.b,90,250,115,52);b.text(p.op,260,294,65,65,48);b.fraction(p.c,p.d,365,250,115,52);
 let a,d,explain;
 if(p.op==='+'||p.op==='−'){
  d=lcm(p.b,p.d);const aa=p.a*d/p.b,cc=p.c*d/p.d;a=p.op==='+'?aa+cc:aa-cc;
  b.group(b.fraction(aa,d,645,250,115,52));b.show(b.text(p.op,804,294,65,65,48),2);b.group(b.fraction(cc,d,930,250,115,52),2);
  const strips=Math.ceil(Math.max(aa,cc)/d);const cellW=Math.min(960/(strips*d),80);const total=Math.max(d,Math.ceil(Math.max(aa,cc)/d)*d);
  b.group(b.strip(aa,total,125,446,cellW*total,37));b.group(b.strip(cc,total,125,503,cellW*total,37));for(let j=0;j<total/d;j++){b.show(b.rect(125+j*d*cellW,446,d*cellW,37,'none',C.ink,2.5),2);b.show(b.rect(125+j*d*cellW,503,d*cellW,37,'none',C.ink,2.5),2);}
  explain=`${aa} ${p.op} ${cc} = ${a}; the denominator stays ${d}.`;
 }else if(p.op==='×'){
  a=p.a*p.c;d=p.b*p.d;const cols=Math.ceil(p.a/p.b)*p.b,rows=Math.ceil(p.c/p.d)*p.d,cell=Math.min(36,250/Math.max(cols,rows));
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)b.show(b.rect(775+j*cell,241+i*cell,cell,cell,j<p.a&&i<p.c?C.green:j<p.a||i<p.c?C.pale:C.white,C.ink,1),i+j?2:1);
  explain=`${p.a} × ${p.c} = ${a};  ${p.b} × ${p.d} = ${d}.`;
 }else{
  a=p.a*p.d;d=p.b*p.c;const total=Math.max(p.b,p.a);const cells=b.strip(p.a,total,630,280,500,65);
  for(let i=1;i<total*p.c;i++)if(i%p.c)b.show(b.lineTo(630+i*500/(total*p.c),280,630+i*500/(total*p.c),345,C.amber,2),i===1?1:2);
  explain=`Each ${p.b===1?'whole':`1/${p.b}`} is split into ${p.c} equal pieces.`;
 }
 b.show(b.text(explain,80,555,1120,45,27,C.ink,true,'center'));b.result(`Answer: ${answerFraction(a,d)}`,610);
};
renderers.fractionCompare=(b,p,r)=>{
 const vs=p.values,D=vs.map(x=>x[1]).reduce(lcm),display=([a,d],i)=>p.fdp?(i===0?fmt(a/d):i===2?fmt(100*a/d)+'%':frac(a,d)):frac(a,d);b.slide(r,`Order ${vs.map(display).join(', ')} from smallest to greatest.`,'Show all bars using the same whole and equal subdivisions. Compare lengths.');
 const max=Math.max(...vs.map(([a,d])=>Math.ceil(a/d))),w=880/max;
 vs.forEach(([a,d],i)=>{const y=240+i*100;b.text(display([a,d],i),70,y,160,60,36,C.blue,true);b.group(b.strip(a*D/d,D*max,250,y,w*max,46));b.show(b.text(`${a*D/d}/${D}`,1030,y+47,160,40,24,C.amber,true),2);});
 b.result(vs.map((v,i)=>({v,label:display(v,i)})).sort((x,y)=>x.v[0]/x.v[1]-y.v[0]/y.v[1]).map(x=>x.label).join(' < '));
};
renderers.between=(b,p,r)=>{const D=lcm(p.b,p.d)*2,a=p.a*D/p.b,c=p.c*D/p.d,n=Math.floor((a+c)/2);b.slide(r,`Find a fraction between ${p.a}/${p.b} and ${p.c}/${p.d}.`,'Rename with equal-sized parts. A midpoint always gives an intermediate value.');b.line(180,365,900);[p.a/p.b,n/D,p.c/p.d].forEach((v,i)=>{const x=180+i*450;b.lineTo(x,345,x,389);const t=b.text(i===0?frac(p.a,p.b):i===2?frac(p.c,p.d):frac(n,D),x-120,408,240,62,38,i===1?C.green:C.blue,true,'center');if(i===1)b.show(t);});b.result(`${a}/${D} < ${n}/${D} < ${c}/${D}`);};
renderers.fractionOf=(b,p,r)=>{b.slide(r,`Find ${p.a}/${p.b} of ${p.total}.`,'Divide the whole into denominator groups. Select numerator groups.');const unit=p.total/p.b;b.strip(p.a,p.b,110,330,1000,90);for(let i=0;i<p.b;i++)b.show(b.text(fmt(unit),110+i*1000/p.b,347,1000/p.b,55,31,i<p.a?C.white:C.blue,true,'center'),i?2:1);b.result(`${p.total} ÷ ${p.b} × ${p.a} = ${fmt(unit*p.a)}`);};
renderers.fractionChain=(b,p,r)=>{renderers.fraction(b,{a:p.a,b:p.b,c:p.c,d:p.d,op:'−'},r);const D=lcm(p.b,p.d),a=p.a*D/p.b-p.c*D/p.d;renderers.fraction(b,{a,b:D,c:p.e,d:p.f,op:'+'},r);};
renderers.equivalence=(b,p,r)=>{const val=p.a/p.b; b.slide(r,`Write ${p.a}/${p.b} as a decimal and percentage.`,'Use a hundred-square or equivalent fraction out of 100. One whole is 100%.');const filled=val*100;for(let i=0;i<100;i++){const s=b.rect(100+(i%10)*28,240+Math.floor(i/10)*28,28,28,i<Math.floor(filled)?C.blue:C.white,C.line,1);if(i<Math.floor(filled))b.show(s,i?2:1);} if(filled%1)b.show(b.rect(100+(Math.floor(filled)%10)*28,240+Math.floor(filled/10)*28,28*(filled%1),28,C.blue,C.line,1)); b.group(b.fraction(p.a*100/p.b,100,530,275,130,54));b.show(b.text('=',715,320,60,60,48),2);const decimal=b.text(fmt(val),840,245,300,80,54,C.green,true);b.show(decimal);b.move(decimal,0,35,3);b.show(b.text(fmt(val*100)+'%',840,440,300,80,54,C.green,true));b.result(`${p.a}/${p.b} = ${fmt(val)} = ${fmt(val*100)}%`);};

renderers.percentage=(b,p,r)=>{
 const part=p.total*p.percent/100;b.slide(r,p.reverse?`${fmt(part)} is ${p.percent}% of a number. Find the whole.`:p.increase?`Increase ${fmt(p.total)} by ${p.percent}%.`:p.discount?`Reduce ${fmt(p.total)} by ${p.percent}%.`:`Find ${p.percent}% of ${fmt(p.total)}.`,'The complete bar represents 100%. Find 1%, then build the required percentage. For a reduction, subtract the discount from the original whole.');
 b.rect(130,285,1000,75,C.white,C.blue,2);const fill=b.rect(130,285,10*p.percent,75,C.blue);b.show(fill);b.text('100%',1000,372,160,50,30,C.grey,true);b.show(b.text(p.percent+'%',130,372,300,50,30,C.blue,true),2);
 b.show(b.text(p.reverse?`${fmt(part)} ÷ ${p.percent} = ${fmt(p.total/100)} (1%)`:`${fmt(p.total)} ÷ 100 = ${fmt(p.total/100)} (1%)`,120,449,1070,60,32,C.ink,true));
 b.result(p.reverse?`${fmt(p.total/100)} × 100 = ${fmt(p.total)}`:p.increase?`${fmt(p.total)} + ${fmt(part)} = ${fmt(p.total+part)}`:p.discount?`${fmt(p.total)} − ${fmt(part)} = ${fmt(p.total-part)}`:`${fmt(p.total/100)} × ${p.percent} = ${fmt(part)}`);
};
renderers.ratio=(b,p,r)=>{
 let a=p.a,z=p.b,g=gcd(a,z),u=a/g,v=z/g;const q=p.mode==='share'?`Share ${p.total} in the ratio ${a}:${z}.`:p.mode==='scale'?`${a}:${z} = ${a*p.k}:?`:p.mode==='show'?`What does the ratio ${a}:${z} mean?`:`Simplify the ratio ${a}:${z}.`;
 b.slide(r,q,'Use equal-sized ratio units. Keep the same scale factor for both quantities.');
 const width=800/Math.max(u,v);for(let i=0;i<u;i++)b.show(b.rect(240+i*width,265,width,75,C.blue,C.white,2),i?2:1);for(let i=0;i<v;i++)b.show(b.rect(240+i*width,380,width,75,C.pale,C.blue,2),i?2:1);
 b.text('first',65,270,160,55,28,C.blue,true);b.text('second',65,384,160,55,28,C.blue,true);
 if(p.mode==='share'){const unit=p.total/(a+z);b.show(b.text(`${a} + ${z} = ${a+z} parts; ${p.total} ÷ ${a+z} = ${fmt(unit)}`,95,487,1100,60,31,C.ink,true));b.result(`${a} parts = ${fmt(a*unit)}; ${z} parts = ${fmt(z*unit)}`);}
 else if(p.mode==='scale')b.result(`${a} × ${p.k} : ${z} × ${p.k} = ${a*p.k}:${z*p.k}`);
 else b.result(p.mode==='show'?`For every ${a} of the first, there are ${z} of the second.`:`${a} ÷ ${g} : ${z} ÷ ${g} = ${u}:${v}`);
};
renderers.proportion=(b,p,r)=>{b.slide(r,`If ${p.a} corresponds to ${fmt(p.b)} ${p.unit}, what corresponds to ${p.target}?`,'Find the value for one first, then scale to the target.');const ys=[255,370,485];[[p.a,p.b],[1,p.b/p.a],[p.target,p.b/p.a*p.target]].forEach(([a,z],i)=>{const ss=[b.text(fmt(a),195,ys[i],230,70,47,C.blue,true,'center'),b.text('↔',535,ys[i],100,70,42),b.text(fmt(z)+' '+p.unit,735,ys[i],410,70,43,C.green,true)];if(i)b.group(ss);});b.result(`÷ ${p.a}, then × ${p.target}`);};
renderers.percentageChain=(b,p,r)=>{renderers.percentage(b,{total:p.total,percent:p.up,increase:true},r);const increased=p.total*(1+p.up/100);renderers.percentage(b,{total:increased,percent:p.down,discount:true},r);};
renderers.fractionPercent=(b,p,r)=>{chain(b,r,`${p.a}/${p.b} of a number is ${p.part}. Find ${p.percent}% of the number.`,[[`${p.part} ÷ ${p.a} =`,p.part/p.a],[`${fmt(p.part/p.a)} × ${p.b} =`,p.part/p.a*p.b],[`${fmt(p.part/p.a*p.b)} × ${p.percent}/100 =`,p.part/p.a*p.b*p.percent/100]]);};

renderers.sequence=(b,p,r)=>{b.slide(r,`Continue the sequence: ${p.start}, ${p.start+p.step}, ${p.start+2*p.step}, …`,'Follow the constant difference. Move a copy of the step between successive terms.');for(let i=0;i<6;i++){const x=80+i*198,t=b.text(p.start+i*p.step,x,330,165,85,49,C.blue,true,'center');if(i>=3)b.show(t);if(i<5)b.show(b.text((p.step>0?'+':'')+p.step,x+116,260,155,55,28,C.amber,true,'center'),i<3?1:2);}b.result(`The rule is ${p.step>0?'add':'subtract'} ${Math.abs(p.step)} each time.`);};
renderers.formula=(b,p,r)=>{b.slide(r,`Use the rule ${p.a}n ${p.b<0?'−':'+'} ${Math.abs(p.b)}. Find the first five values.`,'Move each input into the rule, calculate, then reveal the output.');for(let i=1;i<=5;i++){const x=80+(i-1)*240;b.text('n = '+i,x,235,210,60,30,C.grey,true,'center');const t=b.text(i,x,305,210,65,46,C.blue,true,'center');b.move(t,0,75);b.show(b.text(`${p.a} × ${i} ${p.b<0?'−':'+'} ${Math.abs(p.b)}`,x,455,210,55,28,C.ink,true,'center'),3);b.show(b.text(p.a*i+p.b,x,540,210,70,48,C.green,true,'center'),3);}};
renderers.substitute=(b,p,r)=>chain(b,r,`Find ${p.a}b + ${p.c}c when b = ${p.b} and c = ${p.d}.`,[[`${p.a} × ${p.b} =`,p.a*p.b],[`${p.c} × ${p.d} =`,p.c*p.d],[`${p.a*p.b} + ${p.c*p.d} =`,p.a*p.b+p.c*p.d]]);
renderers.equation=(b,p,r)=>{
 const x=(p.total-p.b)/p.a;b.slide(r,`Solve ${p.a===1?'':p.a}x ${p.b<0?'−':'+'} ${Math.abs(p.b)} = ${p.total}.`,'Keep both sides equal. Undo addition or subtraction on both sides, then divide both sides by the coefficient.');
 const w=600/Math.max(p.a,1);for(let i=0;i<p.a;i++){b.rect(110+i*w,260,w,90,C.pale,C.blue,2);b.text('x',110+i*w,267,w,70,44,C.blue,true,'center');}
 b.text(`${p.b<0?'−':'+'} ${Math.abs(p.b)}`,745,265,175,75,42,C.amber,true);b.text('= '+p.total,970,265,240,75,43,C.ink,true);
 b.show(b.text(`${p.b>0?'Subtract':'Add'} ${Math.abs(p.b)} on both sides`,170,390,940,60,31,C.amber,true,'center'));
 b.show(b.text(`${p.a}x = ${fmt(p.total-p.b)}`,200,475,880,65,45,C.blue,true,'center'));
 const ans=b.text(`x = ${fmt(x)}`,670,560,360,65,49,C.green,true,'center');b.show(ans);b.move(ans,-160,0,3);b.check(p.a*x+p.b,p.total,'equation balance');
};
renderers.convert=(b,p,r)=>{
 b.slide(r,`Convert ${fmt(p.a)} ${p.from} to ${p.to}.`,'Each digit moves three place-value columns. The decimal point stays fixed.');
 const shift=Math.round(Math.log10(p.k)),places=[10000,1000,100,10,1,.1,.01,.001],x=75,w=141;
 places.forEach((v,i)=>{b.rect(x+i*w,320,w,130,C.pale,C.line,1);b.text(String(v),x+i*w,257,w,55,23,C.grey,true,'center');});
 const [whole,decimal='']=String(p.a).split('.');const digits=[...whole,...decimal];
 digits.forEach((d,i)=>{const exponent=whole.length-i-1,col=4-exponent;const t=b.text(d,x+col*w,347,w,70,48,C.blue,true,'center');b.move(t,-shift*w,0,i?2:1);});
 b.dot(x+5*w-5,405,C.ink,9);b.text('fixed decimal point',x+4*w,459,300,45,22,C.grey);
 b.show(b.text(`${p.k>1?'×':'÷'} ${p.k>1?p.k:1/p.k}: each digit moves ${Math.abs(shift)} places ${shift>0?'left':'right'}.`,80,527,1120,60,29,C.amber,true));
 b.result(`${fmt(p.a)} ${p.from} = ${fmt(p.a*p.k)} ${p.to}`,600);
};
renderers.measurePieces=(b,p,r)=>chain(b,r,`Cut a ${p.length} m length into ${p.piece} cm pieces. How many whole pieces fit?`,[[`${p.length} × 100 =`,p.length*100],[`${p.length*100} ÷ ${p.piece} =`,p.length*100/p.piece],[`Complete pieces =`,Math.floor(p.length*100/p.piece)]]);

renderers.area=(b,p,r)=>{
 const triangle=p.shape==='triangle',area=p.a*p.b*(triangle?.5:1)+(p.shape==='compound'?p.a*p.c/2:0);
 const q=p.missing?`A triangle has area ${area} cm² and base ${p.a} cm. Find its height.`:`Find the ${p.shape==='rectangle'?'area and perimeter':'area'}: base ${p.a} cm, perpendicular height ${p.b} cm${p.c?`, plus a triangle of height ${p.c} cm`:''}.`;
 b.slide(r,q,'Show the perpendicular height. Rearrange the parallelogram into a rectangle or use two equal triangles to make the base-times-height area.');
 if(triangle)b.poly([[130,500],[650,500],[340,260]]);else if(p.shape==='parallelogram'){b.poly([[250,500],[610,500],[730,280],[250,280]]);const cut=b.poly([[130,500],[250,500],[250,280]],'#93C5FD');b.move(cut,480,0);}else b.rect(130,280,520,220,C.pale,C.blue,3);
 if(p.shape==='compound')b.poly([[130,280],[650,280],[390,205]],'#93C5FD');
 b.text(p.a+' cm',190,517,370,55,30,C.blue,true,'center');b.text(p.missing?'? cm':p.b+' cm',355,357,180,70,30,C.blue,true);b.lineTo(340,triangle?260:280,340,500,C.amber,2);
 const expr=p.missing?`${area} × 2 ÷ ${p.a} = ${p.b} cm`:triangle?`${p.a} × ${p.b} ÷ 2 = ${area} cm²`:p.shape==='compound'?`${p.a*p.b} + ${p.a*p.c/2} = ${area} cm²`:`${p.a} × ${p.b} = ${area} cm²`;
 b.show(b.text(expr,815,310,370,180,31,C.green,true,'center'));
 if(p.shape==='rectangle')b.result(`Perimeter = 2 × (${p.a} + ${p.b}) = ${2*(p.a+p.b)} cm`);else b.result(p.missing?'Area × 2 ÷ base = perpendicular height.':'Count square units, not the length around the edge.');
};
renderers.volume=(b,p,r)=>{
 const vol=p.a*p.b*p.c;
 b.slide(r,p.missing?`Volume ${vol} cm³, length ${p.a} cm, width ${p.b} cm. Find the height.`:p.filled?`A ${p.a} × ${p.b} × ${p.c} cm cuboid is 1/${p.filled} full. Find the empty volume.`:p.small?`How many ${p.small} cm cubes fit into ${p.a} × ${p.b} × ${p.c} cm?`:`Find the volume of a ${p.a} × ${p.b} × ${p.c} cm cuboid.`,'Build the volume in equal layers. Multiply base area by the number of layers.');
 for(let k=0;k<Math.min(p.c,10);k++){const layer=b.poly([[140,480-k*17],[500,480-k*17],[620,405-k*17],[260,405-k*17]],k%2?C.pale:'#93C5FD');b.show(layer,k?2:1);}
 b.text(p.a+' cm',175,522,240,55,29,C.blue,true);b.text(p.b+' cm',520,475,180,55,29,C.blue,true);
 b.show(b.text(`${p.a} × ${p.b} = ${p.a*p.b} cm² per layer`,745,273,460,120,31,C.ink,true));
 b.show(b.text(p.missing?`${vol} ÷ ${p.a*p.b} = ${p.c} cm`:`${p.a*p.b} × ${p.c} = ${vol} cm³`,745,435,460,110,34,C.green,true));
 if(p.small)b.result(`${vol} ÷ ${p.small**3} = ${vol/p.small**3} cubes`);
 else if(p.filled)b.result(`${vol} × ${p.filled-1}/${p.filled} = ${vol*(p.filled-1)/p.filled} cm³ empty`);
 else if(p.compare)b.result(`Other cuboid: ${p.compare.join(' × ')} = ${p.compare.reduce((a,z)=>a*z)} cm³`);
};
renderers.angles=(b,p,r)=>{
 const sum=p.angles.reduce((a,z)=>a+z,0),ans=p.shape==='opposite'?p.angles[0]:p.total-sum;
 b.slide(r,p.shape==='opposite'?`Two straight lines cross. One angle is ${p.angles[0]}°. Find the opposite angle.`:`Known angles: ${p.angles.map(x=>x+'°').join(', ')}. Find the missing angle ${p.shape==='triangle'?'in the triangle':p.shape==='quad'?'in the quadrilateral':'around the point'}.`,'Identify the angle fact before calculating. Each highlighted part contributes to the total.');
 b.text('Diagram not to scale',130,595,550,42,21,C.grey,false,'center');
 if(p.shape==='triangle'){
  b.poly([[140,500],[650,500],[340,270]],C.white);
  p.angles.forEach((v,i)=>b.text(v+'°',i?470:180,421,135,55,29,C.blue,true));b.text('?',285,305,100,70,45,C.green,true);
 }else if(p.shape==='quad'){
  b.poly([[130,475],[610,475],[680,270],[240,235]],C.white);
  [[190,385],[460,385],[515,285]].forEach(([x,y],i)=>b.text(p.angles[i]+'°',x,y,125,60,29,C.blue,true));b.text('?',255,265,100,70,45,C.green,true);
 }else{
  const cx=400,cy=405,rr=175;
  if(p.shape==='point'){
   let degrees=-90;
   [...p.angles,ans].forEach((v,i)=>{const rad=degrees*Math.PI/180;b.lineTo(cx,cy,cx+rr*Math.cos(rad),cy+rr*Math.sin(rad));const mid=(degrees+v/2)*Math.PI/180;b.text(i<p.angles.length?v+'°':'?',cx+100*Math.cos(mid)-55,cy+100*Math.sin(mid)-28,110,56,30,i<p.angles.length?C.blue:C.green,true,'center');degrees+=v;});
  }else{
   b.lineTo(170,405,630,405);b.lineTo(230,545,570,265);b.text(p.angles[0]+'°',435,335,135,55,31,C.blue,true);b.text('?',265,420,100,60,45,C.green,true);
  }
 }
 b.show(b.text(p.shape==='opposite'?'Vertically opposite angles are equal.':`Total = ${p.total}°`,760,270,425,110,32,C.ink,true));
 b.show(b.text(p.shape==='opposite'?`${ans}°`:`${p.total} − ${sum} = ${ans}°`,750,441,450,100,37,C.green,true));
};
renderers.circle=(b,p,r)=>{b.slide(r,`The radius is ${p.radius} cm. Find the diameter.`,'Two radii lie along one diameter through the centre.');b.rect(160,220,390,390,C.pale,C.blue,3,'ellipse');const rad=b.line(355,415,195,C.amber,5);const copy=b.line(355,415,195,C.amber,5);b.move(copy,-195,0);b.dot(347,407,C.ink,16);b.text(p.radius+' cm',368,340,175,65,30,C.blue,true);b.show(b.text(p.radius+' cm',170,440,180,60,30,C.blue,true),3);b.show(b.text(`2 × ${p.radius} = ${p.radius*2} cm`,700,340,495,120,45,C.green,true));};
renderers.coordinate=(b,p,r)=>{
 let tx=p.mode==='reflect'?-p.x:p.x+(p.dx??0),ty=p.y+(p.dy??0);
 const q=p.mode==='plot'?`Plot (${p.x}, ${p.y}).`:p.mode==='reflect'?`Reflect (${p.x}, ${p.y}) in the y-axis.`:p.mode==='reverse'?`After moving ${p.dx} right and ${-p.dy} down, a point is (${tx}, ${ty}). Find its start.`:`Move (${p.x}, ${p.y}) ${Math.abs(p.dx)} ${p.dx<0?'left':'right'} and ${Math.abs(p.dy)} ${p.dy<0?'down':'up'}.`;
 b.slide(r,q,'Read horizontal movement first, then vertical. Reflections keep the distance to the mirror line equal.');const ox=425,oy=425,s=26;
 for(let i=-8;i<=8;i++){b.lineTo(ox-8*s,oy+i*s,ox+8*s,oy+i*s,C.line,1);b.lineTo(ox+i*s,oy-8*s,ox+i*s,oy+8*s,C.line,1);if(i%2===0){b.text(i,ox+i*s-18,oy+6,36,30,17,C.grey,false,'center');if(i)b.text(-i,ox-42,oy+i*s-16,35,30,17,C.grey);}}
 b.lineTo(ox-8*s,oy,ox+8*s,oy,C.ink,2);b.lineTo(ox,oy-8*s,ox,oy+8*s,C.ink,2);
 const reverse=p.mode==='reverse';const dot=b.dot(ox-9+(reverse?tx*s:0),oy-9-(reverse?ty*s:0),C.blue,18);
 if(reverse){b.move(dot,(p.x-tx)*s,0);b.move(dot,0,-(p.y-ty)*s);}
 else {b.move(dot,p.x*s,0);b.move(dot,0,-p.y*s);if(p.mode!=='plot'){b.move(dot,(tx-p.x)*s,0);b.move(dot,0,-(ty-p.y)*s);}}
 b.show(b.text(p.mode==='reverse'?`Start: (${p.x}, ${p.y})`:`(${tx}, ${ty})`,820,340,365,130,44,C.green,true));
};
renderers.mean=(b,p,r)=>{const total=p.values.reduce((a,z)=>a+z,0),mean=total/p.values.length;b.slide(r,`Find the mean of ${p.values.join(', ')}.`,'Combine the total, then share it equally among the original number of values. The level line shows the equal share.');const max=Math.max(...p.values),sx=870/p.values.length;for(let i=0;i<p.values.length;i++){const h=p.values[i]/max*230;b.rect(155+i*sx,500-h,sx-24,h,C.blue);b.text(p.values[i],155+i*sx,514,sx-24,50,29,C.blue,true,'center');}b.show(b.line(140,500-mean/max*230,900,C.green,4));b.result(`${p.values.join(' + ')} = ${total}; ${total} ÷ ${p.values.length} = ${fmt(mean)}`);};
renderers.meanCompare=(b,p,r)=>chain(b,r,`Compare mean ${p.mean} with a dataset totalling ${p.total} across ${p.count2} values.`,[[`${p.total} ÷ ${p.count2} =`,p.total/p.count2],[`Difference between means =`,Math.abs(p.mean-p.total/p.count2)]]);
renderers.lineGraph=(b,p,r)=>{b.slide(r,`Values change from ${p.values[0]} to ${p.values.at(-1)}. Find the increase.`,'Read the scale and both endpoint values before subtracting.');const max=Math.ceil(Math.max(...p.values)/10)*10;for(let n=0;n<=max;n+=10){const y=560-n/max*310;b.line(180,y,840,C.line,1);b.text(n,100,y-20,65,40,22,C.grey);}p.values.forEach((v,i)=>{const x=190+i*265,y=560-v/max*310;const dot=b.dot(x-8,y-8,C.blue,16);b.show(dot,i?2:1);if(i)b.show(b.lineTo(x-265,560-p.values[i-1]/max*310,x,y,C.blue,3),2);b.show(b.text(v,x-60,y-60,120,45,26,C.blue,true,'center'),2);});b.result(`${p.values.at(-1)} − ${p.values[0]} = ${p.values.at(-1)-p.values[0]}`,612);};
renderers.pie=(b,p,r)=>{const proportion=p.part/p.total,angle=360*proportion;b.slide(r,p.reverse?`${p.part}° represents ${p.population*proportion} pupils. Find the total.`:p.population?`${p.part}/${p.total} of ${p.population} pupils walk. How many is that?`:`${p.part} out of ${p.total} pupils choose art. Find the pie-chart angle.`,'A complete circle represents the whole: 360 degrees or the total number of pupils.');b.rect(150,230,360,360,C.pale,C.blue,2,'ellipse');const points=[[330,410]];for(let i=0;i<=40;i++){const rad=(-90+angle*i/40)*Math.PI/180;points.push([330+180*Math.cos(rad),410+180*Math.sin(rad)]);}b.show(b.poly(points,C.blue));b.show(b.text(p.reverse?`${p.population*proportion} ÷ ${p.part} × 360`:p.population?`${p.population} × ${p.part}/${p.total}`:`360 × ${p.part}/${p.total}`,650,270,530,140,36,C.ink,true));b.show(b.text(p.reverse?`${p.population} pupils`:p.population?`${fmt(p.population*proportion)} pupils`:`${fmt(angle)}°`,690,460,460,110,46,C.green,true));};
renderers.createExpressions=(b,p,r)=>{b.slide(r,'Make two calculations using 3/4, 0.6 and 25% that give 30.','Many answers are possible. Reveal two examples and verify each operation.');b.show(b.text('(40 × 3/4) × (0.6 ÷ 0.6) × (25% ÷ 25%)',75,260,1140,110,33,C.blue,true,'center'));b.show(b.text('30 × 1 × 1 = 30',90,391,1110,70,41,C.green,true,'center'));b.show(b.text('(40 × 0.6) + (8 × 3/4) + (25% − 25%)',75,500,1140,85,33,C.blue,true,'center'));b.result('24 + 6 + 0 = 30',607);};

renderers.sort=(b,p,r)=>{b.slide(r,`Sort these objects by ${p.mode}.`,'State one rule. Move each object into its matching group. Check every object against the same rule.');b.rect(105,400,450,180,'none',C.blue,3);b.rect(725,400,450,180,'none',C.blue,3);b.text(p.mode==='colour'?'red':'circles',105,600,450,50,31,C.ink,true,'center');b.text(p.mode==='colour'?'blue':'squares',725,600,450,50,31,C.ink,true,'center');let leftCount=0,rightCount=0;for(let i=0;i<6;i++){const red=i%2===0,circle=i%3===0;const x=175+i*170,t=b.rect(x,250,70,70,red?C.red:C.blue,C.ink,2,circle?'ellipse':'rect');const left=p.mode==='colour'?red:circle;const dest=(left?140:760)+(left?leftCount++:rightCount++)*95;b.move(t,dest-x,200);} };
function frame(b){for(let i=0;i<10;i++)b.rect(190+(i%5)*165,420+Math.floor(i/5)*92,165,92,C.white,C.blue,2);}
renderers.count=(b,p,r)=>{b.slide(r,`How many objects are there?${p.frame?' Show the amount in the frame.':''}`,'Touch and move each object exactly once. The last number tells the total. Zero means the frame stays empty.');if(p.frame)frame(b);for(let i=0;i<p.n;i++){const x=95+i*110,y=245+(i%2)*35,t=b.dot(x,y,i<5?C.blue:C.green,48);b.move(t,(p.frame?240+(i%5)*165:130+i*104)-x,(p.frame?443+Math.floor(i/5)*92:453)-y);b.show(b.text(i+1,80+i*112,340,110,55,30,C.grey,true,'center'),3);}b.result(`${p.n} altogether`,612);};
renderers.match=(b,p,r)=>{b.slide(r,'Count the objects. Which numeral matches?','Move the matching numeral to the set after counting one object at a time.');for(let i=0;i<p.n;i++)b.dot(130+(i%5)*130,250+Math.floor(i/5)*85,C.blue,48);[p.n-1,p.n,p.n+1].forEach((n,i)=>{const t=b.text(n,800+i*120,250,110,85,58,C.blue,true,'center');if(n===p.n)b.move(t,-240,220);});b.result(`${p.n} objects match the numeral ${p.n}.`);};
renderers.sets=(b,p,r)=>{b.slide(r,'Which set has more, fewer, or the same number?','Pair one object from each set. Any unpaired objects show which set has more.');for(let i=0;i<p.a;i++)b.dot(150+i*132,255,C.red);for(let i=0;i<p.b;i++){const t=b.dot(150+i*132,440,C.blue);if(i<Math.min(p.a,p.b))b.move(t,0,-85);}b.result(p.a===p.b?`${p.a} = ${p.b}: the sets are equal.`:`${Math.max(p.a,p.b)} > ${Math.min(p.a,p.b)}: ${Math.abs(p.a-p.b)} more.`);};
renderers.track=(b,p,r)=>{b.slide(r,`Where does ${p.n} belong on the number track?`,'The numbers increase by one. Find the neighbours and move the missing numeral between them.');for(let i=0;i<=10;i++){b.rect(80+i*104,355,104,95,C.pale,C.blue,2);if(i!==p.n)b.text(i,80+i*104,365,104,70,38,C.blue,true,'center');}const t=b.text(p.n,520,230,104,70,46,C.green,true,'center');b.move(t,80+p.n*104-520,135);b.result(`${p.n-1}, ${p.n}, ${p.n+1}`);};
renderers.one=(b,p,r)=>{b.slide(r,`Find one ${p.op>0?'more':'less'} than ${p.n}.`,'Move one counter in or out of the frame. Count the new total and connect the action to the equation.');frame(b);for(let i=0;i<p.n;i++){const t=b.dot(240+(i%5)*165,443+Math.floor(i/5)*92,C.blue,42);if(p.op<0&&i===p.n-1)b.move(t,1040-(240+(i%5)*165),260-(443+Math.floor(i/5)*92));}if(p.op>0){const t=b.dot(1090,250,C.amber,42);b.move(t,240+(p.n%5)*165-1090,443+Math.floor(p.n/5)*92-250);}b.result(`${p.n} ${p.op>0?'+':'−'} 1 = ${p.n+p.op}`,610);};
