export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export const stub = <T>(value: RecursivePartial<T>): T => {
  return value as T;
};
