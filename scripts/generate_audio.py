#!/usr/bin/env python3
"""Generate reusable British-male MP3 clips for the public flashcard decks.

Uses the Edge TTS service at build time; the published app plays static MP3s,
so users do not need an account, API key, or local speech voices. This online
speech service can change or become unavailable; playback has a browser fallback.
"""
import asyncio
import hashlib
import json
import os
import re
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "audio"
INDEX = AUDIO / "manifest.json"
VOICES = {"ryan": "en-GB-RyanNeural", "thomas": "en-GB-ThomasNeural"}
DECKS = {"work": ROOT / "data.js", "home": ROOT / "home-data.js"}
WORDS_SOURCE = ROOT / "practice-words.js"
RATE = "-10%"
CONCURRENCY = 3
# Give speakers / Bluetooth devices time to wake up before the first phoneme.
LEAD_IN_MS = 450


def read_cards(path):
    # Both data files export JSON-compatible JavaScript object arrays.
    content = path.read_text(encoding="utf-8")
    items = json.loads(content.split("=", 1)[1].strip().rstrip(";"))
    if not isinstance(items, list):
        raise ValueError(f"Expected card array: {path}")
    return items


async def main():
    AUDIO.mkdir(exist_ok=True)
    existing = {}
    if INDEX.exists():
        existing = json.loads(INDEX.read_text(encoding="utf-8"))
    latest = {}
    pending = []

    def queue_clip(relative_path, sentence, voice):
        target = AUDIO / relative_path
        previous_digest = hashlib.sha256((voice + "\n" + RATE + "\n" + sentence).encode("utf-8")).hexdigest()
        padded_digest = hashlib.sha256(
            (voice + "\n" + RATE + "\n" + sentence + f"\nlead-in-ms={LEAD_IN_MS}").encode("utf-8")
        ).hexdigest()
        latest[relative_path] = padded_digest
        if existing.get(relative_path) == padded_digest and target.is_file():
            return
        # Existing recordings can be padded locally without requesting all audio
        # from the TTS provider again. Failed workflow runs never commit partial edits.
        pad_existing = existing.get(relative_path) == previous_digest and target.is_file()
        pending.append((relative_path, sentence, voice, pad_existing))

    for name, data_path in DECKS.items():
        for card in read_cards(data_path):
            card_id = str(card["id"])
            if not card_id.isdecimal() or not 0 < int(card_id) < 1000000:
                raise ValueError(f"Invalid card ID: {card_id!r}")
            sentence = card["en"]
            for label, voice in VOICES.items():
                relative_path = f"{label}/{name}/{card_id}.mp3"
                queue_clip(relative_path, sentence, voice)

    # One word recording can be reused across any card containing that word.
    # Curated word choices are shared by the front end and the audio builder.
    raw = WORDS_SOURCE.read_text(encoding="utf-8").strip()
    if not raw.startswith("export const practiceWords = "):
        raise ValueError("Unexpected practice-words.js format")
    word_map = json.loads(raw.split("=", 1)[1].strip().rstrip(";"))
    selected = {}
    for deck, data_path in DECKS.items():
        cards = read_cards(data_path)
        deck_words = word_map.get(deck)
        if not isinstance(deck_words, dict):
            raise ValueError(f"Missing word map for {deck}")
        for card in cards:
            items = deck_words.get(str(card["id"]), [])
            if not isinstance(items, list) or not 1 <= len(items) <= 3 or len(set(items)) != len(items):
                raise ValueError(f"Invalid word selection for {deck}/{card['id']}")
            for word in items:
                if not isinstance(word, str) or not re.fullmatch(r"[a-z]+", word):
                    raise ValueError(f"Unsafe word slug: {word!r}")
                if not re.search(r"(?<![a-z])" + re.escape(word) + r"(?![a-z])", card["en"], re.I):
                    raise ValueError(f"Word {word!r} not in {deck} card {card['id']}")
                selected[word] = word
            # Generate isolated audio for every token in every sentence, including
            # contractions. A word is generated once and shared by all cards.
            for token in re.findall(r"[A-Za-z]+(?:['’][A-Za-z]+)*", card["en"]):
                spoken = token.replace('’', "'")
                slug = spoken.lower().replace("'", "_")
                if not re.fullmatch(r"[a-z]+(?:_[a-z]+)*", slug):
                    raise ValueError(f"Unsafe token slug: {slug!r}")
                # Respect acronym spelling (PID, ECU) and the pronoun 'I'.
                audible = spoken if spoken == 'I' or (len(spoken) > 1 and spoken.isupper()) else spoken.lower()
                if slug not in selected or audible.isupper():
                    selected[slug] = audible
        unknown = set(deck_words) - {str(card["id"]) for card in cards}
        if unknown:
            raise ValueError(f"Unknown card IDs in {deck} word map: {sorted(unknown)}")

    for slug, spoken in sorted(selected.items()):
        for label, voice in VOICES.items():
            relative_path = f"{label}/words/{slug}.mp3"
            queue_clip(relative_path, spoken, voice)

    semaphore = asyncio.Semaphore(CONCURRENCY)

    async def generate(relative_path, sentence, voice, pad_existing):
        target = AUDIO / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        raw = target.with_suffix(".source.partial.mp3")
        padded = target.with_suffix(".padded.partial.mp3")
        async with semaphore:
            for attempt in range(4):
                try:
                    source = target if pad_existing else raw
                    if not pad_existing:
                        await edge_tts.Communicate(sentence, voice, rate=RATE).save(str(raw))
                    if source.stat().st_size < 512:
                        raise RuntimeError(f"Unexpectedly small audio: {source}")

                    # Prepend real silent PCM samples before the MP3 is encoded.
                    # This prevents the first syllable being lost when an output
                    # device needs time to activate. It works on all browsers.
                    process = await asyncio.create_subprocess_exec(
                        "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", str(source),
                        "-af", f"adelay={LEAD_IN_MS}:all=1",
                        "-c:a", "libmp3lame", "-b:a", "48k", str(padded),
                        stdout=asyncio.subprocess.DEVNULL,
                        stderr=asyncio.subprocess.PIPE,
                    )
                    _, errors = await process.communicate()
                    if process.returncode != 0 or not padded.is_file() or padded.stat().st_size < 512:
                        raise RuntimeError(
                            "Could not pad MP3: " + errors.decode("utf-8", errors="replace")[-1000:]
                        )
                    os.replace(padded, target)
                    raw.unlink(missing_ok=True)
                    print(f"Pre-roll {LEAD_IN_MS}ms: audio/{relative_path} ({target.stat().st_size} bytes)", flush=True)
                    return
                except Exception as exc:
                    raw.unlink(missing_ok=True)
                    padded.unlink(missing_ok=True)
                    if attempt == 3:
                        raise RuntimeError(f"Failed to generate {relative_path}") from exc
                    await asyncio.sleep(2 ** attempt + 1)

    print(f"Generating {len(pending)} of {len(latest)} clips.", flush=True)
    await asyncio.gather(*(generate(*job) for job in pending))

    # Remove audio for cards that were deleted.
    for old in set(existing) - set(latest):
        candidate = AUDIO / old
        if candidate.is_file():
            candidate.unlink()
    INDEX.write_text(json.dumps(latest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print("All requested male-voice clips are ready.", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
