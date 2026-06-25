export type Schema<T> = {
  initialValues: Partial<T>;
  validate: { [K in keyof Partial<T>]: (v: T[K]) => null | string };
};
