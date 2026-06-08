import type { ContentText } from 'pdfmake/interfaces';

export const createLabel = (text: string): ContentText => ({
  text: text + ':',
  style: 'label',
});
