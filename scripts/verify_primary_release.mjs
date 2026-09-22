import fs from 'node:fs/promises';import crypto from 'node:crypto';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const names=['year1-pictures','year2-maths','year3-maths','primary-term-assessments'];
const files=new Map();for(const name of names)for(const file of JSON.parse(await fs.readFile(`scripts/releases/${name}.json`,'utf8')).files)files.set(file.file,file);
// Year 1's earlier picture release did not list its unchanged planning files.
// Verify those too so every lesson pack is complete on the live site.
for(let week=1;week<=30;week++){
 const lessons=JSON.parse(await fs.readFile(`lessons/year-1-maths/week-${week}/week${week}-lessons.json`,'utf8'));
 for(const lesson of lessons){
  const folder=`lessons/year-1-maths/week-${week}/${lesson.slug}`;
  const plan=week===1&&lesson.slug==='sort-objects-into-groups'?'editable-teacher-plan-one-page.docx':'editable-teacher-plan.docx';
  for(const name of [plan,'pre-teach.pdf',week>2?'preview/teacher-plan.pdf':'teacher-plan-preview.pdf']){
   const file=`${folder}/${name}`,bytes=await fs.readFile(file);files.set(file,{file,bytes:bytes.length,sha256:sha(bytes)});
  }
 }
}
const queue=[...files.values()];let next=0,checked=0;const failures=[];
await Promise.all(Array.from({length:8},async()=>{while(next<queue.length){const f=queue[next++];try{
 const local=await fs.readFile(f.file);if(sha(local)!==f.sha256)throw Error('local hash mismatch');
 const url='https://eshoppingstorage.blob.core.windows.net/brightpath/'+f.file;
 const response=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('HTTP '+response.status);
 if(response.headers.get('x-ms-meta-sha256')!==f.sha256){
  const download=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!download.ok||sha(Buffer.from(await download.arrayBuffer()))!==f.sha256)throw Error('live hash mismatch');
 }
 if(++checked%500===0)console.log(`Verified ${checked}/${queue.length} live files`);
 }catch(e){failures.push({file:f.file,error:e.message});}
}}));
await fs.writeFile('tmp/primary-live-verification.json',JSON.stringify({checked,total:queue.length,failures,at:new Date().toISOString()},null,2));
if(failures.length)throw Error(`${failures.length} live resource checks failed; see tmp/primary-live-verification.json`);
console.log(`PASS: all ${checked} live resources match the reviewed release.`);
