import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.join(repo,'lessons');
const mime={'.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const server=http.createServer((request,response)=>{
  response.setHeader('Access-Control-Allow-Origin','*');
  if(request.method==='OPTIONS'){response.writeHead(204);response.end();return;}
  let relative;
  try{relative=decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/lessons\/?/,'');}catch{response.writeHead(400);response.end('Bad request');return;}
  const file=path.resolve(root,relative);
  if(file!==root&&!file.startsWith(root+path.sep)){response.writeHead(403);response.end('Forbidden');return;}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404);response.end('Not found');return;}
    response.setHeader('Content-Type',mime[path.extname(file).toLowerCase()]??'application/octet-stream');
    response.setHeader('Content-Length',stat.size);
    fs.createReadStream(file).pipe(response);
  });
});
server.listen(4300,'localhost',()=>console.log('Local lesson files: http://localhost:4300/lessons/'));
