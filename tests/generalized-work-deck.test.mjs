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
  ...Array.from({length:17},(_,i)=>i+68)
];

test('Work IDs are stable, removed 21–48 are not reused, and additions use 68–84',()=>{
  const ids=workCards.map(card=>card.id);
  assert.deepEqual(ids,expectedActiveIds);
  assert.equal(ids.length,56);
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
  assert.deepEqual(workCards.filter(card=>card.id>=68&&card.id<=74).map(card=>[card.en,card.pt]),expected);
});


test('ten colleague questions are correct, distinct, and use never-before-assigned IDs',()=>{
  const requested=[
    ['Could you walk me through this part?','Você poderia me explicar esta parte passo a passo?'],
    ['Do you happen to know where I can find this information?','Por acaso você sabe onde posso encontrar esta informação?'],
    ['What do you think about this approach?','O que você acha desta abordagem?'],
    ['Would you recommend doing it differently?','Você recomendaria fazer isso de outra maneira?'],
    ['Have you dealt with something similar before?','Você já lidou com algo parecido antes?'],
    ['Do you have any idea what might be causing this?','Você tem alguma ideia do que pode estar causando isso?'],
    ['Would it make sense to test this before moving forward?','Faria sentido testar isso antes de prosseguir?'],
    ['Is there anything else we should consider?','Há mais alguma coisa que deveríamos considerar?'],
    ['Have you had a chance to look into this?','Você teve a oportunidade de verificar isso?'],
    ['Would you mind taking a quick look at my changes?','Você se importaria de dar uma olhada rápida nas minhas alterações?']
  ];
  assert.deepEqual(workCards.filter(c=>c.id>=75&&c.id<=84).map(c=>[c.en,c.pt]),requested);
  const key=s=>s.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'")
    .trim().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
  assert.equal(new Set(workCards.map(c=>key(c.en))).size,workCards.length,'no duplicate sentences');
  assert.ok(workCards.filter(c=>c.id>=75).every(c=>c.id<=84));
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
