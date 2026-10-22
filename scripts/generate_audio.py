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
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "audio"
INDEX = AUDIO / "manifest.json"
VOICES = {"ryan": "en-GB-RyanNeural", "thomas": "en-GB-ThomasNeural"}
DECKS = {"work": ROOT / "data.js", "home": ROOT / "home-data.js"}
RATE = "-10%"
CONCURRENCY = 3


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
    for name, data_path in DECKS.items():
        for card in read_cards(data_path):
            card_id = str(card["id"])
            if not card_id.isdecimal() or not 0 < int(card_id) < 1000000:
                raise ValueError(f"Invalid card ID: {card_id!r}")
            sentence = card["en"]
            for label, voice in VOICES.items():
                relative_path = f"{label}/{name}/{card_id}.mp3"
                digest = hashlib.sha256((voice + "\n" + RATE + "\n" + sentence).encode("utf-8")).hexdigest()
                latest[relative_path] = digest
                if existing.get(relative_path) != digest or not (AUDIO / relative_path).is_file():
                    pending.append((relative_path, sentence, voice))

    semaphore = asyncio.Semaphore(CONCURRENCY)

    async def generate(relative_path, sentence, voice):
        target = AUDIO / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix(".partial.mp3")
        async with semaphore:
            for attempt in range(4):
                try:
                    await edge_tts.Communicate(sentence, voice, rate=RATE).save(str(temporary))
                    if temporary.stat().st_size < 512:
                        raise RuntimeError(f"Unexpectedly small audio: {temporary}")
                    os.replace(temporary, target)
                    print(f"Generated: audio/{relative_path} ({target.stat().st_size} bytes)", flush=True)
                    return
                except Exception as exc:
                    temporary.unlink(missing_ok=True)
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
