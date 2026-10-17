import {cards as workCards} from './data.js';
import {homeCards} from './home-data.js';
const contexts={work:{name:'English at Work',cards:workCards,key:'english-at-work-progress-v1'},home:{name:'English at Home',cards:homeCards,key:'english-at-home-progress-v1'}};
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
  $('count').textContent=context.cards.filter(due).length+' due';
  $('review').classList.toggle('active',!all);
  $('all').classList.toggle('active',all);
  $('bar').style.width=(queue.length?100*completed/(completed+queue.length-idx):100)+'%';
  $('exercise').hidden=!c;$('empty').hidden=!!c;
  if(!c){$('status').textContent='Session complete';return}
  reveal=0;
  $('typed').value='';
  $('language').textContent='LISTEN FIRST';
  $('hidden-prompt').hidden=false;
  $('answer').hidden=true;
  $('translation').hidden=true;
  $('ratings').hidden=true;
  $('sentence').textContent=c.en;
  $('portuguese').textContent=c.pt;
  $('show-english').disabled=false;
  $('show-portuguese').disabled=false;
  $('status').textContent='Card '+(idx+1)+' of '+queue.length;
}
function showEnglish(){
  if(!queue[idx])return;
  reveal=Math.max(reveal,1);
  $('language').textContent='ENGLISH';
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
function speak(){
  const c=queue[idx];if(!c)return;
  if(!('speechSynthesis' in window)){alert('Audio speech is not supported in this browser');return}
  stopAudio();
  const u=new SpeechSynthesisUtterance(c.en);u.lang='en-GB';u.rate=.85;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='en-gb');
  if(voice)u.voice=voice;
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
$('work-total').textContent=workCards.length+' phrases';$('home-total').textContent=homeCards.length+' phrases';
document.querySelectorAll('[data-context]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.context)));
$('back').addEventListener('click',back);
$('show-english').addEventListener('click',showEnglish);
$('show-portuguese').addEventListener('click',showPortuguese);
$('audio').addEventListener('click',speak);
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>grade(b.dataset.grade)));
$('review').addEventListener('click',()=>{all=false;build()});
$('all').addEventListener('click',()=>{all=true;build()});
$('reset').addEventListener('click',()=>{if(confirm('Delete review history for '+context.name+'?')){progress={};save();build()}});
