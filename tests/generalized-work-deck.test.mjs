import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cards as workCards} from '../data.js';
import {homeCards} from '../home-data.js';
import {practiceWords} from '../practice-words.js';

const removedIds=Array.from({length:28},(_,i)=>21+i);
const expectedActiveIds=[
  ...Array.from({length:20},(_,i)=>i+1),
  ...Array.from({length:19},(_,i)=>i+49),
  ...Array.from({length:7},(_,i)=>i+68)
];

test('Work IDs are stable, removed 21–48 are not reused, and seven additions use 68–74',()=>{
  const ids=workCards.map(card=>card.id);
  assert.deepEqual(ids,expectedActiveIds);
  assert.equal(ids.length,46);
  assert.equal(new Set(ids).size,46);
  assert.ok(ids.every(id=>!removedIds.includes(id)));
  assert.equal(homeCards.length,15);
});

test('general-purpose cards have correct translations',()=>{
  const expected=[
    ['This change improves the overall performance of the system.','Essa alteração melhora o desempenho geral do sistema.'],
    ['We are still evaluating the best approach.','Ainda estamos avaliando a melhor abordagem.'],
    ['As a result, we noticed some unexpected behavior.','Como resultado, percebemos um comportamento inesperado.'],
    ['With this change, the process becomes smoother.','Com essa alteração, o processo se torna mais suave.'],
    ['This improvement makes the system more reliable.','Essa melhoria torna o sistema mais confiável.'],
    ['We still need to validate this point.','Ainda precisamos validar esse ponto.'],
    ["That's all I wanted to cover for now.",'Era só isso que eu queria abordar por enquanto.'],
  ];
  assert.deepEqual(workCards.filter(card=>card.id>=68).map(card=>[card.en,card.pt]),expected);
});

test('only active IDs are supplied to Difficult words, unchanged Home deck retained',()=>{
  assert.deepEqual(Object.keys(practiceWords.work).map(Number).sort((a,b)=>a-b),expectedActiveIds);
  assert.deepEqual(Object.keys(practiceWords.home).map(Number).sort((a,b)=>a-b),
    Array.from({length:15},(_,i)=>i+1));
});

test('review history keys and two-stage protection remain unchanged',()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(app,/english-at-work-progress-v1/);
  assert.match(app,/english-at-home-progress-v1/);
  assert.match(app,/confirmHistoryClear\(context.name, window\)/);
  assert.match(app,/progress\[c.id\]=\{interval:days,due:Date.now\(\)\+days\*DAY,last:kind\}/);
});
