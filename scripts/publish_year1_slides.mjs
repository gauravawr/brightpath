import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(process.argv[2]??path.join(repo,'.qa','year1-all-pictures'));
const revision=process.argv[3]??'picture-v3';
const builds=await fs.readdir(path.join(root,'build'));
const manifests=[];
for(const dir of builds){
 try{const m=JSON.parse(await fs.readFile(path.join(root,'build',dir,'manifest.json'),'utf8'));if(m.year===1&&m.week>=1&&m.week<=30)manifests.push({dir,m});}catch{}
}
if(manifests.length!==150)throw new Error(`Expected 150 Year 1 decks, found ${manifests.length}`);
const metadata=new Map(),changed=[];
for(const {dir,m} of manifests){
 if(m.count!==9||m.activitySlide!==8||m.answerSlide!==9||m.format!=='year1-picture-plan')throw new Error(`Unexpected structure ${m.id}`);
 const fit=JSON.parse(await fs.readFile(path.join(root,'build',dir,'text-fit.json'),'utf8'));
 if(fit.length)throw new Error(`Text does not fit ${m.id}`);
 const receipt=JSON.parse(await fs.readFile(path.join(root,`validation-${revision}`,`${dir}.json`),'utf8'));
 if(receipt.packageIntegrity.status!=='pass'||receipt.presentationLayout.finding_count||receipt.presentationLayout.warning_count)throw new Error(`Validation failed ${m.id}`);
 const source=path.join(repo,m.source);if(!metadata.has(source))metadata.set(source,JSON.parse(await fs.readFile(source,'utf8')));
 const item=metadata.get(source).find(x=>x.day===m.day||x.slug===m.slug);if(!item)throw new Error(`Metadata missing ${m.id}`);
 const activeDir=path.join(path.dirname(m.source),item.slug),destination=path.join(repo,activeDir);await fs.mkdir(destination,{recursive:true});
 await fs.copyFile(path.join(root,`final-${revision}`,`${dir}.pptx`),path.join(destination,m.file));changed.push(path.join(activeDir,m.file));
 const preview=path.join(destination,'preview','powerpoint');await fs.mkdir(preview,{recursive:true});
 for(const name of await fs.readdir(preview))if(/^slide-\d+\.png$/.test(name))await fs.unlink(path.join(preview,name));
 for(let i=1;i<=m.count;i++){const name=`slide-${i}.png`;await fs.copyFile(path.join(root,'build',dir,'preview',name),path.join(preview,name));changed.push(path.join(activeDir,'preview','powerpoint',name));}
 item.teachingSlides={count:m.count};
}
for(const [file,data] of metadata){await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');changed.push(path.relative(repo,file));}
await fs.writeFile(path.join(root,'published-paths.json'),JSON.stringify([...new Set(changed)].sort(),null,2));
console.log(`Published ${manifests.length} Year 1 decks and ${manifests.length*9} preview images locally.`);
