const nums = [5, 2, 9, 1, 7, 3, 8, 4, 6];

const doubled = nums.map((n) => n * 2);
const evens = nums.filter((n) => n % 2 === 0);
const total = nums.reduce((acc, n) => acc + n, 0);
const sorted = [...nums].sort((a, b) => a - b);
const firstBig = nums.find((n) => n > 6);
const allPositive = nums.every((n) => n > 0);
const anyEven = nums.some((n) => n % 2 === 0);

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const unique = (arr) => [...new Set(arr)];

const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});

const people = [
  { name: 'Ada', team: 'a' },
  { name: 'Linus', team: 'b' },
  { name: 'Grace', team: 'a' },
];

console.log({ doubled, evens, total, sorted, firstBig, allPositive, anyEven });
console.log(chunk(nums, 4));
console.log(unique([1, 1, 2, 3, 3, 3]));
console.log(groupBy(people, (p) => p.team));
