export const getFriendlyId = (_type?: string, n?: string | number): string =>
  n != null ? String(n) : 'R-001';
export default getFriendlyId;
