const counter = () => {
  let n = 0;
  return {
    inc: () => ++n,
    dec: () => --n,
    value: () => n,
  };
};

const once = (fn) => {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
};

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

const curry = (fn) => {
  const collect = (args) =>
    args.length >= fn.length ? fn(...args) : (...next) => collect([...args, ...next]);
  return (...args) => collect(args);
};

const slowSquare = (n) => {
  for (let i = 0; i < 1e6; i++);
  return n * n;
};

const c = counter();
c.inc();
c.inc();
c.dec();

const init = once(() => 'started');
const add3 = curry((a, b, c) => a + b + c);
const fastSquare = memoize(slowSquare);

console.log(c.value());
console.log(init(), init());
console.log(add3(1)(2)(3), add3(1, 2)(3), add3(1, 2, 3));
console.log(fastSquare(12), fastSquare(12));
