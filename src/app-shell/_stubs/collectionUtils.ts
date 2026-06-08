export const getCounter = (n?: number, total?: number): string => {
  if (n == null) return '';
  if (total != null && total !== n) return `(${n}/${total})`;
  return `(${n})`;
};
export default { getCounter };
