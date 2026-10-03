import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=5173;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.glb':'model/gltf-binary','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
try{await stat(resolve(root,'index.html'));}catch{console.error('Build the game first with npm run build.');process.exit(1);}
const server=createServer(async(req,res)=>{
  if(req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405).end();return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const file=resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403).end();return;}
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('This snack is not on the menu.');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`The game may already be running. Open http://127.0.0.1:${port}/` : error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Typeslasher is ready: http://127.0.0.1:${port}/\nKeep this window open while playing. Press Ctrl+C to stop.`));
