import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

import { getFooter } from './footer';
import { defaultStyle, styles } from './styles';

export const createDocument = (
  title: string,
  content: Content
): TDocumentDefinitions => ({
  info: {
    title,
  },
  pageMargins: [20, 40],
  footer: getFooter(title),
  content,
  defaultStyle,
  styles,
});
