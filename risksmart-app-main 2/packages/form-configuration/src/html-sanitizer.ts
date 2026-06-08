import sanitizeHtml from 'sanitize-html';

export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class'],
    },
  });
};

export const sanitizeNullableHtmlContent = (
  html?: string | null
): string | null => {
  if (!html) {
    return null;
  }

  return sanitizeHtmlContent(html);
};
