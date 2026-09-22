// Publish only the reviewed Year 1 A4 worksheets and Year 1/2 click pacing.
import fs from 'node:fs/promises';import crypto from 'node:crypto';import path from 'node:path';
const read=async p=>JSON.parse((await fs.readFile(p,'utf8')).replace(/^\uFEFF/,''));const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const root='.qa/primary-click-pacing',checks=await read(root+'/content-preservation.json'),native=await read(root+'/native-animation-validation.json'),worksheets=await read('.qa/year1-a4-worksheets/validation.json');
if(checks.length!==300||native.length!==300||worksheets.length!==450)throw Error('Incomplete review');
if(native.some(n=>!n.triggersVerified))throw Error('Native click trigger review is missing');
const worksheetLayouts=await read('.qa/year1-a4-worksheets/layout-validation.json');
if(worksheetLayouts.length!==450)throw Error('Worksheet layout review is missing');
const copies=[];
for(const c of checks){
 const id=c.id.replace(':','-').replace('.','-'),receipt=await read(`${root}/validation-click-v1/${id}.json`),file=`${root}/final-click-v1/${id}.pptx`;
 if(!c.slideContentUnchanged||receipt.finalSha256!==c.sha256||sha(await fs.readFile(file))!==c.sha256||native.find(n=>n.id===c.id)?.sha256!==c.sha256||receipt.packageIntegrity.status!=='pass'||receipt.presentationLayout.finding_count||receipt.presentationLayout.warning_count)throw Error('PowerPoint review failed: '+c.id);
 copies.push([file,c.file]);
}
for(const w of worksheets){
 const source='.qa/year1-a4-worksheets/'+w.source;
 if(w.pages!==2||w.pupilPages!==1||w.questions!==5||sha(await fs.readFile(source))!==w.sha256)throw Error('Worksheet review failed: '+w.file);
 if(worksheetLayouts.find(c=>c.file===w.file)?.sha256!==w.sha256)throw Error('Worksheet layout review is stale: '+w.file);
 copies.push([source,w.file],[source.replace('.pdf','-page-1.png'),w.file.replace(/([^/]+)\.pdf$/,'preview/$1.png')]);
}
await Promise.all(copies.map(([source])=>fs.access(source)));
const files=[];
for(const [source,dest] of copies){await fs.copyFile(source,dest);const bytes=await fs.readFile(dest);files.push({file:dest,bytes:bytes.length,sha256:sha(bytes)});}
// Keep the full-year manifests authoritative after the reviewed refinements.
for(const name of ['year1-pictures','year2-maths']){
 const file=`scripts/releases/${name}.json`,release=await read(file),updates=new Map(files.map(f=>[f.file,f]));
 release.files=release.files.map(f=>updates.get(f.file)??f);release.clickPacing='teacher-controlled-v1';release.pupilPagesPerWorksheet=1;
 await fs.writeFile(file,JSON.stringify(release,null,2)+'\n');
}
await fs.writeFile('scripts/releases/primary-review.json',JSON.stringify({powerPoints:300,worksheets:450,files},null,2)+'\n');
console.log('Published reviewed click pacing and one-page pupil worksheets: '+files.length+' files.');
