import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
const root='.qa/year2-maths';
const lessons=JSON.parse(await fs.readFile(root+'/lessons.json','utf8'));
const ready=process.argv.includes('--ready')?new Set([...((await fs.readFile(root+'/reanimate.log','utf8')).matchAll(/ANIMATED (2:\d+\.\d+)/g))].map(m=>m[1])):null;
const moneyFix=l=>[...l.examples,...l.expected].some(e=>e.model.kind==='sequence'||e.model.kind==='money'&&['change','twoItems'].includes(e.model.mode));
const queue=lessons.filter(l=>process.argv.includes('--repairs')?moneyFix(l):!ready||ready.has(`2:${l.week}.${l.day}`)&&!moneyFix(l));
let next=0,done=0;
await Promise.all(Array.from({length:3},async()=>{
 while(next<queue.length){
  const l=queue[next++],id=`2:${l.week}.${l.day}`;
  const fit=JSON.parse((await fs.readFile(`${root}/build/2-${l.week}-${l.day}/text-fit.json`,'utf8')).replace(/^\uFEFF/,''));
  if(fit.length)throw Error('Text overflow: '+id);
  const dir=`2-${l.week}-${l.day}`,hash=crypto.createHash('sha256').update(await fs.readFile(`${root}/build/${dir}/animated-candidate.pptx`)).digest('hex');
  let revision=1,alreadyValid=false;
  for(;;revision++){
   try{const receipt=JSON.parse(await fs.readFile(`${root}/validation-v${revision}/${dir}.json`,'utf8'));if(receipt.finalSha256===hash){alreadyValid=true;break;}}catch{break;}
  }
  const manifestPath=`${root}/build/${dir}/manifest.json`,manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
  manifest.finalizationRevision='v'+revision;await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2));
  if(alreadyValid){console.log(`VERIFIED ${++done}/${queue.length} ${id}`);continue;}
  await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,['scripts/finalize_maths_visual_rollout.mjs',root,'v'+revision,id],{windowsHide:true});let error='';
   child.stdout.on('data',()=>{});child.stderr.on('data',chunk=>{error+=chunk;});child.on('error',reject);
   child.on('exit',code=>code===0?resolve():reject(Error(id+': '+error)));
  });
  console.log(`FINALIZED ${++done}/${queue.length} ${id}`);
 }
}));
