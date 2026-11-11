# Review Panel — English at Work

## Everyday questions for colleagues

The **Work** deck now has **56 active cards**: 46 unchanged existing cards and ten new questions with stable IDs **75–84**. The new material covers asking for help, requesting opinions, discussing technical issues, and coordinating work. **Home remains unchanged at 15 cards.**

Each new question has a Portuguese translation, an expandable list of every word for individual listening, and pre-generated Ryan and Thomas British male MP3s using the existing 450 ms lead-in. The audio builder reuses recordings across phrases where possible.

All previously assigned IDs (including retired IDs 21–48) stay reserved; original Work cards and ratings retain their IDs. Both review history keys remain `english-at-work-progress-v1` and `english-at-home-progress-v1`. This update does not clear, migrate, or overwrite review data.

## General-purpose Work practice

The **Work** collection contains **46 active cards**, **39 retained** from the previous release (original IDs 1–20 and 49–67), plus **seven new general-purpose sentences** with IDs **68–74** and Portuguese translations. The prior *Freeze Lambda Control* presentation cards with IDs **21–48** are no longer part of the active deck, and their IDs are never reassigned. **Home remains unchanged (15 cards)**.

This deck update preserves the existing spaced-review keys (`english-at-work-progress-v1` and `english-at-home-progress-v1`) and does not clear or migrate browser localStorage. Reviews for retained card IDs are preserved; previous review entries for inactive IDs can remain in browser storage but are not displayed. The Git history and original phrase versions remain available for rollback.

The seven new phrases have prerecorded Ryan/Thomas MP3s, the same 450 ms silent lead-in as the rest of the deck, and individual playback of every word.

## Audio reliability — first syllable

All prerecorded Ryan/Thomas MP3 clips (full sentences and isolated words) are built with **450 ms of silent audio at the beginning**. This helps speakers and Bluetooth headsets activate before the first spoken sound; no word or sentence text is changed.

The audio build uses FFmpeg to pad existing clips without requesting new TTS synthesis for unchanged content. A version parameter in `app.js` forces browsers to fetch the updated clips rather than use stale cached copies. Review progress stays in the original localStorage keys, and the two-stage Clear history guard is unchanged.

This reduces device-related startup clipping, but cannot guarantee that every output device or synthesis service will always reproduce the beginning perfectly.

A discreet, audio-first flashcard trainer with Work and Home collections. Listen with pre-generated British male recordings (Ryan or Thomas), optionally type an answer, reveal the English and Portuguese text, and grade a card for spaced review.

## Word practice — listen to any word

The study view stays **audio-first** until **Show text** is clicked. After English text is revealed, the complete list of words from the current sentence appears immediately, in order, including repetitions and contractions. Each word has its own repeatable play button.

- There are no longer separate **Difficult words** or **All words** tabs.
- One accessible **Hide words / Show words** button collapses or expands the entire word list and speed selector. Each new card starts with the list expanded after revealing English.
- **Normal / Slow** word playback remains available. Recordings use the selected Ryan or Thomas British male voice (or device voice when selected).
- Existing word recordings and curated metadata may remain in the repository as assets, but the app displays **every** word, not a selection.
- The review history, grading schedule, Speaking Practice, audio-first behavior and double-confirmation Clear history guard are unchanged.

## Experimental Speaking Practice branch

Branch: `feature/speaking-practice-free`.

The **Speak** button next to the audio player launches your browser's speech recognition for the current English card. When a final transcript is available, the app compares the **recognized words** with the English sentence, reporting text agreement and words that are different or missing.

- British English recognition (`en-GB`); recognize a single sentence at a time.
- You must click **Speak** and grant microphone permission. **Stop** ends the session.
- Unavailable speech recognition disables the control and explains browser support.
- Correct English text is revealed after the speaking attempt, but rating remains your decision.
- Changing cards, leaving a collection, or playing another audio clip stops active recognition.
- **Clear history requires two deliberate confirmations**: accept the first warning and type the exact word `CLEAR` in the second dialog. Canceling either step keeps all saved progress.
- The analysis is **not a phonetic pronunciation assessment**. Text recognition can succeed despite pronunciation issues, or fail due to accents, noise, and browser errors.

### Privacy

**Browser speech recognition can send microphone audio to an external recognition provider, even though this site is static.** Only use Speak if you agree to your browser's processing and avoid speaking confidential content. The app does not upload speech to a server of its own, save microphone recordings, save transcripts, or include them in review history. Whether the browser or its speech provider processes or retains data depends on that provider.

### Browser compatibility

The Web Speech recognition API is available in some browser versions (commonly Chrome or Edge); compatibility and microphone availability vary by device, browser, permission settings, and network access. Unsupported browsers continue to support flashcard review and prerecorded audio.

## Run locally

```sh
python -m http.server 8000
```

Visit `http://localhost:8000`; allow the microphone if prompted when you click Speak. Microphone APIs require a secure context (HTTPS or localhost).

## Tests

```sh
node --test tests/speaking.test.mjs
```

Unit tests cover punctuation, contractions, substitutions, omitted words and empty results. Speech-recognition behavior depends on the user's browser/device, so it also needs a manual microphone test.

### Keeping your review history safe

The existing Work and Home progress keys remain unchanged. The app does not clear, migrate, or overwrite prior reviews when a feature is updated or merged. Review progress is still stored in your **current browser's localStorage**, not in GitHub: changing devices/browsers or clearing browser site data can lose the data. The destructive Clear history action is deliberately guarded by two confirmations.

## GitHub Pages and release

GitHub Pages serves **main** at https://wesley-sr.github.io/english-at-work/. Changes to this feature branch do **not** publish to the live site until merged into main.

Review history remains in the same browser-local storage keys: `english-at-work-progress-v1` and `english-at-home-progress-v1`. The voice setting is stored separately in `review-panel-recorded-voice-v2`. Neither data nor progress is migrated by this feature.

The `.github/workflows/generate-male-audio.yml` workflow generates British male voice MP3s for newly added cards on main. The experimental speaking feature itself does not require any paid API keys.
