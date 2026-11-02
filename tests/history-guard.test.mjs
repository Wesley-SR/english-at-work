import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmHistoryClear} from '../history-guard.mjs';

test('cancel at first warning protects all review history', () => {
  let secondPromptCalled = false;
  const allowed = confirmHistoryClear('Work', {
    confirm: () => false,
    prompt: () => { secondPromptCalled = true; return 'CLEAR'; }
  });
  assert.equal(allowed, false);
  assert.equal(secondPromptCalled, false);
});

test('cancel at second warning protects all review history', () => {
  const allowed = confirmHistoryClear('Home', {
    confirm: () => true,
    prompt: () => null
  });
  assert.equal(allowed, false);
});

test('mistyped confirmation cannot clear history', () => {
  for (const value of ['clear', 'CLEAR ', '', 'YES', 'Clear']) {
    assert.equal(confirmHistoryClear('Work', {
      confirm: () => true,
      prompt: () => value
    }), false);
  }
});

test('only explicit two-stage approval allows clearing', () => {
  const allowed = confirmHistoryClear('Work', {
    confirm: () => true,
    prompt: () => 'CLEAR'
  });
  assert.equal(allowed, true);
});
