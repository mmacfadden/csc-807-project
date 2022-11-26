
const val = 200;
let start = performance.now();
const orig = [...Array(8)].map((x, i) => val >> i & 1).reverse();


console.log(performance.now() - start);

console.log(JSON.stringify(orig));

start = performance.now();
let fast = [
  val >> 7 & 1,
  val >> 6 & 1,
  val >> 5 & 1,
  val >> 4 & 1,
  val >> 3 & 1,
  val >> 2 & 1,
  val >> 1 & 1,
  val >> 0 & 1,
    ];
console.log(performance.now() - start);

console.log(JSON.stringify(fast));