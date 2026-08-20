# Problem 1 — Sum to N

Implement three different JavaScript approaches to calculate the sum from `1` to `n`.

For example:

```text
sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15
```

## Implementations

### `sum_to_n_a` — Iterative

Uses a simple loop to accumulate the values from `1` to `n`.

- Time: **O(n)**
- Space: **O(1)**

### `sum_to_n_b` — Arithmetic Formula

Uses the closed-form arithmetic series formula:

```text
n × (n + 1) / 2
```

- Time: **O(1)**
- Space: **O(1)**

This is the most efficient implementation for the given problem.

### `sum_to_n_c` — Functional

Uses `Array.from()` to create the sequence and `reduce()` to calculate the sum.

- Time: **O(n)**
- Space: **O(n)**

This implementation demonstrates a functional JavaScript approach.

## Testing

All three implementations are verified against the same set of test cases.

Run the tests with:

```bash
node src/problem1/test.js
```

Expected output:

```text
All P1 tests passed.
```

## Files

```text
src/problem1/
├── index.js
├── test.js
└── README.md
```
