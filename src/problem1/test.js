const { sum_to_n_a, sum_to_n_b } = require("./index");

const testCases = [
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: 5, expected: 15 },
  { input: 10, expected: 55 },
];

for (const { input, expected } of testCases) {
  const resultA = sum_to_n_a(input);
  const resultB = sum_to_n_b(input);

  if (resultA !== expected) {
    throw new Error(
      `sum_to_n_a(${input}): expected ${expected}, got ${resultA}`,
    );
  }

  if (resultB !== expected) {
    throw new Error(
      `sum_to_n_b(${input}): expected ${expected}, got ${resultB}`,
    );
  }
}

console.log("All current tests passed.");
