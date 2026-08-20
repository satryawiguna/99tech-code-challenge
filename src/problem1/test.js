const { sum_to_n_a } = require("./index");

const result = sum_to_n_a(5);

if (result !== 15) {
  throw new Error(`Expected 15, got ${result}`);
}

console.log("sum_to_n_a: passed");
