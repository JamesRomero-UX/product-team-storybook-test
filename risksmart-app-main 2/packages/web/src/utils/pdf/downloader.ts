import pdfMake from 'pdfmake/build/pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

import fonts from './fonts';
pdfMake.addVirtualFileSystem(fonts);

export const download = (doc: TDocumentDefinitions) => {
  const win = window.open('', '_blank');
  pdfMake.createPdf(doc).open(win);
};
