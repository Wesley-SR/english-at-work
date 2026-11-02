import test from "node:test";
import assert from "node:assert/strict";
import { compareSpeech, tokenizeForComparison } from "../speaking.mjs";

test("expands common contractions and ignores punctuation", () => {
  assert.deepEqual(tokenizeForComparison("I'll, we're. Won’t!"), ["i", "will", "we", "are", "will", "not"]);
  const r = compareSpeech("I'll give you an overview.", "I will give you an overview");
  assert.equal(r.textMatch, 100);
  assert.equal(r.missing.length, 0);
});

test("marks omitted words without losing later alignment", () => {
  const r = compareSpeech("We need to test the system", "We test the system");
  assert.deepEqual(r.missing, ["need", "to"]);
  assert.deepEqual(r.unexpected, []);
  assert.equal(r.matched, 4);
});

test("reports substitutions, extras, and exact matches separately", () => {
  const r = compareSpeech("The system is ready", "The system was ready today");
  assert.ok(r.missing.includes("is"));
  assert.ok(r.unexpected.includes("was"));
  assert.ok(r.unexpected.includes("today"));
  assert.equal(r.matched, 3);
});

test("returns 0 rather than a false success on an empty recording", () => {
  const r = compareSpeech("Please try again", "");
  assert.equal(r.textMatch, 0);
  assert.equal(r.missing.length, 3);
});

test("normalizes mixed punctuation and case", () => {
  const r = compareSpeech("With that in mind, let's move on.", "WITH THAT IN MIND LET US MOVE ON");
  assert.equal(r.textMatch, 100);
});
