import test from 'node:test';
import assert from 'node:assert/strict';
import {cards as workCards} from '../data.js';
import {
  addPhrase,emptyPhraseState,getAllCards,getVisibleCards,
  loadPhraseState,savePhraseState,setPhraseHidden,phraseStorageKey,suggestDifficultWords
} from '../phrase-manager.mjs';

function storage(initial={}){
  const map=new Map(Object.entries(initial));
  return {map,getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,v)};
}
test('creating a personal sentence preserves original cards and IDs',()=>{
  const before=workCards.map(x=>x.id);
  const original=emptyPhraseState();
  const after=addPhrase(workCards,original,'We should review the next results.','Deveríamos revisar os próximos resultados.','user-example-123');
  assert.equal(getVisibleCards(workCards,after).length,workCards.length+1);
  assert.deepEqual(workCards.map(x=>x.id),before);
  assert.equal(original.custom.length,0);
});
test('removing a published or personal card hides it without deleting its content',()=>{
  let state=addPhrase(workCards,emptyPhraseState(),'This is a new phrase.','Esta é uma nova frase.','user-test-10');
  state=setPhraseHidden(workCards,state,1,true);
  state=setPhraseHidden(workCards,state,'user-test-10',true);
  assert.equal(getVisibleCards(workCards,state).length,workCards.length-1);
  assert.equal(getAllCards(workCards,state).length,workCards.length+1);
  assert.equal(state.custom[0].en,'This is a new phrase.');
  state=setPhraseHidden(workCards,state,1,false);
  state=setPhraseHidden(workCards,state,'user-test-10',false);
  assert.equal(getVisibleCards(workCards,state).length,workCards.length+1);
});
test('duplicates including hidden phrases cannot silently create new IDs',()=>{
  let state=setPhraseHidden(workCards,emptyPhraseState(),1,true);
  assert.throws(()=>addPhrase(workCards,state,workCards[0].en.toUpperCase(),'Tradução','user-other-1'),/already exists/);
  assert.throws(()=>addPhrase(workCards,state,'A phrase','Tradução','../unsafe'),/unique phrase ID/);
});
test('saving custom phrases never touches the separate review history storage key',()=>{
  const key='english-at-work-progress-v1';
  const previous=JSON.stringify({1:{due:123,interval:4,last:'good'}});
  const s=storage({[key]:previous});
  let value=addPhrase(workCards,emptyPhraseState(),'Please check again.','Por favor, verifique novamente.','user-abc');
  value=setPhraseHidden(workCards,value,2,true);
  savePhraseState(s,'work',value);
  assert.equal(s.getItem(key),previous);
  assert.ok(s.map.has(phraseStorageKey('work')));
  assert.deepEqual(loadPhraseState(s,'work'),value);
});
test('invalid storage is never silently overwritten',()=>{
  const s=storage({[phraseStorageKey('work')]:'{"broken":true}'});
  assert.throws(()=>loadPhraseState(s,'work'),/Invalid saved phrase data/);
});
test('word suggestions work with user-authored sentences',()=>{
  const words=suggestDifficultWords('Please investigate the unexpected behaviour carefully.');
  assert.equal(words.length,3);
  assert.ok(words.includes('unexpected'));
  assert.ok(words.includes('investigate'));
});
