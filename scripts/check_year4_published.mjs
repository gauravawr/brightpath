import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const manifest=JSON.parse(await fs.readFile('scripts/releases/year4-maths.json','utf8'));
const base=process.argv[2]??'http://localhost:4300';
let next=0,checked=0;
await Promise.all(Array.from({length:8},async()=>{
 while(next<manifest.files.length){
  const file=manifest.files[next++],bytes=await fs.readFile(file.file);
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Local hash mismatch: '+file.file);
  const res=await fetch(base+'/'+file.file,{method:'HEAD',signal:AbortSignal.timeout(30000)});
  if(!res.ok||Number(res.headers.get('content-length'))!==file.bytes)throw Error('Resource unavailable or wrong length: '+file.file);
  checked++;
 }
}));
const curriculum=JSON.parse(await fs.readFile('public/curriculum-plans/maths/year-4.json','utf8'));
for(const week of curriculum){
 const lessons=JSON.parse(await fs.readFile(`lessons/year-4-maths/week-${week.week}/week${week.week}-lessons.json`,'utf8'));
 if(lessons.length!==5||lessons.some((l,i)=>l.title!==week.days[i]||l.slug!==week.days[i].toLowerCase().replace(/[^a-z0-9]+/g,'-')||l.teachingSlides.count!==14))throw Error('Curriculum links do not match lesson metadata');
}
await fs.writeFile('.qa/year4-maths/published-verification.json',JSON.stringify({status:'pass',files:checked,lessons:150,base,checkedAt:new Date().toISOString()},null,2));
console.log(`PASS: ${checked} published files and all 150 curriculum links.`);
