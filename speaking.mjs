// Text-only speech-recognition comparison. This is not a phonetic pronunciation score.
const CONTRACTIONS = {
  "i'm": "i am", "i've": "i have", "i'll": "i will", "i'd": "i would",
  "we're": "we are", "we've": "we have", "we'll": "we will", "we'd": "we would",
  "you're": "you are", "you've": "you have", "you'll": "you will",
  "they're": "they are", "they've": "they have", "they'll": "they will",
  "he's": "he is", "she's": "she is", "it's": "it is", "that's": "that is",
  "there's": "there is", "what's": "what is", "let's": "let us",
  "don't": "do not", "doesn't": "does not", "didn't": "did not",
  "won't": "will not", "can't": "cannot", "cannot": "cannot",
  "isn't": "is not", "aren't": "are not", "wasn't": "was not",
  "weren't": "were not", "haven't": "have not", "hasn't": "has not",
  "hadn't": "had not", "wouldn't": "would not", "couldn't": "could not",
  "shouldn't": "should not", "mustn't": "must not"
};

export function tokenizeForComparison(text) {
  const words = String(text || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .match(/[a-z0-9]+(?:'[a-z0-9]+)*/g) || [];
  return words.flatMap(word => (CONTRACTIONS[word] || word).split(" "));
}

export function compareSpeech(expectedText, heardText) {
  const expected = tokenizeForComparison(expectedText);
  const heard = tokenizeForComparison(heardText);
  const n = expected.length, m = heard.length;
  const cost = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n; i >= 0; i--) {
    for (let j = m; j >= 0; j--) {
      if (i === n) cost[i][j] = m - j;
      else if (j === m) cost[i][j] = n - i;
      else if (expected[i] === heard[j]) cost[i][j] = cost[i + 1][j + 1];
      else cost[i][j] = 1 + Math.min(cost[i + 1][j + 1], cost[i + 1][j], cost[i][j + 1]);
    }
  }

  const missing = [], unexpected = [];
  let matched = 0, i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && expected[i] === heard[j] && cost[i][j] === cost[i + 1][j + 1]) {
      matched++; i++; j++;
    } else if (i < n && j < m && cost[i][j] === 1 + cost[i + 1][j + 1]) {
      missing.push(expected[i++]);
      unexpected.push(heard[j++]);
    } else if (i < n && cost[i][j] === 1 + cost[i + 1][j]) {
      missing.push(expected[i++]);
    } else if (j < m) {
      unexpected.push(heard[j++]);
    }
  }

  const total = Math.max(n, m, 1);
  return {
    matched,
    expectedCount: n,
    heardCount: m,
    missing,
    unexpected,
    // Token alignment estimate, not a phoneme score or a speaking-ability grade.
    textMatch: Math.round((1 - cost[0][0] / total) * 100)
  };
}
