import type { ContentTable } from 'pdfmake/interfaces';

import { createSubHeading } from './headings';

export const optionalTableSection = (
  heading: string,
  contentTable: ContentTable
) => {
  // If only has the header, don't show the heading or table
  return contentTable.table.body.length === 1
    ? []
    : [createSubHeading(heading), contentTable];
};
