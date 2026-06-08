export const hasAnyMatch = (a: string[], b: string[]): boolean => {
  const setB = new Set(b);

  return a.some((item) => setB.has(item));
};

export const normalizeUrlPath = (path: string): string =>
  path.startsWith('/') ? path : `/${path}`;

export const buildBaseUrl = (domain: string, path?: string): string => {
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';

  return `${protocol}://${domain}${path ? normalizeUrlPath(path) : ''}`;
};

export const toLowercaseNoSpaces = (str: string) =>
  str.toLowerCase().replace(/\s+/g, '');
