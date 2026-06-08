export function isTableName<
  T extends { table: { name: string } },
  K extends string,
>(
  t: T,
  k: K
): t is T extends { table: { name: infer N } }
  ? K extends N
    ? T
    : never
  : never {
  return t.table.name === k;
}
