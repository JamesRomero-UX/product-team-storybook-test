export function notEmpty<TValue>(
  value: null | TValue | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

type Indices<L extends number, T extends number[] = []> = T['length'] extends L
  ? T[number]
  : Indices<L, [T['length'], ...T]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LengthAtLeast<T extends readonly any[], L extends number> = Pick<
  Required<T>,
  Indices<L>
>;

/**
 * Typeguard to ensure correct type when accessing items in an array when noUncheckedIndexedAccess typescript setting is enabled
 * @param arr
 * @param len
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasLengthAtLeast<T extends readonly any[], L extends number>(
  arr: T,
  len: L
): arr is T & LengthAtLeast<T, L> {
  return arr.length >= len;
}
