export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const pipe = <T>(value: T, ...fns: Array<(input: T) => T>): T =>
  fns.reduce((acc, fn) => fn(acc), value);

export const groupBy = <T, K extends string | number>(
  items: T[],
  key: (item: T) => K,
): Record<K, T[]> =>
  items.reduce(
    (acc, item) => {
      const k = key(item);
      (acc[k] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );

export const unique = <T>(items: T[]): T[] => [...new Set(items)];

export const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start }, (_, i) => start + i);

export const tryCatch = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
  try {
    return ok(await fn());
  } catch (e) {
    return err(e as Error);
  }
};
