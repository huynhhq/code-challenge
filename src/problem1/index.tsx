// Using a Loop
const sum_to_n_a = (n: number): number => {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Using Recursion
const sum_to_n_b = (n: number): number => {
  if (n === 0) return 0;
  return n + sum_to_n_b(n - 1);
};

// Using an Array and reduce()
const sum_to_n_c = (n: number): number => {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, curr) => acc + curr,
    0
  );
};

console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));
