import {readFile,readdir,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const privateTerms=JSON.parse(process.env.PORTFOLIO_PRIVATE_TERMS || 'null');
assert(Array.isArray(privateTerms) && privateTerms.length > 0 && privateTerms.every(term=>typeof term==='string' && term.trim().length>=3),'Set PORTFOLIO_PRIVATE_TERMS to a JSON array of private names/account identifiers');
const root=new URL('../dist/',import.meta.url);
const names=['index.html','styles.css','app.js','evidence.json','evidence.html','license.html','LICENSE.txt','LICENSE_SCOPE.txt','THIRD_PARTY.txt'];
assert.deepEqual((await readdir(root)).sort(),[...names].sort(),'Unexpected deployment file');
let bytes=0,links=0;
for(const name of names){
 const text=await readFile(new URL(name,root),'utf8');bytes+=(await stat(new URL(name,root))).size;
 assert(!/AppData|OneDrive|\b[A-Za-z]:[\\/]|\\\\[^\\\s]+\\|\/(?:Users|home)\/|-----BEGIN.*PRIVATE KEY|AKIA[A-Z0-9]{16}|gh[pousr]_[A-Za-z0-9]{30,}/i.test(text),'Local path or secret marker in '+name);
 assert(!privateTerms.some(term=>text.toLowerCase().includes(term.trim().toLowerCase())),'Private identifier in '+name);
 assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),'Unapproved email');
 if(name.endsWith('.html')){
  assert(/<html lang="en">/.test(text));assert(/name="viewport"/.test(text));assert(/<meta name="robots" content="index,follow">/.test(text),'Launch robots metadata');assert(!/noindex|nofollow|LOCAL DESIGN PREVIEW/.test(text),'Stale preview metadata or label');assert(/Content-Security-Policy/.test(text));
  assert.equal((text.match(/<h1[ >]/g)||[]).length,1,'One primary heading');assert(/class="skip"/.test(text));
  const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs');
  for(const [,ref] of text.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(ref.startsWith('https://')){assert(['https://github.com/RohithVarmaD07','https://github.com/RohithVarmaD07/mediflow-ai','https://github.com/RohithVarmaD07/agentic-dataops'].includes(ref),'Unapproved external link '+ref);continue;}
   assert(!/^(?:http:|javascript:|mailto:|data:)/.test(ref));const [path,hash]=ref.split('#');const target=path||name;assert(names.includes(target),'Unknown link '+ref);links++;
   if(hash)assert((await readFile(new URL(target,root),'utf8')).includes('id="'+hash+'"'),'Missing anchor '+ref);
  }
 }
}
for(const [asset,source] of [['LICENSE.txt','LICENSE'],['LICENSE_SCOPE.txt','LICENSE_SCOPE.md'],['THIRD_PARTY.txt','THIRD_PARTY.md']]){assert.equal(await readFile(new URL(asset,root),'utf8'),await readFile(new URL('../'+source,root),'utf8'),'Notice mismatch '+asset);}
const licensePage=await readFile(new URL('license.html',root),'utf8');
for(const asset of ['LICENSE.txt','LICENSE_SCOPE.txt','THIRD_PARTY.txt']){assert(licensePage.includes('href="'+asset+'"'),'Missing notice link '+asset);const source=await readFile(new URL(asset,root),'utf8');const escaped=source.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');assert(licensePage.includes(escaped),'Incomplete inline notice '+asset);}
for(const page of ['index.html','evidence.html']){const html=await readFile(new URL(page,root),'utf8');assert(/<footer[\s\S]*href="license.html"[\s\S]*<\/footer>/.test(html),'Missing footer license link '+page);}
const evidence=JSON.parse(await readFile(new URL('evidence.json',root),'utf8'));assert.equal(evidence.tests.passed,147);assert.equal(evidence.tests.original_crash_checkpoints,7);assert.equal(evidence.demo.successful_invocations,4);assert.equal(evidence.demo.replay_unchanged,true);
const css=await readFile(new URL('styles.css',root),'utf8');assert(css.includes('prefers-reduced-motion'));assert(css.includes(':focus-visible'));assert(css.includes('@media(max-width:680px)'));
const js=spawnSync(process.execPath,['--check',fileURLToPath(new URL('app.js',root))],{encoding:'utf8'});assert.equal(js.status,0,js.stderr);
assert(bytes<100000,'Static payload budget exceeded');
function luminance(hex){const rgb=hex.match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
const contrasts={};for(const [name,a,b] of [['body','192c28','f5f2e9'],['muted','52615b','f5f2e9'],['gold','806032','f5f2e9'],['button','fffdf6','244e41'],['dark copy','d5dbd0','192c28']]){const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);const ratio=(l[0]+.05)/(l[1]+.05);assert(ratio>=4.5,name+' contrast');contrasts[name]=Number(ratio.toFixed(2));}
console.log(JSON.stringify({status:'passed',files:names.length,local_links:links,total_bytes:bytes,contrast_ratios:contrasts,limits:'Static checks, not a full accessibility audit or browser performance benchmark'},null,2));
