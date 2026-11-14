import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../dist/',import.meta.url);
const types={'index.html':'text/html; charset=utf-8','styles.css':'text/css; charset=utf-8','app.js':'text/javascript; charset=utf-8','evidence.html':'text/html; charset=utf-8','evidence.json':'application/json; charset=utf-8'};
Object.assign(types,{'license.html':'text/html; charset=utf-8','LICENSE.txt':'text/plain; charset=utf-8','LICENSE_SCOPE.txt':'text/plain; charset=utf-8','THIRD_PARTY.txt':'text/plain; charset=utf-8'});
const server=http.createServer(async(req,res)=>{
 if(!['127.0.0.1:4173','localhost:4173'].includes(req.headers.host)){res.writeHead(403);res.end();return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let name;
 try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1:4173').pathname).slice(1)||'index.html';}catch{res.writeHead(400);res.end();return;}
 if(!Object.hasOwn(types,name)){res.writeHead(404);res.end('Not found');return;}
 try{const data=await readFile(new URL(name,root));res.writeHead(200,{'Content-Type':types[name],'Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(500);res.end('Preview unavailable');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:4173'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
