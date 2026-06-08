const HTTPS_PREFIX = 'https://';

export const formatUrl = (url: string): string => {
  if (!url) {
    return '';
  }

  const trimmedUrl = url.trim();

  return trimmedUrl.toLowerCase().startsWith(HTTPS_PREFIX)
    ? trimmedUrl
    : `${HTTPS_PREFIX}${trimmedUrl.replace(/^http:\/\//i, '')}`;
};
