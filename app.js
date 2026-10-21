import {cards as workCards} from './data.js';
import {homeCards} from './home-data.js';
const contexts={work:{name:'Work',cards:workCards,key:'english-at-work-progress-v1'},home:{name:'Home',cards:homeCards,key:'english-at-home-progress-v1'}};
const DAY=86400000,$=id=>document.getElementById(id);
let context=null,progress={},queue=[],idx=0,reveal=0,all=false,completed=0;
function load(){try{return JSON.parse(localStorage.getItem(context.key))||{}}catch{return {}}}
function save(){try{localStorage.setItem(context.key,JSON.stringify(progress))}catch(e){console.warn('Local storage unavailable',e)}}
function due(card){return !progress[card.id]||progress[card.id].due<=Date.now()}
function stopAudio(){if('speechSynthesis' in window)speechSynthesis.cancel()}
function choose(which){context=contexts[which];if(!context)return;progress=load();all=false;$('choose').hidden=true;$('study').hidden=false;$('heading').textContent=context.name;build()}
function back(){stopAudio();$('study').hidden=true;$('choose').hidden=false;context=null}
function build(){stopAudio();queue=context.cards.filter(c=>all||due(c));idx=0;completed=0;show()}
function show(){
  stopAudio();
  const c=queue[idx];
  $('count').textContent=context.cards.filter(due).length+' pending';
  $('review').classList.toggle('active',!all);
  $('all').classList.toggle('active',all);
  $('bar').style.width=(queue.length?100*completed/(completed+queue.length-idx):100)+'%';
  $('exercise').hidden=!c;$('empty').hidden=!!c;
  if(!c){$('status').textContent='No pending items';return}
  reveal=0;
  $('typed').value='';
  $('language').textContent='AUDIO PROMPT';
  $('hidden-prompt').hidden=false;
  $('answer').hidden=true;
  $('translation').hidden=true;
  $('ratings').hidden=true;
  $('sentence').textContent=c.en;
  $('portuguese').textContent=c.pt;
  $('show-english').disabled=false;
  $('show-portuguese').disabled=false;
  $('status').textContent='Item '+(idx+1)+' of '+queue.length;
}
function showEnglish(){
  if(!queue[idx])return;
  reveal=Math.max(reveal,1);
  $('language').textContent='TEXT';
  $('hidden-prompt').hidden=true;
  $('answer').hidden=false;
  $('ratings').hidden=false;
  $('show-english').disabled=true;
}
function showPortuguese(){
  if(!queue[idx])return;
  showEnglish();reveal=2;
  $('translation').hidden=false;
  $('show-portuguese').disabled=true;
}
// Browsers expose voice names and languages, but no reliable gender property.
// Prefer an installed masculine-sounding British voice where its name is recognizable.
// Users can always override the choice from the selector below.
const VOICE_KEY='review-panel-voice-choice-v1';
let voiceChoice='preferred';
try{voiceChoice=localStorage.getItem(VOICE_KEY)||'preferred'}catch{}
const maleNamePattern=/\\bmale\\b|\\b(daniel|george|ryan|oliver|arthur|brian|guy|david|james|matthew|alex|thomas|william|andrew|roger|aaron|edward|graham|peter|fred|liam)\\b/i;
function englishVoice(v){return /^en(?:[-_]|$)/i.test(v.lang)}
function britishVoice(v){return /^en[-_]GB$/i.test(v.lang)}
function voiceId(v){return 'voice:'+JSON.stringify([v.voiceURI,v.name,v.lang])}
function englishVoices(){
  if(!('speechSynthesis' in window))return [];
  return speechSynthesis.getVoices().filter(englishVoice).sort((a,b)=>
    Number(britishVoice(b))-Number(britishVoice(a))||a.name.localeCompare(b.name)
  );
}
function preferredVoice(voices){
  return voices.find(v=>britishVoice(v)&&maleNamePattern.test(v.name))
    ||voices.find(v=>maleNamePattern.test(v.name))
    ||voices.find(britishVoice)
    ||voices[0]
    ||null;
}
function updateVoiceOptions(){
  const select=$('voice-select'),hint=$('voice-hint');
  if(!('speechSynthesis' in window)){
    select.disabled=true;hint.textContent='Audio voices are not available in this browser.';return;
  }
  const voices=englishVoices();
  select.replaceChildren();
  for(const [value,label] of [['preferred','Prefer male-sounding English'],['default','System default']]){
    const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.appendChild(opt);
  }
  for(const v of voices){
    const opt=document.createElement('option');opt.value=voiceId(v);
    opt.textContent=v.name+' ('+v.lang+')';
    select.appendChild(opt);
  }
  const found=[...select.options].some(o=>o.value===voiceChoice);
  select.value=found?voiceChoice:'preferred';
  if(!voices.length){
    hint.textContent='Loading installed English voices, if available.';
  }else if(!found){
    hint.textContent='Your saved voice is unavailable on this device. Using an available voice.';
  }else if(voiceChoice==='preferred'){
    const best=preferredVoice(voices);
    hint.textContent=best?'Preferred: '+best.name+' ('+best.lang+').':'Using the browser voice.';
  }else if(voiceChoice==='default'){
    hint.textContent='Using your browser or device default voice.';
  }else{
    hint.textContent='Selected voice will be used for playback.';
  }
}
function speak(){
  const c=queue[idx];if(!c)return;
  if(!('speechSynthesis' in window)){alert('Audio playback is unavailable in this browser');return}
  stopAudio();
  const voices=englishVoices(),u=new SpeechSynthesisUtterance(c.en);
  u.lang='en-GB';u.rate=.85;u.pitch=1;
  const manual=voices.find(v=>voiceId(v)===voiceChoice);
  if(voiceChoice!=='default'){
    const selected=manual||(voiceChoice==='preferred'?preferredVoice(voices):preferredVoice(voices));
    if(selected){u.voice=selected;u.lang=selected.lang}
    // Subtle pitch adjustment only in automatic mode; not a gender conversion.
    if(voiceChoice==='preferred')u.pitch=.95;
  }
  speechSynthesis.speak(u);
}
function grade(kind){
  const c=queue[idx];if(!c||reveal<1)return;
  const old=progress[c.id]||{interval:0};
  let days;
  if(kind==='again')days=1/144;
  else if(kind==='hard')days=1;
  else if(kind==='good')days=Math.max(3,Math.round((old.interval||1)*2));
  else days=Math.max(7,Math.round((old.interval||1)*3));
  progress[c.id]={interval:days,due:Date.now()+days*DAY,last:kind};
  save();idx++;completed++;
  if(idx>=queue.length){queue=[];idx=0}
  show();
}
$('work-total').textContent=workCards.length+' items';$('home-total').textContent=homeCards.length+' items';
document.querySelectorAll('[data-context]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.context)));
$('back').addEventListener('click',back);
$('show-english').addEventListener('click',showEnglish);
$('show-portuguese').addEventListener('click',showPortuguese);
$('audio').addEventListener('click',speak);
$('voice-select').addEventListener('change',event=>{
  voiceChoice=event.target.value;
  try{localStorage.setItem(VOICE_KEY,voiceChoice)}catch{}
  updateVoiceOptions();
});
updateVoiceOptions();
if('speechSynthesis' in window){
  if(typeof speechSynthesis.addEventListener==='function')speechSynthesis.addEventListener('voiceschanged',updateVoiceOptions);
  else speechSynthesis.onvoiceschanged=updateVoiceOptions;
}
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>grade(b.dataset.grade)));
$('review').addEventListener('click',()=>{all=false;build()});
$('all').addEventListener('click',()=>{all=true;build()});
$('reset').addEventListener('click',()=>{if(confirm('Clear local history for '+context.name+'?')){progress={};save();build()}});
