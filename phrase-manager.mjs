// Local-only phrase management. Saved spaced-repetition history is held in a
// DIFFERENT storage key; no function in this module reads or writes it.
const PREFIX='review-panel-user-phrases-v1-';
const MAX_EN=500, MAX_PT=700;
export const phraseStorageKey=collection=>PREFIX+collection;

export function sentenceKey(value){
  return String(value||'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'")
    .replace(/\s+/g,' ').trim().replace(/[.!?]+$/,'');
}

export function emptyPhraseState(){return {custom:[],hidden:[]};}

export function loadPhraseState(storage,collection){
  const raw=storage.getItem(phraseStorageKey(collection));
  if(raw===null)return emptyPhraseState();
  const value=JSON.parse(raw);
  if(!value||!Array.isArray(value.custom)||!Array.isArray(value.hidden)){
    throw new Error('Invalid saved phrase data. Nothing has been overwritten.');
  }
  const ids=new Set();
  const custom=value.custom.map(card=>{
    if(!card||typeof card.id!=='string'||!card.id.startsWith('user-')||
       typeof card.en!=='string'||!card.en.trim()||typeof card.pt!=='string'||
       !card.pt.trim()||ids.has(card.id)){
      throw new Error('Saved personal phrases are invalid. Nothing has been overwritten.');
    }
    ids.add(card.id);
    return {id:card.id,en:card.en,pt:card.pt,custom:true};
  });
  if(!value.hidden.every(x=>typeof x==='string'||typeof x==='number')){
    throw new Error('Saved phrase visibility is invalid. Nothing has been overwritten.');
  }
  return {custom,hidden:[...new Set(value.hidden.map(String))]};
}

export function savePhraseState(storage,collection,state){
  // Storage failures throw so the UI never claims a change was saved.
  storage.setItem(phraseStorageKey(collection),JSON.stringify(state));
}

export function getVisibleCards(base,state){
  const hidden=new Set(state.hidden.map(String));
  return [...base,...state.custom].filter(card=>!hidden.has(String(card.id)));
}
export function getAllCards(base,state){return [...base,...state.custom];}

export function addPhrase(base,state,en,pt,id){
  const english=String(en||'').trim().replace(/\s+/g,' ');
  const portuguese=String(pt||'').trim().replace(/\s+/g,' ');
  if(!english||!portuguese)throw new Error('Enter both the English sentence and its Portuguese translation.');
  if(english.length>MAX_EN||portuguese.length>MAX_PT)throw new Error('The sentence or translation is too long.');
  if(!/[a-zA-Z]/.test(english))throw new Error('Enter a sentence in English.');
  if(!/^user-[a-zA-Z0-9-]+$/.test(id)||getAllCards(base,state).some(card=>String(card.id)===id)){
    throw new Error('Could not generate a unique phrase ID. Try again.');
  }
  const key=sentenceKey(english);
  if(getAllCards(base,state).some(card=>sentenceKey(card.en)===key)){
    throw new Error('That sentence already exists. Restore it if it was removed.');
  }
  return {...state,custom:[...state.custom,{id,en:english,pt:portuguese,custom:true}]};
}

export function setPhraseHidden(base,state,id,hidden){
  const selected=getAllCards(base,state).find(card=>String(card.id)===String(id));
  if(!selected)throw new Error('This phrase no longer exists.');
  const previous=new Set(state.hidden.map(String));
  if(hidden)previous.add(String(id));else previous.delete(String(id));
  return {...state,hidden:[...previous]};
}

export function suggestDifficultWords(english){
  const words=String(english||'').match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[];
  const seen=new Set();
  const unique=words.filter(word=>{
    const key=word.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);return true;
  });
  return unique.map((word,index)=>({word,index})).sort((a,b)=>
    b.word.length-a.word.length||a.index-b.index
  ).slice(0,Math.min(3,unique.length)).sort((a,b)=>a.index-b.index).map(x=>x.word);
}
