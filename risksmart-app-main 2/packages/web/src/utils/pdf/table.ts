import type { ContentTable, Table } from 'pdfmake/interfaces';

export const createTable = (table: Table): ContentTable => ({
  style: 'table',
  layout: {
    hLineWidth: function () {
      return 0.5;
    },
    vLineWidth: function () {
      return 0.5;
    },
    hLineColor: function () {
      return '#e8e4e4';
    },
    vLineColor: function () {
      return '#e8e4e4';
    },
    fillColor: function (rowIndex) {
      if (rowIndex === 0) {
        return '#FFFFFF';
      }

      return rowIndex % 2 === 0 ? '#f8f8f8' : null;
    },
  },
  table: {
    headerRows: 1,
    ...table,
  },
});

const tableHeader = (text: string) => ({
  text,
  style: 'tableHeader',
});

export const tableHeaders = (text: string[]) => text.map(tableHeader);
