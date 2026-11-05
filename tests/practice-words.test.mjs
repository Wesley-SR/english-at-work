import test from 'node:test';
import assert from 'node:assert/strict';
import {cards as workCards} from '../data.js';
import {homeCards} from '../home-data.js';
import {practiceWords} from '../practice-words.js';

test('each existing card offers one to three difficult words, in that sentence', () => {
  for (const [collection,cards] of [['work',workCards],['home',homeCards]]) {
    const map = practiceWords[collection];
    assert.ok(map, 'word map exists for '+collection);
    assert.equal(Object.keys(map).length,cards.length,'all cards mapped in '+collection);
    for (const card of cards) {
      const words=map[card.id];
      assert.ok(Array.isArray(words),collection+' card '+card.id+' has word list');
      assert.ok(words.length>=1 && words.length<=3,'1-3 words per card '+card.id);
      assert.equal(new Set(words).size,words.length,'no duplicates per card');
      const sentenceWords=new Set(card.en.toLowerCase().match(/[a-z]+/g)||[]);
      for (const word of words) {
        assert.match(word,/^[a-z]+$/,'safe MP3 filename '+word);
        assert.ok(sentenceWords.has(word),word+' appears in '+collection+' card '+card.id);
      }
    }
  }
});

test('difficult-word recordings are deduplicated across cards and collections', () => {
  const all=Object.values(practiceWords).flatMap(collection => Object.values(collection).flat());
  const unique=new Set(all);
  assert.ok(unique.size>0 && unique.size<all.length, 'some words reused');
  assert.ok(unique.has('reliability'));
  assert.ok(unique.has('combustion'));
  assert.ok(unique.has('straightforward'));
});
