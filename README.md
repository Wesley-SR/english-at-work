# Review Panel — English at Work

A discreet, audio-first flashcard trainer with Work and Home collections. Listen with pre-generated British male recordings (Ryan or Thomas), optionally type an answer, reveal the English and Portuguese text, and grade a card for spaced review.

## Difficult words — isolated British audio

When an English flashcard is revealed with **Show text**, a compact **Difficult words** panel suggests one to three challenging words from that card. Tap a word to hear it alone, tap it again to repeat, or choose **Slow** (0.8×) to practise pronunciation more carefully.

- The highlighted word list is curated per card in `practice-words.js`, not estimated from the user's speech.
- The word recordings use the **same selected British male voice** (Ryan or Thomas) as full sentences. Each word MP3 is reused across cards and decks.
- Existing review answers, grades, sentence audio, and the microphone practice flow are unchanged.
- The panel appears **only after revealing the English text**, so it does not spoil audio-first recall.
- No microphone access or network API call is needed for isolated word playback: all generated MP3s are static site assets.
- The browser's device-voice option is also supported. If a word recording cannot be loaded, the app explains the issue and tries device speech synthesis.
- Existing progress keys and the double confirmation for Clear history are preserved.

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
