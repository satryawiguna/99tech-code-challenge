# Problem 4 — Three Ways to Sum to n

## Overview

This solution implements three different approaches for calculating the sum of all integers from `1` to `n`.

For example:

```text
Input: 5
Output: 15

1 + 2 + 3 + 4 + 5 = 15
```

The three implementations demonstrate different algorithmic approaches:

1. Iterative
2. Mathematical formula
3. Recursive

All implementations share the same input contract and are tested against the same set of valid and invalid inputs.

---

## Implementations

### 1. Iterative Approach

The iterative implementation calculates the sum by traversing from `1` through `n` and accumulating the result.

```text
sum = 0

for each number from 1 to n:
    sum += number
```

**Complexity**

- Time: `O(n)`
- Space: `O(1)`

This approach is straightforward, easy to understand, and does not rely on recursion.

---

### 2. Mathematical Formula

The mathematical implementation uses the well-known arithmetic series formula:

```text
n × (n + 1) / 2
```

For example:

```text
5 × 6 / 2 = 15
```

**Complexity**

- Time: `O(1)`
- Space: `O(1)`

This is the most efficient implementation in terms of algorithmic complexity because the number of operations does not increase as `n` grows.

---

### 3. Recursive Approach

The recursive implementation defines the problem as:

```text
sum(n) = n + sum(n - 1)
```

with `0` as the base case:

```text
sum(0) = 0
```

For example:

```text
sum(5)
= 5 + sum(4)
= 5 + 4 + sum(3)
= 5 + 4 + 3 + sum(2)
= ...
= 15
```

**Complexity**

- Time: `O(n)`
- Space: `O(n)`

The additional space is caused by recursive function calls remaining on the call stack until the base case is reached.

Although this approach is useful for demonstrating recursion, it is less suitable for large values of `n` because of JavaScript/Node.js call-stack limitations.

---

## Complexity Comparison

| Approach     |   Time |  Space | Notes                                                |
| ------------ | -----: | -----: | ---------------------------------------------------- |
| Iterative    | `O(n)` | `O(1)` | Simple and avoids recursion overhead                 |
| Mathematical | `O(1)` | `O(1)` | Most efficient algorithmically                       |
| Recursive    | `O(n)` | `O(n)` | Demonstrates recursion but consumes call-stack space |

For this particular problem, the **mathematical approach is the preferred implementation** when the result can be safely represented by JavaScript's `Number` type.

---

## Input Contract

The implementations accept:

- Non-negative integers
- Safe JavaScript integers

Examples of valid input:

```text
0
1
5
10
100
```

The implementations reject:

- Negative numbers
- Decimal numbers
- `NaN`
- `Infinity`
- Unsafe integers

Invalid inputs result in an error.

---

## JavaScript Number Limitation

JavaScript uses IEEE 754 double-precision floating-point numbers for its `Number` type.

Although `Number.MAX_SAFE_INTEGER` defines the largest integer that can be represented safely:

```text
9,007,199,254,740,991
```

the resulting sum can exceed this safe range even when the input itself is a safe integer.

For example:

```text
n × (n + 1) / 2
```

can produce a value that is technically recognized as an integer by JavaScript but is no longer guaranteed to be represented exactly.

Therefore, the implementation intentionally keeps the `number`-based contract required by the challenge rather than introducing `BigInt`.

For applications requiring arbitrary-precision integer results, a `BigInt`-based implementation would be more appropriate.

---

## Testing

The solution includes automated tests covering:

### Valid inputs

- `0`
- `1`
- `5`
- `10`
- `100`

### Invalid inputs

- Negative numbers
- Decimal numbers
- `NaN`
- `Infinity`
- Unsafe integers

All three implementations are tested against the same scenarios to ensure consistent behaviour.

Run the test suite with:

```bash
npm test
```

Build the TypeScript source with:

```bash
npm run build
```

---

## Design Decisions

The implementations intentionally share a common input validation function to keep validation logic consistent and avoid duplication.

The recursive implementation uses a private helper so that input validation occurs only once before recursion begins.

The solution uses TypeScript's strict type checking and Node.js's built-in test runner without introducing an additional testing framework for this relatively small problem.

---

## Conclusion

Each implementation demonstrates a different trade-off:

- **Iterative** — simple, predictable, and memory efficient.
- **Mathematical** — optimal in time and space for this problem.
- **Recursive** — conceptually elegant but less practical for large inputs because of call-stack usage.

For production use, the mathematical approach would generally be preferred when the input and resulting value remain within the safe numeric range of JavaScript's `Number` type.
