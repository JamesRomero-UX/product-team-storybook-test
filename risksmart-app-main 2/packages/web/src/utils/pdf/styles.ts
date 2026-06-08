import type { Style, StyleDictionary } from 'pdfmake/interfaces';

export const defaultStyle: Style = {
  fontSize: 8,
  font: 'Roboto',
};

export const styles: StyleDictionary = {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 10],
    alignment: 'center',
  },
  subheader: {
    fontSize: 14,
    bold: true,
    margin: [0, 10, 0, 5],
  },
  subheader2: {
    fontSize: 12,
    bold: true,
    margin: [0, 10, 0, 5],
  },

  label: {
    bold: true,
  },
  table: {
    margin: [0, 5, 0, 15],
    fontSize: 8,
  },
  tableHeader: {
    bold: true,
    fontSize: 8,
  },
};
