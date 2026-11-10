import {cards as workCards} from './data.js?v=20261105-67';
import {homeCards} from './home-data.js';
import {addPhrase, getAllCards, getVisibleCards, loadPhraseState, savePhraseState, setPhraseHidden, suggestDifficultWords} from './phrase-manager.mjs?v=20261110-1';
import {practiceWords} from './practice-words.js?v=20261105-difficult-words';
import {sentenceWords,wordAudioSlug} from './word-utils.mjs?v=20261105-all-words';
import {compareSpeech} from './speaking.mjs?v=20261102-speaking-free';
import {confirmHistoryClear} from './history-guard.mjs?v=20261102-history-guard';
const contexts={work:{slug:'work',name:'Work',baseCards:workCards,cards:workCards,key:'english-at-work-progress-v1'},home:{slug:'home',name:'Home',baseCards:homeCards,cards:homeCards,key:'english-at-home-progress-v1'}};
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
function choose(which){
  const selected=contexts[which];if(!selected)return;
  try{
    selected.phraseState=loadPhraseState(localStorage,selected.slug);
    selected.cards=getVisibleCards(selected.baseCards,selected.phraseState);
  }catch(error){alert('Could not load saved phrases: '+error.message);return;}
  context=selected;
  progress=load();
  all=false;
  closePhraseManager();
  $('choose').hidden=true;
  $('study').hidden=false;
  $('heading').textContent=context.name;
  updateCollectionTotals();
  build();
}
function back(){stopAudio();stopRecognition();resetSpeaking();closePhraseManager();$('study').hidden=true;$('choose').hidden=false;context=null}
function build(){stopAudio();queue=context.cards.filter(c=>all||due(c));idx=0;completed=0;show()}
function show(){
  stopAudio();
  stopRecognition();
  resetSpeaking();
  $('difficult-words').hidden = true;
  $('difficult-words-list').replaceChildren();
  $('word-audio-status').textContent = '';
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
  showDifficultWords();
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
function speakDevice(sentence, rate=.85){
  if(!('speechSynthesis' in window)){
    alert('Your browser does not support device speech. Choose Ryan or Thomas in the menu.');
    return;
  }
  const utterance=new SpeechSynthesisUtterance(sentence);
  utterance.lang='en-GB';utterance.rate=rate;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='en-gb');
  if(voice)utterance.voice=voice;
  speechSynthesis.speak(utterance);
}
function speak(){
  const card=queue[idx];if(!card)return;
  stopRecognition();
  stopAudio();
  if(voiceChoice==='device'||card.custom){
    speakDevice(card.en);
    return;
  }
  const collection=context===contexts.work?'work':'home';
  const path='./audio/'+voiceChoice+'/'+collection+'/'+card.id+'.mp3?v=20261106-leadin';
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

// The word choices are curated for each card, not based on a pronunciation
// assessment. Recordings use the currently selected Ryan / Thomas voice.
let wordMode = 'difficult';

function playDifficultWord(word) {
  if (!queue[idx] || reveal < 1 || !context) return;
  const status = $('word-audio-status');
  const rate = Number($('words-speed').value) || 1;
  stopRecognition();
  stopAudio();
  status.textContent = 'Playing: ' + word;
  if (voiceChoice === 'device' || queue[idx].custom) {
    speakDevice(word, rate === 1 ? .85 : .7);
    return;
  }
  const file = './audio/' + voiceChoice + '/words/' + wordAudioSlug(word) + '.mp3?v=20261106-leadin';
  const player = new Audio(file);
  recordedAudio = player;
  player.playbackRate = rate;
  const fail = () => {
    if (recordedAudio !== player) return;
    recordedAudio = null;
    status.textContent = 'Word recording unavailable. Trying device voice.';
    speakDevice(word, rate === 1 ? .85 : .7);
  };
  player.addEventListener('error', fail, {once:true});
  player.addEventListener('ended', () => {
    if (recordedAudio === player) {
      recordedAudio = null;
      status.textContent = '';
    }
  }, {once:true});
  player.play().catch(fail);
}

function showDifficultWords() {
  const card = queue[idx];
  if (!card || !context || reveal < 1) return;
  const collection = context === contexts.work ? 'work' : 'home';
  const words = wordMode === 'all'
    ? sentenceWords(card.en).map(token => token.text)
    : (card.custom ? suggestDifficultWords(card.en) : (practiceWords[collection]?.[String(card.id)] || []));
  const section = $('difficult-words');
  const list = $('difficult-words-list');
  list.replaceChildren();
  $('word-audio-status').textContent = '';
  section.hidden = words.length === 0;
  for (const mode of ['difficult','all']) {
    const button = $('word-mode-' + mode);
    const active = wordMode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  for (const word of words) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'word-audio-button';
    button.textContent = '🔊 ' + word;
    button.setAttribute('aria-label', 'Play isolated word: ' + word);
    button.addEventListener('click', () => playDifficultWord(word));
    list.appendChild(button);
  }
}

for (const mode of ['difficult','all']) {
  $('word-mode-' + mode).addEventListener('click', () => {
    if (wordMode === mode) return;
    wordMode = mode;
    stopAudio();
    showDifficultWords();
  });
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

// Phrase library is stored independently of spaced-repetition history.
// Removing means hiding; the record, ID and any prior ratings are retained.
function updateCollectionTotals(){
  for(const item of [contexts.work,contexts.home]){
    try{
      const state=item===context ? item.phraseState : loadPhraseState(localStorage,item.slug);
      const count=getVisibleCards(item.baseCards,state).length;
      $(item.slug+'-total').textContent=count+' items';
    }catch{
      $(item.slug+'-total').textContent=item.baseCards.length+' built-in items';
    }
  }
}
function closePhraseManager(){
  $('manage-phrases').hidden=true;
  $('review-content').hidden=false;
  $('manage-toggle').classList.remove('active');
}
function openPhraseManager(){
  if(!context)return;
  stopAudio();
  stopRecognition();
  $('manage-phrases').hidden=false;
  $('review-content').hidden=true;
  $('manage-toggle').classList.add('active');
  $('manage-notice').textContent='';
  $('phrase-search').value='';
  renderPhraseManager();
}
function managerMessage(message,error=false){
  $('manage-notice').textContent=message;
  $('manage-notice').classList.toggle('error',error);
}
function commitPhraseChange(next,message){
  // Persist first. Do not update the UI or forget a prior library on failure.
  try{savePhraseState(localStorage,context.slug,next);}
  catch(error){managerMessage('Could not save. Your earlier phrases and history were not changed. '+error.message,true);return;}
  context.phraseState=next;
  context.cards=getVisibleCards(context.baseCards,next);
  updateCollectionTotals();
  build();
  renderPhraseManager();
  managerMessage(message);
}
function renderPhraseManager(){
  if(!context)return;
  const list=$('phrase-list'),filter=$('phrase-search').value.trim().toLowerCase();
  const hidden=new Set(context.phraseState.hidden.map(String));
  list.replaceChildren();
  const cards=getAllCards(context.baseCards,context.phraseState);
  let count=0;
  for(const card of cards){
    if(filter&&!(card.en+' '+card.pt).toLowerCase().includes(filter))continue;
    count++;
    const removed=hidden.has(String(card.id));
    const item=document.createElement('div');item.className='phrase-item';
    const details=document.createElement('div');details.className='phrase-details';
    const english=document.createElement('strong');english.textContent=card.en;
    const portuguese=document.createElement('p');portuguese.textContent=card.pt;
    const meta=document.createElement('span');meta.className='phrase-meta';
    meta.textContent=(card.custom?'Personal':'Built-in')+(removed?' · Removed from study':'');
    details.append(english,portuguese,meta);
    const action=document.createElement('button');action.type='button';
    action.textContent=removed?'Restore':'Remove';
    action.className=removed?'restore-phrase':'remove-phrase';
    action.setAttribute('aria-label',(removed?'Restore':'Remove')+' phrase: '+card.en);
    action.addEventListener('click',()=>{
      if(!context)return;
      if(!removed&&!confirm('Remove this phrase from study?\n\nThe phrase and its review history will be kept. You can restore it here at any time.'))return;
      try{
        const next=setPhraseHidden(context.baseCards,context.phraseState,card.id,!removed);
        commitPhraseChange(next,removed?'Phrase restored, including its previous review schedule.':'Phrase removed from study. Previous reviews were preserved.');
      }catch(error){managerMessage(error.message,true);}
    });
    item.append(details,action);list.appendChild(item);
  }
  if(!count){
    const empty=document.createElement('p');empty.className='manage-empty';
    empty.textContent='No phrases match your search.';
    list.appendChild(empty);
  }
}
$('manage-toggle').addEventListener('click',()=>{
  if($('manage-phrases').hidden)openPhraseManager();else closePhraseManager();
});
$('manage-close').addEventListener('click',closePhraseManager);
$('phrase-search').addEventListener('input',renderPhraseManager);
$('phrase-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!context)return;
  const en=$('new-english').value,pt=$('new-portuguese').value;
  const id='user-'+(globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2));
  try{
    const next=addPhrase(context.baseCards,context.phraseState,en,pt,id);
    const before=context.phraseState;
    commitPhraseChange(next,'Phrase added to '+context.name+'. It is ready for review.');
    if(context.phraseState!==before){
      $('new-english').value='';
      $('new-portuguese').value='';
    }
  }catch(error){managerMessage(error.message,true);}
});

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
updateCollectionTotals();
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
$('reset').addEventListener('click',()=>{
  if (!context || !confirmHistoryClear(context.name, window)) return;
  // This key is written only after both confirmations, never during updates.
  progress = {};
  save();
  build();
});
