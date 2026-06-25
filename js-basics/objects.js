const user = {
  name: 'Ada',
  address: { city: 'London', zip: '12345' },
  roles: ['admin', 'user'],
};

const { name, address: { city }, roles: [primaryRole] } = user;

const withEmail = { ...user, email: 'ada@example.com' };

const safeZip = user?.address?.zip ?? 'unknown';
const missing = user?.contact?.phone ?? 'no phone';

const entries = Object.entries({ a: 1, b: 2, c: 3 });
const fromPairs = Object.fromEntries(entries.map(([k, v]) => [k, v * 10]));

const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => keys.includes(k)));

const omit = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

const counts = ['a', 'b', 'a', 'c', 'b', 'a'].reduce((acc, x) => {
  acc.set(x, (acc.get(x) ?? 0) + 1);
  return acc;
}, new Map());

console.log({ name, city, primaryRole, safeZip, missing });
console.log(withEmail);
console.log(fromPairs);
console.log(pick(user, ['name', 'roles']));
console.log(omit(user, ['address']));
console.log(Object.fromEntries(counts));
