"use strict";
const stages={
 ingest:["Preserve the source.","Checksum-addressed raw copies keep the original input intact. Manifest counts and hashes are checked before processing.","INPUT: SYNTHETIC JSONL → OUTPUT: VERIFIED RAW COPY"],
 validate:["Account for every record.","Validate fields and relationships, quarantine invalid rows, and classify duplicates, stale records, conflicts, and eligible updates.","INPUT: RAW RECORDS → OUTPUT: CANDIDATE STATE + QUARANTINE"],
 commit:["One transaction. Two guarantees.","Canonical updates and the committed run ledger are written in one DuckDB transaction. Independent reconciliation checks the resulting state.","INPUT: CANDIDATE STATE → OUTPUT: CANONICAL RECORDS + LEDGER"],
 publish:["Publish a complete snapshot.","Build typed Parquet files, verify hashes, then atomically update the snapshot pointer. Pending publication recovers before new mutation.","INPUT: COMMITTED STATE → OUTPUT: PARQUET + SNAPSHOT POINTER"],
 history:["Make the outcome inspectable.","Durable, bounded stage records link invocation, run, and attempt identities. The read-only history command distinguishes success, corrupt evidence, and missing completion.","INPUT: STAGE RECORDS → OUTPUT: READ-ONLY EXECUTION HISTORY"]};
const detail=document.querySelector('#stage-detail');
for(const button of document.querySelectorAll('[data-stage]'))button.addEventListener('click',()=>{
 for(const peer of document.querySelectorAll('[data-stage]'))peer.setAttribute('aria-pressed',String(peer===button));
 const [title,copy,caption]=stages[button.dataset.stage];
 detail.querySelector('h5').textContent=title;detail.querySelector('p').textContent=copy;detail.querySelector('span').textContent=caption;
});
const scenarios={baseline:['10,000','accepted inserts','1,000 patients · 5,000 appointments · 4,000 encounters. All synthetic.','Reconciliation difference: 0'],correction:['2','accepted updates','Late-arriving corrections update existing records. No new canonical records were inserted.','Reconciliation difference: 0'],dirty:['1','invalid record quarantined','Two duplicates and one stale record were also classified. No canonical changes.','Reconciliation difference: 0'],replay:['0','additional records or metric changes','9,998 duplicates and two stale records. The canonical digest and output hashes match the preceding state.','Replay verified: unchanged analytical outputs']};
const selector=document.querySelector('#scenario');
function showScenario(){const [number,label,copy,result]=scenarios[selector.value];const panel=document.querySelector('#scenario-detail');const count=panel.querySelector('.run-count');count.replaceChildren(document.createTextNode(number+' '));const span=document.createElement('span');span.textContent=label;count.append(span);panel.querySelector('p').textContent=copy;panel.querySelector('.run-result').textContent=result;}
selector.addEventListener('change',showScenario);document.querySelector('#reset-demo').addEventListener('click',()=>{selector.value='baseline';showScenario();});
