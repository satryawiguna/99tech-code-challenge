var sum_to_n_a = function (n) {
  let sum = 0;

  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
};

module.exports = {
  sum_to_n_a,
};
