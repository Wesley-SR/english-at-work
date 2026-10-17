# English at Work

A mobile-friendly English → Portuguese flashcard app focused on practical engineering vocabulary.

## Features
- Flip cards: English on front, Portuguese translation on back
- Listen to English using browser text-to-speech (prefers British English when installed)
- Rate memory: Again / Hard / Good / Easy
- Review due cards using simple spaced repetition
- Store your review progress locally in your browser
- Study all 13 starter sentences, including *total mileage*

## Run locally
Use a simple local server from the repository directory:

```sh
python -m http.server 8000
```

Visit http://localhost:8000.

## Publish with GitHub Pages
Open **Settings → Pages** in this repository; choose **Deploy from a branch**, branch **main**, folder **/(root)**, then save. The expected address is https://wesley-sr.github.io/english-at-work/ once publishing finishes.

## Audio notes
This version uses the browser's speech synthesis; it does not include recorded MP3 files yet. To add a consistent British voice, generate or record audio with appropriate usage rights and store it in `audio/`, then update `speak()` in `app.js` to play each card's audio with the browser voice as fallback.

## Privacy and progress
Study progress is stored only in your browser's `localStorage`. There is no server login or cross-device synchronization yet. Clearing browser data resets progress.
