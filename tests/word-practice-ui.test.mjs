import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sentenceWords} from '../word-utils.mjs';
import {cards as workCards} from '../data.js';
import {homeCards} from '../home-data.js';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('one accessible Show/Hide control replaces both word tabs',()=>{
  assert.match(html,/id="words-toggle"[^>]*aria-expanded="true"[^>]*aria-controls="word-practice-content"/);
  assert.match(html,/id="word-practice-content"/);
  assert.match(html,/id="word-practice-list"/);
  assert.match(html,/Hide words/);
  assert.doesNotMatch(html,/id="word-mode-(?:difficult|all)"/);
  assert.doesNotMatch(html,/Difficult words/);
  assert.doesNotMatch(app,/showDifficultWords|wordMode|word-mode-/);
});

test('list renders each word without filtering and expands after Show text',()=>{
  assert.match(app,/const firstReveal = reveal === 0/);
  assert.match(app,/if\(firstReveal\)showAllWords\(\)/);
  assert.match(app,/const words = sentenceWords\(card\.en\)\.map\(token => token\.text\)/);
  assert.match(app,/panel\.hidden = !show/);
  assert.match(app,/show \? 'Hide words' : 'Show words'/);
  assert.match(app,/setAttribute\('aria-expanded', String\(show\)\)/);
  assert.match(app,/for \(const word of words\)/);
  assert.match(app,/playIsolatedWord\(word\)/);
  assert.match(app,/if \(!show\) \{\s*stopAudio\(\)/);
  assert.match(app,/\$\('word-practice'\)\.hidden = true/);
  assert.match(app,/\$\('word-practice-content'\)\.hidden = false/);
  for(const card of [...workCards,...homeCards]){
    const original=card.en.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[];
    assert.deepEqual(sentenceWords(card.en).map(w=>w.text),original,'all words of '+card.id+' kept in order');
  }
});

test('existing schedule, history and audio mode remain intact',()=>{
  assert.match(app,/english-at-work-progress-v1/);
  assert.match(app,/english-at-home-progress-v1/);
  assert.match(app,/confirmHistoryClear\(context\.name, window\)/);
  assert.match(app,/function grade\(kind\)/);
  assert.match(app,/function startRecognition\(\)/);
  assert.match(app,/wordAudioSlug\(word\)/);
  assert.match(app,/voiceChoice === 'device'/);
});
