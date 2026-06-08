export const isUrl = (value: string | null | undefined): boolean => {
  if (!value) {
    return false;
  }
  // Check for common URL patterns
  const urlPattern = /^(https?:\/\/|ftp:\/\/|www\.)|:\/\//i;

  return urlPattern.test(value.trim());
};
