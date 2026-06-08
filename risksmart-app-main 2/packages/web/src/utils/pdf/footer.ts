import type { DynamicContent } from 'pdfmake/interfaces';

import { toLocalDateTime } from '../dateUtils';

export const getFooter =
  (title: string): DynamicContent =>
  (currentPage, pageCount) => ({
    text: `Page ${currentPage.toString()} of ${pageCount} - ${title} - ${toLocalDateTime(
      new Date().toISOString()
    )}`,
    margin: [20, 20],
  });
