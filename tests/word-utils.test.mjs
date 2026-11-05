import test from 'node:test';
import assert from 'node:assert/strict';
import {sentenceWords, wordAudioSlug} from '../word-utils.mjs';
import {cards as workCards} from '../data.js';
import {homeCards} from '../home-data.js';
import {practiceWords} from '../practice-words.js';

test('preserve word order including repetitions and strip punctuation', () => {
  assert.deepEqual(sentenceWords("We need to test; we need to learn.").map(x=>x.text),
    ['We','need','to','test','we','need','to','learn']);
});

test('contractions have stable word audio slugs', () => {
  assert.deepEqual(sentenceWords("I'll check that, and you’d help.").map(x=>x.slug),
    ['i_ll','check','that','and','you_d','help']);
  assert.equal(wordAudioSlug("Kernel's"), 'kernel_s');
  assert.throws(()=>wordAudioSlug('../secrets'));
});

test('all existing Work and Home cards expose every word for isolated playback', () => {
  for (const [deck,cards] of [['work',workCards],['home',homeCards]]) {
    for (const card of cards) {
      const tokens=sentenceWords(card.en);
      assert.ok(tokens.length>=2, deck+' '+card.id);
      assert.equal(tokens.map(x=>x.text).join(' '),
        (card.en.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).join(' '));
      for (const highlighted of practiceWords[deck][card.id]) {
        assert.ok(tokens.some(token=>token.slug === highlighted),
          'curated word '+highlighted+' present in all words for '+deck+' '+card.id);
      }
    }
  }
});
