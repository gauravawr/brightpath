import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';import crypto from 'node:crypto';
const root='.qa/year4-maths',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const lessons=JSON.parse(await fs.readFile(root+'/lessons.json','utf8'));const pending=new Map(lessons.map(l=>[`4-${l.week}-${l.day}`,l]));let done=0;
async function finalize(dir,l){
 const folder=`${root}/build/${dir}`,fit=JSON.parse((await fs.readFile(folder+'/text-fit.json','utf8')).replace(/^\uFEFF/,''));if(fit.length)throw Error('Text overflow '+dir+': '+JSON.stringify(fit));
 const hash=sha(await fs.readFile(folder+'/animated-candidate.pptx'));let revision=1;
 for(;;revision++){try{const r=JSON.parse(await fs.readFile(`${root}/validation-v${revision}/${dir}.json`,'utf8'));if(r.finalSha256===hash){const m=JSON.parse(await fs.readFile(folder+'/manifest.json','utf8'));m.finalizationRevision='v'+revision;await fs.writeFile(folder+'/manifest.json',JSON.stringify(m,null,2));console.log('VERIFIED '+dir);return;}}catch{break;}}
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['scripts/finalize_maths_visual_rollout.mjs',root,'v'+revision,`4:${l.week}.${l.day}`],{windowsHide:true});let out='';child.stdout.on('data',v=>out+=v);child.stderr.on('data',v=>out+=v);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(out)));});console.log('FINALIZED '+(++done)+'/150 '+dir);
}
while(pending.size){
 const ready=[];for(const [dir,l] of pending){try{const fit=await fs.stat(`${root}/build/${dir}/text-fit.json`),preview=await fs.stat(`${root}/build/${dir}/static-preview.pptx`);if(fit.mtimeMs>=preview.mtimeMs){ready.push([dir,l]);if(ready.length===3)break;}}catch{}}
 if(!ready.length){await new Promise(r=>setTimeout(r,3000));continue;}
 await Promise.all(ready.map(async([dir,l])=>{await finalize(dir,l);pending.delete(dir);}));
}
