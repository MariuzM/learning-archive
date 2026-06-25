const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const fetchUser = (id) => delay(50, { id, name: `user-${id}` });

const retry = async (fn, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts - 1) throw e;
    }
  }
};

const mapLimit = async (items, limit, fn) => {
  const results = [];
  const queue = [...items.entries()];
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const [i, item] = queue.shift();
      results[i] = await fn(item);
    }
  });
  await Promise.all(workers);
  return results;
};

const main = async () => {
  const users = await Promise.all([1, 2, 3].map(fetchUser));
  console.log('parallel', users);

  const winner = await Promise.race([delay(30, 'fast'), delay(60, 'slow')]);
  console.log('race', winner);

  let flaky = 0;
  const value = await retry(async () => {
    flaky++;
    if (flaky < 2) throw new Error('not yet');
    return 'ok';
  });
  console.log('retry', value, 'after', flaky, 'tries');

  const limited = await mapLimit([1, 2, 3, 4, 5], 2, (n) => delay(20, n * 10));
  console.log('mapLimit', limited);
};

main();
