import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(),local=path.join(root,'lessons');
const config=JSON.parse(await fs.readFile(path.join(root,'brightpath-blob.config.json'),'utf8'));
const base=new URL(config.containerUrl);
if(base.protocol!=='https:'||base.hostname!=='eshoppingstorage.blob.core.windows.net'||base.search)throw Error('Invalid public container URL');
const token=String(config.sasToken||'').replace(/^\?/,'');
const prefix='lessons/';
const args=process.argv.slice(2),dry=args.includes('--dry-run'),pull=args.includes('--pull');
if(args.includes('--prune'))throw Error('Pruning is disabled');
if(!dry&&!token)throw Error('Set sasToken in the ignored brightpath-blob.config.json before transferring files.');
if(!dry&&!pull){const permissions=new URLSearchParams(token).get('sp')||'';if(!permissions.includes('w'))throw Error('Blob SAS token must include Write permission. The current token cannot upload files.');}
const url=name=>new URL(base.href.replace(/\/$/,'')+'/'+name.split('/').map(encodeURIComponent).join('/')+(token?'?'+token:''));
const types={'.json':'application/json','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
async function files(dir){let all=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())all.push(...await files(p));else if(e.isFile())all.push(p);}return all;}
if(pull){
 let marker='';let count=0;
 do{
  const u=new URL(base);u.search=token;u.searchParams.set('restype','container');u.searchParams.set('comp','list');u.searchParams.set('prefix',prefix);if(marker)u.searchParams.set('marker',marker);
  const response=await fetch(u);if(!response.ok)throw Error('Blob listing failed: '+response.status);
  const xml=await response.text();const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
  for(const m of xml.matchAll(/<Blob>\s*<Name>(.*?)<\/Name>/gs)){
   const name=decode(m[1]),relative=name.slice(prefix.length),dest=path.resolve(local,relative);
   if(!dest.startsWith(local+path.sep))throw Error('Unsafe blob path');
   try{await fs.access(dest);continue;}catch{}
   const r=await fetch(url(name));if(!r.ok)throw Error('Blob read failed: '+r.status);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,Buffer.from(await r.arrayBuffer()),{flag:'wx'});count++;
  }
  marker=decode(xml.match(/<NextMarker>(.*?)<\/NextMarker>/s)?.[1]||'');
 }while(marker);
 console.log(`Pulled ${count} missing files. Existing local work was preserved.`);
}else{
 const approved = !dry ? new Map(JSON.parse(await fs.readFile('tmp/lesson-dry-run.json','utf8')).changes.map(e=>[e.file,e.sha256])) : null;
 const releaseIndex=args.indexOf('--release');
 const release=releaseIndex>=0?new Map(JSON.parse(await fs.readFile(args[releaseIndex+1],'utf8')).files.map(f=>[f.file.replace(/^lessons\//,''),f.sha256])):null;
 const list=(await files(local)).filter(f=>{const name=path.relative(local,f).split(path.sep).join('/');return (!approved||approved.has(name))&&(!release||release.has(name));}),changes=[],errors=[];let index=0;
 await Promise.all(Array.from({length:8},async()=>{while(index<list.length){const file=list[index++],name=path.relative(local,file).split(path.sep).join('/');try{
  const bytes=await fs.readFile(file),md5=crypto.createHash('md5').update(bytes).digest('base64'),sha=crypto.createHash('sha256').update(bytes).digest('hex');
  if(release&&release.get(name)!==sha)throw Error('Local file does not match the release manifest');
  if(approved && approved.get(name)!==sha)throw Error('Local file changed since approved dry-run');
  const head=await fetch(url(prefix+name),{method:'HEAD',signal:AbortSignal.timeout(30000)});
  if(head.ok&&(head.headers.get('content-md5')===md5||head.headers.get('x-ms-meta-sha256')===sha))continue;
  if(!head.ok&&head.status!==404)throw Error('Blob check failed: '+head.status);
  const entry={file:name,bytes:bytes.length,status:head.status===404?'new':'changed',sha256:sha};changes.push(entry);
  if(!dry){const r=await fetch(url(prefix+name),{method:'PUT',headers:{'x-ms-blob-type':'BlockBlob','Content-Type':types[path.extname(file)]||'application/octet-stream','Content-MD5':md5,'x-ms-meta-sha256':sha,...(head.ok?{'If-Match':head.headers.get('etag')}:{'If-None-Match':'*'})},body:bytes});if(!r.ok)throw Error('Upload failed: '+r.status);}
 }catch(e){errors.push({file:name,error:String(e.message).replace(/https?:\/\/\S+/g,'[redacted URL]')});}}}));
 changes.sort((a,b)=>a.file.localeCompare(b.file));await fs.mkdir('tmp',{recursive:true});await fs.writeFile('tmp/lesson-'+(dry?'dry-run':'upload')+'.json',JSON.stringify({changes,errors},null,2));
 for(const e of changes)console.log(`${e.status}\t${e.bytes}\t${e.file}`);
 console.log(`${dry?'DRY RUN':'UPLOAD'}: ${changes.length} files, ${errors.length} errors. No files deleted.`);
 if(errors.length)throw Error('Transfer checks failed; see local report.');
}



