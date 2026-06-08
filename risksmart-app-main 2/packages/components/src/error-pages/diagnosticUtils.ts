export const maskUrl = (url: string | undefined): string => {
  if (!url) {
    return '';
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (host.length <= 15) {
      return host;
    }

    return host.substring(0, 10) + '...' + host.substring(host.length - 6);
  } catch {
    return url.length > 20 ? url.substring(0, 15) + '...' : url;
  }
};
