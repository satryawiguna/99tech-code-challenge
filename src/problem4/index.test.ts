import assert from "node:assert/strict";
import test from "node:test";

import { sumToNFormula, sumToNIterative, sumToNRecursive } from "./index.js";

const implementations = [
  ["iterative", sumToNIterative],
  ["formula", sumToNFormula],
  ["recursive", sumToNRecursive],
] as const;

test("all implementations return 0 for n = 0", () => {
  for (const [, implementation] of implementations) {
    assert.strictEqual(implementation(0), 0);
  }
});

test("all implementations return 1 for n = 1", () => {
  for (const [, implementation] of implementations) {
    assert.strictEqual(implementation(1), 1);
  }
});

test("all implementations return 15 for n = 5", () => {
  for (const [, implementation] of implementations) {
    assert.strictEqual(implementation(5), 15);
  }
});

test("all implementations return 55 for n = 10", () => {
  for (const [, implementation] of implementations) {
    assert.strictEqual(implementation(10), 55);
  }
});

test("all implementations return 5050 for n = 100", () => {
  for (const [, implementation] of implementations) {
    assert.strictEqual(implementation(100), 5050);
  }
});

test("all implementations reject negative numbers", () => {
  for (const [, implementation] of implementations) {
    assert.throws(() => implementation(-1));
  }
});

test("all implementations reject decimal numbers", () => {
  for (const [, implementation] of implementations) {
    assert.throws(() => implementation(1.5));
  }
});

test("all implementations reject NaN", () => {
  for (const [, implementation] of implementations) {
    assert.throws(() => implementation(Number.NaN));
  }
});

test("all implementations reject Infinity", () => {
  for (const [, implementation] of implementations) {
    assert.throws(() => implementation(Number.POSITIVE_INFINITY));
  }
});
