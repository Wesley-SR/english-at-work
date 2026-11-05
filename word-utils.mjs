// Keep the same word tokenization and filename convention in the Python MP3 builder.
const TOKEN_PATTERN = /[A-Za-z]+(?:['\u2019][A-Za-z]+)*/g;

export function sentenceWords(sentence) {
  return (String(sentence || '').match(TOKEN_PATTERN) || []).map(token => ({
    text: token,
    slug: wordAudioSlug(token)
  }));
}

export function wordAudioSlug(word) {
  const normalized = String(word || '').toLowerCase().replace(/[\u2019']/g, '_');
  if (!/^[a-z]+(?:_[a-z]+)*$/.test(normalized)) {
    throw new Error('Invalid isolated-word audio token');
  }
  return normalized;
}
