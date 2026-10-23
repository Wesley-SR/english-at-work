import {cards as workCards} from './data.js?v=20261023-48';
import {homeCards} from './home-data.js';
const contexts={work:{name:'Work',cards:workCards,key:'english-at-work-progress-v1'},home:{name:'Home',cards:homeCards,key:'english-at-home-progress-v1'}};
const DAY=86400000,$=id=>document.getElementById(id);
let context=null,progress={},queue=[],idx=0,reveal=0,all=false,completed=0;
function load(){try{return JSON.parse(localStorage.getItem(context.key))||{}}catch{return {}}}
function save(){try{localStorage.setItem(context.key,JSON.stringify(progress))}catch(e){console.warn('Local storage unavailable',e)}}
function due(card){return !progress[card.id]||progress[card.id].due<=Date.now()}
let recordedAudio=null;
function stopAudio(){
  if(recordedAudio){
    recordedAudio.pause();
    recordedAudio.removeAttribute('src');
    recordedAudio.load();
    recordedAudio=null;
  }
  if('speechSynthesis' in window)speechSynthesis.cancel();
}
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
// Default to real, pre-generated male British MP3s, not device TTS.
const VOICE_KEY='review-panel-recorded-voice-v2';
const VOICE_CHOICES={
  ryan:'Ryan — British male',
  thomas:'Thomas — British male',
  device:'Device voice (may vary)'
};
let voiceChoice='ryan';
try{
  const stored=localStorage.getItem(VOICE_KEY);
  if(stored in VOICE_CHOICES)voiceChoice=stored;
}catch{}
function updateVoiceOptions(){
  const select=$('voice-select'),hint=$('voice-hint');
  select.replaceChildren();
  for(const [value,label] of Object.entries(VOICE_CHOICES)){
    const option=document.createElement('option');
    option.value=value;option.textContent=label;
    select.appendChild(option);
  }
  select.value=voiceChoice;
  hint.textContent=voiceChoice==='device'
    ? 'Uses your browser voices; the voice may be female.'
    : 'British male recording. No device voice installation required.';
}
function speakDevice(sentence){
  if(!('speechSynthesis' in window)){
    alert('Your browser does not support device speech. Choose Ryan or Thomas in the menu.');
    return;
  }
  const utterance=new SpeechSynthesisUtterance(sentence);
  utterance.lang='en-GB';utterance.rate=.85;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='en-gb');
  if(voice)utterance.voice=voice;
  speechSynthesis.speak(utterance);
}
function speak(){
  const card=queue[idx];if(!card)return;
  stopAudio();
  if(voiceChoice==='device'){
    speakDevice(card.en);
    return;
  }
  const collection=context===contexts.work?'work':'home';
  const path='./audio/'+voiceChoice+'/'+collection+'/'+card.id+'.mp3';
  const player=new Audio(path);
  recordedAudio=player;
  const fail=()=>{
    if(recordedAudio!==player)return;
    recordedAudio=null;
    alert('The male voice recording could not be loaded. Check your connection or select another voice in Menu.');
  };
  player.addEventListener('error',fail,{once:true});
  player.addEventListener('ended',()=>{if(recordedAudio===player)recordedAudio=null},{once:true});
  player.play().catch(fail);
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
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>grade(b.dataset.grade)));
$('review').addEventListener('click',()=>{all=false;build()});
$('all').addEventListener('click',()=>{all=true;build()});
$('reset').addEventListener('click',()=>{if(confirm('Clear local history for '+context.name+'?')){progress={};save();build()}});
