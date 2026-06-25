export const arrToObj = <T extends string>(arr: T[]) => {
  const obj = {} as Record<string, string>;
  arr.forEach((item) => (obj[item] = item));
  return obj as Record<string, T>;
};
