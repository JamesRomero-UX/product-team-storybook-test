export function toPositiveIntOrNull(input: string): number | null {
  if (typeof input !== 'string') {
    return null;
  }

  const s = input.trim();
  if (!/^(?:[1-9]\d*)$/.test(s)) {
    return null;
  }

  const n = Number(s);

  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
