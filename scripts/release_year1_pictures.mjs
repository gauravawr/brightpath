// Record and verify the exact Year 1 resources approved in the local preview.
// Lesson binaries remain in Azure Blob Storage; this manifest tracks their hashes.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(),qa=path.join(root,'.qa'),manifestPath=path.join(root,'scripts/releases/year1-pictures.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
if(process.argv.includes('--verify-live')){
 const manifest=await read(manifestPath);let next=0,checked=0;
 await Promise.all(Array.from({length:8},async()=>{while(next<manifest.files.length){
  const f=manifest.files[next++],url='https://eshoppingstorage.blob.core.windows.net/brightpath/'+f.file;
  const res=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!res.ok||sha(Buffer.from(await res.arrayBuffer()))!==f.sha256)throw Error('Live verification failed: '+f.file+' (HTTP '+res.status+')');
  if(++checked%150===0)console.log('Verified '+checked+'/'+manifest.files.length+' live resources');
 }}));
 await fs.writeFile(path.join(qa,'year1-live-verification.json'),JSON.stringify({status:'pass',checked,at:new Date().toISOString()},null,2));
 console.log('PASS: all '+checked+' live files match the release manifest.');
}else{
 const paths=new Set((await read(path.join(qa,'year1-all-pictures/published-paths.json'))).map(p=>p.replaceAll('\\','/')));
 const worksheets=await read(path.join(qa,'year1-picture-worksheets/audit.json'));
 const rendered=await read(path.join(qa,'year1-picture-worksheets/render-audit.json'));
 if(worksheets.length!==450||rendered.length!==450)throw Error('Missing worksheet checks');
 for(const f of worksheets){
  const file=`lessons/year-1-maths/week-${f.week}/${f.slug}/${f.level}-worksheet.pdf`;
  if(sha(await fs.readFile(path.join(root,file)))!==f.sha256)throw Error('Worksheet changed after validation: '+file);
  paths.add(file);paths.add(file.replace(`${f.level}-worksheet.pdf`,`preview/${f.level}-worksheet.png`));
 }
 let decks=0;
 for(const file of paths){
  if(!file.endsWith('.pptx'))continue;
  const week=Number(file.match(/week-(\d+)/)[1]),items=await read(path.join(root,`lessons/year-1-maths/week-${week}/week${week}-lessons.json`));
  const item=items.find(i=>file.includes('/'+i.slug+'/'));if(!item)throw Error('Missing lesson for '+file);
  const hash=sha(await fs.readFile(path.join(root,file))),id=`1-${week}-${item.day}`;
  let validated=false;
  for(const rev of ['picture-v4','picture-v3']){
   try{const receipt=await read(path.join(qa,`year1-all-pictures/validation-${rev}/${id}.json`));
    if(receipt.finalSha256===hash&&receipt.packageIntegrity.status==='pass'&&!receipt.presentationLayout.finding_count&&!receipt.presentationLayout.warning_count)validated=true;
   }catch{}
  }
  if(!validated)throw Error('PPTX does not match a passing receipt: '+file);
  const build=await read(path.join(qa,`year1-all-pictures/build/${id}/manifest.json`));
  if(item.teachingSlides.count!==9||JSON.stringify(item.expected)!==JSON.stringify(build.expectedQuestions))throw Error('Slide metadata differs: '+file);
  decks++;
 }
 if(decks!==150)throw Error('Expected 150 PowerPoints');
 const files=[];
 for(const file of [...paths].sort()){
  if(!file.startsWith('lessons/year-1-maths/'))throw Error('Unexpected release scope');
  const bytes=await fs.readFile(path.join(root,file));files.push({file,bytes:bytes.length,sha256:sha(bytes)});
 }
 await fs.mkdir(path.dirname(manifestPath),{recursive:true});
 await fs.writeFile(manifestPath,JSON.stringify({year:1,lessons:150,powerPoints:150,worksheets:450,files},null,2)+'\n');
 console.log(`Release ready: ${decks} PowerPoints, 450 worksheets, ${files.length} files including previews and metadata.`);
}
