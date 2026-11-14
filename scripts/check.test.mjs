import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, cp, appendFile, readFile, writeFile, unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const parent=process.env.PORTFOLIO_TEST_ROOT;
assert(parent, 'Set PORTFOLIO_TEST_ROOT to an isolated evidence directory');
await mkdir(parent,{recursive:true});
const root=await mkdtemp(join(parent,'checker-'));
await cp(new URL('../dist/',import.meta.url),join(root,'dist'),{recursive:true});
await mkdir(join(root,'scripts'));
await cp(fileURLToPath(new URL('check.mjs',import.meta.url)),join(root,'scripts/check.mjs'));
for(const name of ['LICENSE','LICENSE_SCOPE.md','THIRD_PARTY.md'])await cp(new URL('../'+name,import.meta.url),join(root,name));
function run(terms){
 const env={...process.env};
 delete env.PORTFOLIO_PRIVATE_TERMS;
 if(terms!==undefined) env.PORTFOLIO_PRIVATE_TERMS=terms;
 return spawnSync(process.execPath,[join(root,'scripts/check.mjs')],{env,encoding:'utf8'});
}
for(const terms of [undefined,'null','[]','[" "]','{}']){
 test('reject missing/invalid private-term configuration '+String(terms),()=>{
  const result=run(terms); assert.notEqual(result.status,0); assert.match(result.stderr,/Set PORTFOLIO_PRIVATE_TERMS/);
 });
}
test('clean static assets pass',()=>{const result=run('["PrivateExample"]');assert.equal(result.status,0,result.stderr);});
for(const [name,payload,message] of [
 ['configured name','pRiVaTeExAmPlE','Private identifier'],
 ['Windows slash path','C:/Users/example/runtime','Local path or secret'],
 ['Windows backslash path',String.raw`C:\Users\example\runtime`,'Local path or secret'],
 ['Unix home path','/home/example/runtime','Local path or secret'],
 ['private key','-----BEGIN PRIVATE KEY-----','Local path or secret'],
 ['AWS key','AKIA'+'A'.repeat(16),'Local path or secret'],
 ['email','private@example.invalid','Unapproved email']
]){
 test('reject '+name,async()=>{
  // Restore only this disposable copy; original website assets are never edited.
  await cp(new URL('../dist/index.html',import.meta.url),join(root,'dist/index.html'));
  await appendFile(join(root,'dist/index.html'),'<!-- '+payload+' -->');
  const result=run('["PrivateExample"]');assert.notEqual(result.status,0);assert(result.stderr.includes(message),result.stderr);
 });
}

async function restore(){await cp(new URL('../dist/',import.meta.url),join(root,'dist'),{recursive:true});}
for(const name of ['LICENSE.txt','LICENSE_SCOPE.txt','THIRD_PARTY.txt'])test('reject altered '+name,async()=>{await restore();await appendFile(join(root,'dist',name),'altered');const result=run('["PrivateExample"]');assert.notEqual(result.status,0);assert.match(result.stderr,/Notice mismatch/);});
test('reject missing license asset',async()=>{await restore();await unlink(join(root,'dist/LICENSE.txt'));const result=run('["PrivateExample"]');assert.notEqual(result.status,0);assert.match(result.stderr,/Unexpected deployment file/);});
test('reject missing footer licensing link',async()=>{await restore();const file=join(root,'dist/index.html');await writeFile(file,(await readFile(file,'utf8')).replace('href="license.html"','href="evidence.html"'));const result=run('["PrivateExample"]');assert.notEqual(result.status,0);assert.match(result.stderr,/Missing footer license link/);});
test('reject incomplete inline notice',async()=>{await restore();const file=join(root,'dist/license.html');await writeFile(file,(await readFile(file,'utf8')).replace('Permission is hereby granted','Permission omitted'));const result=run('["PrivateExample"]');assert.notEqual(result.status,0);assert.match(result.stderr,/Incomplete inline notice/);});
