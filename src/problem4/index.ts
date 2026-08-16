/**
 * Validates the input for the sum-to-n functions.
 *
 * The challenge assumes n is a non-negative integer.
 */
function validateInput(n: number): void {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error("n must be a non-negative integer");
  }

  if (!Number.isSafeInteger(n)) {
    throw new Error("n must be a safe integer");
  }
}

/**
 * Calculates the sum of all integers from 1 to n using iteration.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
export function sumToNIterative(n: number): number {
  validateInput(n);

  let sum = 0;

  for (let current = 1; current <= n; current++) {
    sum += current;
  }

  return sum;
}

/**
 * Calculates the sum of all integers from 1 to n using Gauss' formula.
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
export function sumToNFormula(n: number): number {
  validateInput(n);

  return (n * (n + 1)) / 2;
}

/**
 * Calculates the sum of all integers from 1 to n using recursion.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
export function sumToNRecursive(n: number): number {
  validateInput(n);

  return sumRecursive(n);
}

function sumRecursive(n: number): number {
  if (n === 0) {
    return 0;
  }

  return n + sumRecursive(n - 1);
}
