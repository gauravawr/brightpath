import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root='lessons/year-5-maths',files=[];
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())await walk(full);else if(entry.name==='interactive-teaching-slides.pptx'){const bytes=await fs.readFile(full);files.push({file:full.split(path.sep).join('/'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}}
await walk(root);files.sort((a,b)=>a.file.localeCompare(b.file));if(files.length!==150)throw Error(`Expected 150 PowerPoints, found ${files.length}`);await fs.mkdir('scripts/releases',{recursive:true});await fs.writeFile('scripts/releases/year5-powerpoints.json',JSON.stringify({year:5,powerPoints:150,slidesPerDeck:12,files},null,2)+'\n');console.log(`Prepared ${files.length} Year 5 PowerPoints.`);
