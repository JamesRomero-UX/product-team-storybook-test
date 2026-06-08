import type { Content, ContentColumns } from 'pdfmake/interfaces';

export const twoColumns = (detailFields: Content[]): ContentColumns => {
  const detailsCol1 = detailFields.slice(0, detailFields.length / 2);
  const detailsCol2 = detailFields.slice(detailFields.length / 2);

  return {
    columns: [detailsCol1, detailsCol2],
  };
};
