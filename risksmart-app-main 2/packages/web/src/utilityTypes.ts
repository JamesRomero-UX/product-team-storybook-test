export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function notEmpty<TValue>(
  value: null | TValue | undefined
): value is TValue {
  return value !== null && value !== undefined;
}
