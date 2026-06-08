import type { ContentText } from 'pdfmake/interfaces';

export const createHeading = (text: string): ContentText => ({
  text,
  style: 'header',
});

export const createSubHeading = (text: string): ContentText => ({
  text,
  style: 'subheader',
});

export const createSubHeading2 = (text: string): ContentText => ({
  text,
  style: 'subheader2',
});
