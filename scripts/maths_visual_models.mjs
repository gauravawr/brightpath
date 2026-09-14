// Explicit mathematical examples, indexed by the existing curriculum lesson.
// Each renderer computes its answers from these inputs; no text-only fallback.
const m=(kind,p)=>({kind,...p});
export const models={
 '1.1':m('place',{n:6407215,mode:'read'}), '1.2':m('place',{n:8364219,mode:'value',digit:3}),
 '1.3':m('compare',{values:[5906120,5960102]}), '1.4':m('numberLine',{a:-4,b:7}), '1.5':m('column',{a:3804215,b:398760,op:'−'}),
 '2.1':m('round',{n:468753,unit:1000}), '2.2':m('round',{n:6748219,unit:100000}), '2.3':m('round',{n:384650,unit:10000}),
 '2.4':m('estimate',{a:398742,b:203118,unit:100000}), '2.5':m('round',{n:85500,unit:1000,boundary:true}),
 '3.1':m('multiply',{a:3482,b:6}), '3.2':m('multiply',{a:47,b:36}), '3.3':m('multiply',{a:2304,b:27}), '3.4':m('multiply',{a:1248,b:24}), '3.5':m('multiply',{a:326,b:45}),
 '4.1':m('divide',{a:7392,b:24}), '4.2':m('divide',{a:3744,b:12}), '4.3':m('divide',{a:8736,b:24}), '4.4':m('divide',{a:6745,b:32,remainder:true}), '4.5':m('divide',{a:9360,b:36}),
 '5.1':m('factors',{a:72,mode:'pairs'}), '5.2':m('factors',{a:84,b:126,mode:'hcf'}), '5.3':m('factors',{a:18,b:24,mode:'lcm'}), '5.4':m('properties',{prime:97,square:12,cube:5}), '5.5':m('factors',{a:6,b:8,c:9,mode:'lcm'}),
 '6.1':m('expression',{a:48,b:6,c:5,op:'−'}), '6.2':m('expression',{a:18,b:6,c:7,op:'+'}), '6.3':m('brackets',{a:240,b:8,c:4}), '6.4':m('equation',{a:6,b:30,total:72}), '6.5':m('distribute',{a:7,b:20,c:3}),
 '7.1':m('compensate',{a:499999,b:235678,near:500000}), '7.2':m('multiply',{a:3600,b:25}), '7.3':m('estimate',{a:6782,b:49,unit:100,secondUnit:10,op:'×'}), '7.4':m('divide',{a:7056,b:24}), '7.5':m('compensate',{a:3998,b:2507,near:4000}),
 '8.1':m('multistep',{a:48,b:125,c:3760,op:'−'}), '8.2':m('multistep',{a:48675,b:39890,c:125000,op:'remaining'}), '8.3':m('multistep',{a:36,b:24,c:18,op:'÷'}), '8.4':m('multistep',{a:18,b:76,c:2500,op:'budget'}), '8.5':m('multistep',{a:48,b:125,c:3760,op:'−'}),
 '9.1':m('column',{a:638475,b:274806,op:'+'}), '9.2':m('column',{a:34.75,b:8.906,op:'+'}), '9.3':m('fraction',{a:3,b:4,c:5,d:8,op:'+'}), '9.4':m('mixed',{a:3250,b:25,c:4.8,d:6}), '9.5':m('scaleDivision',{a:4725,b:35,scale:10}),
 '10.1':m('compare',{values:[6908210,6890201,6980120]}), '10.2':m('multiply',{a:4308,b:36}), '10.3':m('factors',{a:24,b:36,mode:'hcf'}), '10.4':m('twoProducts',{a:32,b:145,c:18,d:240}), '10.5':m('multiply',{a:2407,b:38}),
 '11.1':m('equivalent',{a:5,b:6,k:4}), '11.2':m('simplify',{a:42,b:56}), '11.3':m('fractionCompare',{values:[[7,12],[5,8]]}), '11.4':m('fractionCompare',{values:[[2,3],[3,4],[5,6]]}), '11.5':m('between',{a:3,b:5,c:2,d:3}),
 '12.1':m('fraction',{a:3,b:4,c:5,d:6,op:'+'}), '12.2':m('fraction',{a:7,b:8,c:5,d:12,op:'−'}), '12.3':m('fraction',{a:7,b:3,c:11,d:6,op:'+',mixed:true}), '12.4':m('fraction',{a:21,b:4,c:8,d:3,op:'−',mixed:true}), '12.5':m('fractionChain',{a:7,b:2,c:7,d:4,e:2,f:3}),
 '13.1':m('fractionOf',{a:4,b:7,total:21}), '13.2':m('fraction',{a:1,b:4,c:3,d:5,op:'×'}), '13.3':m('fraction',{a:2,b:3,c:9,d:10,op:'×',cancel:true}), '13.4':m('fraction',{a:5,b:2,c:3,d:4,op:'×',mixed:true}), '13.5':m('fraction',{a:3,b:5,c:2,d:3,op:'×'}),
 '14.1':m('fraction',{a:1,b:3,c:4,d:1,op:'÷'}), '14.2':m('fraction',{a:3,b:4,c:2,d:1,op:'÷'}), '14.3':m('fraction',{a:5,b:6,c:3,d:1,op:'÷'}), '14.4':m('fraction',{a:9,b:4,c:3,d:1,op:'÷',mixed:true}), '14.5':m('fraction',{a:7,b:8,c:3,d:1,op:'÷'}),
 '15.1':m('column',{a:34.75,b:8.906,op:'+'}), '15.2':m('column',{a:50,b:17.485,op:'−'}), '15.3':m('multiply',{a:6.408,b:7}), '15.4':m('divide',{a:28.56,b:8}), '15.5':m('multistep',{a:2.375,b:3,c:1.85,op:'+'}),
 '16.1':m('equivalence',{a:7,b:20}), '16.2':m('equivalence',{a:5,b:8}), '16.3':m('equivalence',{a:35,b:100}), '16.4':m('fractionCompare',{values:[[3,5],[58,100],[62,100]],fdp:true}), '16.5':m('equivalence',{a:9,b:25}),
 '17.1':m('percentage',{percent:25,total:360}), '17.2':m('percentage',{percent:35,total:480}), '17.3':m('percentage',{percent:17,total:650}), '17.4':m('percentage',{percent:15,total:240,discount:true}), '17.5':m('percentage',{percent:35,total:240,reverse:true}),
 '18.1':m('ratio',{a:8,b:12,mode:'simplify'}), '18.2':m('ratio',{a:5,b:2,mode:'show'}), '18.3':m('ratio',{a:7,b:4,k:4,mode:'scale'}), '18.4':m('ratio',{a:36,b:48,mode:'simplify'}), '18.5':m('ratio',{a:3,b:5,k:6,mode:'scale'}),
 '19.1':m('proportion',{a:1,b:7,target:3.5,unit:'cm'}), '19.2':m('proportion',{a:6,b:450,target:14,unit:'g'}), '19.3':m('ratio',{a:4,b:7,k:5,mode:'scale'}), '19.4':m('ratio',{a:3,b:4,total:420,mode:'share'}), '19.5':m('proportion',{a:1,b:8,target:6.5,unit:'km'}),
 '20.1':m('fraction',{a:5,b:6,c:7,d:12,op:'+'}), '20.2':m('percentage',{percent:37.5,total:640}), '20.3':m('ratio',{a:45,b:60,mode:'simplify'}), '20.4':m('proportion',{a:6,b:0.75,target:14,unit:'kg'}), '20.5':m('fractionCompare',{values:[[72,100],[7,10],[73,100]],fdp:true}),
 '21.1':m('sequence',{start:7,step:5}), '21.2':m('sequence',{start:84,step:-11}), '21.3':m('formula',{a:6,b:4,n:5}), '21.4':m('substitute',{a:3,b:7,c:2,d:5}), '21.5':m('formula',{a:4,b:-1,n:5}),
 '22.1':m('equation',{a:1,b:38,total:91}), '22.2':m('equation',{a:5,b:-7,total:48}), '22.3':m('equation',{a:6,b:24,total:72}), '22.4':m('equation',{a:3,b:14,total:65}), '22.5':m('equation',{a:4,b:12,total:40}),
 '23.1':m('convert',{a:4.375,k:1000,from:'km',to:'m'}), '23.2':m('convert',{a:2.65,k:1000,from:'kg',to:'g'}), '23.3':m('convert',{a:845,k:0.001,from:'mm',to:'m'}), '23.4':m('proportion',{a:5,b:8,target:30,unit:'km'}), '23.5':m('measurePieces',{length:12.5,piece:40}),
 '24.1':m('area',{a:14,b:9,shape:'rectangle'}), '24.2':m('area',{a:12,b:7,shape:'parallelogram'}), '24.3':m('area',{a:15,b:8,shape:'triangle'}), '24.4':m('area',{a:12,b:9,shape:'triangle',missing:true}), '24.5':m('area',{a:10,b:6,c:4,shape:'compound'}),
 '25.1':m('volume',{a:6,b:4,c:5}), '25.2':m('volume',{a:12,b:7,c:5}), '25.3':m('volume',{a:12,b:5,c:6,missing:true}), '25.4':m('volume',{a:8,b:6,c:5,compare:[10,6,4]}), '25.5':m('volume',{a:40,b:25,c:30,small:5}),
 '26.1':m('angles',{angles:[85,140],total:360,shape:'point'}), '26.2':m('angles',{angles:[68],total:180,shape:'opposite'}), '26.3':m('angles',{angles:[47,68],total:180,shape:'triangle'}), '26.4':m('circle',{radius:4.5}), '26.5':m('angles',{angles:[92,88,105],total:360,shape:'quad'}),
 '27.1':m('coordinate',{x:-4,y:3,mode:'plot'}), '27.2':m('coordinate',{x:2,y:-5,dx:-5,dy:6,mode:'translate'}), '27.3':m('coordinate',{x:4,y:-2,dx:-3,dy:5,mode:'translate'}), '27.4':m('coordinate',{x:-6,y:2,mode:'reflect'}), '27.5':m('coordinate',{x:-2,y:-1,dx:9,dy:-3,mode:'reverse'}),
 '28.1':m('lineGraph',{values:[18,26,33,46]}), '28.2':m('pie',{part:1,total:4,population:240}), '28.3':m('pie',{part:15,total:60}), '28.4':m('mean',{values:[12,15,18,11,19]}), '28.5':m('meanCompare',{mean:24,count:8,total:207,count2:9}),
 '29.1':m('percentageChain',{total:240,up:15,down:20}), '29.2':m('fractionPercent',{a:3,b:5,part:84,percent:35}), '29.3':m('volume',{a:12,b:8,c:5,filled:3}), '29.4':m('pie',{part:126,total:360,population:120,reverse:true}), '29.5':m('createExpressions',{}),
 '30.1':m('fraction',{a:9,b:4,c:3,d:1,op:'÷',mixed:true}), '30.2':m('equation',{a:5,b:8,total:73}), '30.3':m('area',{a:18,b:11,shape:'triangle'}), '30.4':m('percentage',{percent:12.5,total:640,discount:true}), '30.5':m('volume',{a:12,b:7,c:9,missing:true}),
};

export function exampleFor(item, variant=0) {
 if(item.year===1) return yearOne(item,variant);
 const p=structuredClone(models[`${item.week}.${item.day}`]);
 if(!p) throw new Error(`No explicit maths model for ${item.week}.${item.day}`);
 // Variants preserve the mathematical structure and are recalculated by the renderer.
 if(variant){
  const v=variant;
  switch(p.kind){
   case 'place':p.n+=v*1000000;break;
   case 'compare':p.values=p.values.map(n=>n+v*100000);break;
   case 'numberLine':p.a-=v;p.b+=v;break;
   case 'round':p.n+=v*p.unit;break;
   case 'column':p.a+=Number.isInteger(p.a)?v*123:v*1.25;break;
   case 'multiply':p.a+=Number.isInteger(p.a)?v*11:v*0.101; p.a=+p.a.toFixed(3);break;
   case 'divide':p.a=+(p.a+v*p.b*11).toFixed(3);break;
   case 'simplify':p.a=6*(v+1);p.b=8*(v+1);break;
   case 'equivalent':p.a=Math.max(1,p.a-v);break;
   case 'fraction':p.a+=v*p.b;break;
   case 'fractionCompare':p.values=p.values.map(([a,b])=>[a+v*b,b]);break;
   case 'fractionOf':p.total+=v*p.b;break;
   case 'equivalence':p.a+=v;break;
   case 'percentage':p.total+=v*80;break;
   case 'ratio':if(p.total)p.total+=(p.a+p.b)*v*10;else if(p.k)p.k+=v;else {p.a*=v+1;p.b*=v+1;}break;
   case 'proportion':p.target+=v*p.a;break;
   case 'sequence':p.start+=v*2;break;
   case 'equation':p.total+=v*p.a*2;break;
   case 'formula':p.a+=v;break;
   case 'substitute':p.b+=v;break;
   case 'convert':p.a+=v;break;
   case 'area':p.a+=v*2;break;
   case 'volume':p.c+=v;break;
   case 'angles':p.angles[0]+=v*3;break;
   case 'circle':p.radius+=v;break;
   case 'coordinate':p.y=Math.max(-5,Math.min(5,p.y-v));break;
   case 'mean':p.values=p.values.map(n=>n+v);break;
   case 'lineGraph':p.values=p.values.map(n=>n+v*3);break;
   case 'pie':if(p.population)p.population+=v*120;else p.part+=v*3;break;
   case 'factors':if(p.mode==='pairs')p.a=36+v*12;else{p.a*=v+1;p.b*=v+1;}break;
   case 'properties':p.square+=v;p.cube=Math.min(6,p.cube+v);break;
   case 'estimate':p.a+=v*p.unit;break;
   case 'expression':p.a+=v*5;break;
   case 'brackets':p.a+=(p.b+p.c)*v;break;
   case 'distribute':p.c+=v;break;
   case 'compensate':p.b+=v*101;break;
   case 'multistep':p.c+=v*(p.op==='÷'?0:10);if(p.op==='÷')p.a+=v*p.c;break;
   case 'mixed':p.a+=v*p.b;break;
   case 'scaleDivision':p.a+=v*p.b*10;break;
   case 'twoProducts':p.a+=v;break;
   case 'between':p.a+=v*p.b;p.c+=v*p.d;break;
   case 'fractionChain':p.a+=v*p.b;break;
   case 'measurePieces':p.length+=v;break;
   case 'meanCompare':p.mean+=v;break;
   case 'percentageChain':p.total+=v*100;break;
   case 'fractionPercent':p.part+=v*p.a*10;break;
  }
 }
 return p;
}
function yearOne(item,v){
 const specs={
  '1.1':{kind:'sort',mode:v%2?'shape':'colour'},
  '1.2':{kind:'count',n:5+v},
  '1.3':{kind:'count',n:[4,3,5,0][v],frame:true},
  '1.4':{kind:'match',n:[4,3,5,2][v]},
  '1.5':{kind:'sets',a:3+v,b:5+(v%2)},
  '2.1':{kind:'count',n:7+v,frame:true},
  '2.2':{kind:'match',n:[8,6,9,7][v]},
  '2.3':{kind:'track',n:[7,4,9,3][v]},
  '2.4':{kind:'one',n:[7,5,8,3][v],op:1},
  '2.5':{kind:'one',n:[9,6,8,4][v],op:-1},
 };
 return specs[`${item.week}.${item.day}`];
}
