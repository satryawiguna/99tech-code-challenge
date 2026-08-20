const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require("./index");

const testCases = [
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: 5, expected: 15 },
  { input: 10, expected: 55 },
  { input: 100, expected: 5050 },
];

const implementations = [
  ["sum_to_n_a", sum_to_n_a],
  ["sum_to_n_b", sum_to_n_b],
  ["sum_to_n_c", sum_to_n_c],
];

for (const [name, implementation] of implementations) {
  for (const { input, expected } of testCases) {
    const actual = implementation(input);

    if (actual !== expected) {
      throw new Error(`${name}(${input}): expected ${expected}, got ${actual}`);
    }
  }
}

console.log("All current tests passed.");
