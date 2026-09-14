import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(process.argv[2]??path.join(repo,'../.qa/maths-rollout'));
const revision=process.argv[3]??'v1';
const audit=JSON.parse(await fs.readFile(path.join(root,'audit.json'),'utf8'));
if(audit.decks!==160||audit.errors.length)throw new Error('Deck audit has not passed');
const groups=new Map(),changed=[];
for(const dir of await fs.readdir(path.join(root,'build'))){
 const source=path.join(root,'build',dir);let m;try{m=JSON.parse(await fs.readFile(path.join(source,'manifest.json'),'utf8'));}catch{continue;}
 const finalizedRevision=m.finalizationRevision??revision;
 await fs.access(path.join(root,'validation-'+finalizedRevision,dir+'.json'));
 const fits=JSON.parse(await fs.readFile(path.join(source,'text-fit.json'),'utf8'));
 if(fits.length)throw new Error('Text does not fit '+m.id);
 const destination=path.resolve(repo,m.dir);
 if(!destination.startsWith(path.join(repo,'public','lessons')+path.sep))throw new Error('Unexpected destination');
 await fs.copyFile(path.join(root,'final-'+finalizedRevision,dir+'.pptx'),path.join(destination,m.file));changed.push(path.join(m.dir,m.file));
 const previews=path.join(destination,'preview','powerpoint');await fs.mkdir(previews,{recursive:true});
 for(const filename of await fs.readdir(previews))if(/^slide-\d+\.png$/.test(filename)){await fs.unlink(path.join(previews,filename));changed.push(path.join(m.dir,'preview','powerpoint',filename));}
 for(let i=1;i<=m.count;i++){const file='slide-'+i+'.png';await fs.copyFile(path.join(source,'preview',file),path.join(previews,file));changed.push(path.join(m.dir,'preview','powerpoint',file));}
 if(!groups.has(m.source))groups.set(m.source,JSON.parse(await fs.readFile(path.join(repo,m.source),'utf8')));
 const item=groups.get(m.source).find(x=>x.day===m.day&&(m.year===1||x.week===m.week));
 if(!item)throw new Error('Lesson metadata missing '+m.id);
 item.teachingSlides={count:m.count};
}
for(const [file,data] of groups){await fs.writeFile(path.join(repo,file),JSON.stringify(data,null,2)+'\n');changed.push(file);}
await fs.writeFile(path.join(root,'published-paths.json'),JSON.stringify([...new Set(changed)],null,2));
console.log('Published '+audit.decks+' decks and '+audit.slides+' previews.');
