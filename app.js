import {cards as workCards} from './data.js?v=20261102-59';
import {homeCards} from './home-data.js';
import {compareSpeech} from './speaking.mjs?v=20261102-speaking-free';
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
function back(){stopAudio();stopRecognition();resetSpeaking();$('study').hidden=true;$('choose').hidden=false;context=null}
function build(){stopAudio();queue=context.cards.filter(c=>all||due(c));idx=0;completed=0;show()}
function show(){
  stopAudio();
  stopRecognition();
  resetSpeaking();
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
  stopRecognition();
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

// Free speaking practice: the browser may use a cloud speech recognition service.
// This compares the transcript to the card; it cannot assess individual phonemes.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRecognition = null;
let receivedSpeech = false;
let recognitionError = false;

function setSpeakingButton(listening) {
  const button = $('speak-button');
  button.textContent = listening ? '■ Stop' : '🎙 Speak';
  button.setAttribute('aria-pressed', String(listening));
  button.disabled = !SpeechRecognitionAPI;
}

function setSpeakingStatus(message) {
  $('speak-feedback').hidden = false;
  $('speak-status').textContent = message;
}

function resetSpeaking() {
  $('speak-feedback').hidden = true;
  $('speak-status').textContent = '';
  $('speak-preview').hidden = true;
  $('speak-preview').textContent = '';
  $('speak-analysis').hidden = true;
  $('speak-match').textContent = '';
  $('speak-missing').replaceChildren();
  $('speak-unexpected').replaceChildren();
  setSpeakingButton(false);
}

function stopRecognition() {
  const previous = activeRecognition;
  activeRecognition = null;
  if (previous) {
    // Detach logically first: aborted sessions must not update the next card.
    try { previous.abort(); } catch (error) { console.warn('Recognition stop failed', error); }
  }
  setSpeakingButton(false);
}

function showWordList(id, words) {
  const target = $(id);
  target.replaceChildren();
  if (!words.length) {
    target.textContent = 'None';
    return;
  }
  for (const word of words) {
    const chip = document.createElement('span');
    chip.className = 'speaking-word';
    chip.textContent = word; // Transcript is always inserted as plain text.
    target.appendChild(chip);
  }
}

function showTranscript(transcript) {
  const card = queue[idx];
  if (!card || !transcript.trim()) return;
  receivedSpeech = true;
  const analysis = compareSpeech(card.en, transcript);
  $('speak-preview').hidden = false;
  $('speak-preview').textContent = 'Heard: ' + transcript;
  $('speak-analysis').hidden = false;
  $('speak-match').textContent =
    'Text match: ' + analysis.textMatch + '% · ' +
    analysis.matched + ' of ' + analysis.expectedCount + ' expected words matched';
  showWordList('speak-missing', analysis.missing);
  showWordList('speak-unexpected', analysis.unexpected);
  setSpeakingStatus(analysis.textMatch === 100
    ? 'All words matched in the transcript.'
    : 'Check the words below. Automatic recognition can make mistakes.');
  // Preserve audio-first learning until the speaking attempt is complete.
  showEnglish();
}

function startRecognition() {
  if (!SpeechRecognitionAPI || !queue[idx]) return;
  if (activeRecognition) {
    setSpeakingStatus('Finishing your recording…');
    $('speak-button').disabled = true;
    try { activeRecognition.stop(); }
    catch { stopRecognition(); setSpeakingStatus('Recording stopped.'); }
    return;
  }

  stopAudio();
  resetSpeaking();
  receivedSpeech = false;
  recognitionError = false;
  const recognition = new SpeechRecognitionAPI();
  recognition.lang = 'en-GB';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  activeRecognition = recognition;
  setSpeakingButton(true);
  setSpeakingStatus('Starting microphone…');

  recognition.onstart = () => {
    if (activeRecognition !== recognition) return;
    setSpeakingStatus('Listening… Speak the full sentence.');
  };
  recognition.onresult = event => {
    if (activeRecognition !== recognition) return;
    let finalText = '', interimText = '';
    for (let i = 0; i < event.results.length; i++) {
      const segment = event.results[i][0]?.transcript || '';
      if (event.results[i].isFinal) finalText += ' ' + segment;
      else interimText += ' ' + segment;
    }
    if (finalText.trim()) {
      showTranscript(finalText.trim());
    } else if (interimText.trim() && !receivedSpeech) {
      $('speak-preview').hidden = false;
      $('speak-preview').textContent = 'Hearing: ' + interimText.trim();
    }
  };
  recognition.onerror = event => {
    if (activeRecognition !== recognition) return;
    recognitionError = true;
    const messages = {
      'not-allowed': 'Microphone permission denied. Allow microphone access in your browser settings.',
      'service-not-allowed': 'Speech recognition is blocked by your browser or device.',
      'audio-capture': 'No microphone found. Check the microphone connection.',
      'no-speech': 'No speech detected. Try again in a quieter place.',
      'network': 'Speech recognition needs a network connection in this browser.',
      'language-not-supported': 'British English recognition is not available on this device.',
      'aborted': 'Listening stopped.'
    };
    setSpeakingStatus(messages[event.error] || 'Speech recognition failed. Please try again.');
  };
  recognition.onend = () => {
    if (activeRecognition !== recognition) return;
    activeRecognition = null;
    setSpeakingButton(false);
    if (!receivedSpeech && !recognitionError) {
      setSpeakingStatus('No final transcription received. Try speaking again.');
    }
  };
  try {
    recognition.start(); // User-click only; browser controls permission prompt.
  } catch {
    if (activeRecognition === recognition) activeRecognition = null;
    setSpeakingButton(false);
    setSpeakingStatus('Could not start recognition. Please check microphone permissions.');
  }
}

if (!SpeechRecognitionAPI) {
  $('speak-support').textContent = 'Speech recognition is not supported in this browser. Try Chrome or Edge. No microphone access was requested.';
}
setSpeakingButton(false);
$('speak-button').addEventListener('click', startRecognition);

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
