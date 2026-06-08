import { Components, Report } from '@hybiscus/api';
import dayjs from 'dayjs';

import type { DefaultRegisterExportData, PdfTemplate } from '../types';
import {
  buildAppliedFiltersText,
  buildReadableFiltersText,
} from './utils/filters';

export const defaultRegisterTemplate: PdfTemplate = {
  id: 'default-register',

  async buildConfig({ data, options, context: _context }) {
    // Basic HTML escaper for embedding text safely inside span tags
    const escapeHtml = (str: string): string =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    const registerData = data as unknown as DefaultRegisterExportData;

    if (!registerData.headers || !registerData.rows) {
      throw new Error('Risk register data must include headers and rows');
    }

    // Create report using SDK with advanced configuration
    const report = new Report(
      {
        report_title: options.title,
        report_byline: options.subtitle,
        version_number: '1.0',
      },
      {
        landscape: (options.orientation ?? 'landscape') === 'landscape',
        enable_multi_page: registerData.rows.length > 10,
        typography_theme: 'google-fonts',
        google_fonts: {
          headings: {
            family: 'Sora',
            weight: '700',
          },
          paragraph: {
            family: 'Sora',
            weight: '400',
          },
        },
        color_theme: 'candy',
        override_color_theme: {
          headline: '#121233',
          'sub-headline': '#121233',
          accent: '#747272ff',
          paragraph: '#121233',
        },
      }
    );

    const cardsData = registerData.ribbonData?.cards;
    if (cardsData && cardsData.length > 0) {
      // Create cards for the ribbon
      const cards = cardsData.map(
        (card) =>
          new Components.Core.Card({
            title: card.title,
            title_color: card.highlighted ? 'headline' : 'accent',
            value: String(card.value),
            value_color: card.highlighted ? 'headline' : 'accent',
          })
      );

      // Add cards in rows (max 6 per row)
      for (let i = 0; i < cards.length; i += 4) {
        const rowCards = cards.slice(i, i + 4);
        const cardsRow = new Components.Core.Row({
          highlighted: i === 0, // Highlight first row
          columns: rowCards.length,
          vertical_margin: i === 0 ? 4 : 2,
        });

        rowCards.forEach((card) => cardsRow.addComponent(card));
        report.addComponent(cardsRow);
      }
    }

    // Convert table data to strings; when cellStyles are provided, wrap content in a styled <span>
    // Hybiscus supports basic HTML inside table cells: <span style="color: #HEX">Text</span>
    // We'll also try background-color and display:block to simulate a badge look.
    const hybiscusRows = registerData.rows.map((row, ri) =>
      row.map((cell, ci) => {
        const raw = cell !== null && cell !== undefined ? String(cell) : '';
        const text = escapeHtml(raw);
        const s = registerData.cellStyles?.[ri]?.[ci];
        let bg = s?.backgroundColor;
        let fg = s?.color;

        // Default to light grey badge when no explicit style and value is unrated-like
        if (!bg && !fg) {
          const v = raw.trim().toLowerCase();
          if (
            v === 'unrated' ||
            v === 'not rated' ||
            v === 'n/a' ||
            v === 'na' ||
            v === 'none' ||
            v === '-'
          ) {
            bg = '#E8E8EC';
            fg = '#73738C';
          } else {
            return text;
          }
        }

        const styles: string[] = [
          'display: block',
          'width: 100%',
          'padding: 2px 6px',
          'border-radius: 3px',
          'text-align: center',
        ];
        if (fg) {
          styles.push(`color: ${fg}`);
        }
        if (bg) {
          styles.push(`background-color: ${bg}`);
        }

        return `<span style="${styles.join('; ')}">${text}</span>`;
      })
    );

    // Only render the table when there are rows; otherwise render a placeholder
    if (hybiscusRows.length > 0) {
      // Optionally apply relative column widths if provided by client, as integer percentages summing to 100
      type WithColRatios = DefaultRegisterExportData & {
        columnWidthRatios?: number[];
      };
      const ratios = (registerData as WithColRatios).columnWidthRatios;

      const toIntPercents = (
        rs: number[] | undefined,
        expectedLen: number
      ): number[] | undefined => {
        if (!rs || rs.length !== expectedLen || expectedLen <= 0) {
          return undefined;
        }
        const positive = rs.map((r) => (Number.isFinite(r) && r > 0 ? r : 0));
        const sum = positive.reduce((a, b) => a + b, 0);
        if (sum <= 0) {
          return undefined;
        }
        const raw = positive.map((r) => (r / sum) * 100);
        const bases: number[] = raw.map((v) => Math.floor(v));
        const leftover: number = 100 - bases.reduce((a, b) => a + b, 0);
        if (leftover !== 0) {
          const order = raw
            .map((v, i) => ({ i, r: v - bases[i]! }))
            .sort((a, b) => b.r - a.r);
          if (leftover > 0) {
            for (let k = 0; k < leftover; k++) {
              const idx = order[k % order.length]!.i;
              bases[idx]! += 1;
            }
          } else {
            for (let k = 0; k < -leftover; k++) {
              const idx = order[order.length - 1 - (k % order.length)]!.i;
              if (bases[idx]! > 0) {
                bases[idx]! -= 1;
              }
            }
          }
        }
        const final = bases.reduce((a, b) => a + b, 0);
        if (final !== 100 && bases.length > 0) {
          bases[0]! += 100 - final;
        }

        return bases;
      };

      const col_width = toIntPercents(ratios, registerData.headers.length);

      const tableComponent = new Components.Core.Table({
        headings: registerData.headers,
        // Pass HTML-capable strings; Hybiscus will render basic HTML inside cells
        rows: hybiscusRows as unknown as Array<Array<string>>,
        table_border: true,
        col_borders: true,
        vertical_margin: 6,
        horizontal_margin: 1,
        headings_font_size: '3xs',
        rows_font_size: '3xs',
        col_align: registerData.headers.map(() => 'left'),
        ...(col_width
          ? ({ col_width } as unknown as Record<string, unknown>)
          : {}),
      });

      report.addComponent(tableComponent);

      // Add footer with item count and filter info
      const filterText = registerData.metadata?.hasFilters
        ? registerData.metadata.filterInfo
        : `Items: ${registerData.rows.length}`;

      report.addComponent(
        new Components.Core.Text({
          text: filterText || `Items: ${registerData.rows.length}`,
          size: '2xs',
          align: 'right',
          vertical_margin: 2,
          horizontal_margin: 1,
        })
      );
    } else {
      // Placeholder when no data rows are available
      const noDataText = registerData.metadata?.hasFilters
        ? 'No rows match the applied filters.'
        : 'No rows available to display.';

      report.addComponent(
        new Components.Core.Text({
          text: noDataText,
          size: 'sm',
          align: 'center',
          vertical_margin: 6,
          markdown_format: false,
          horizontal_margin: 1,
        })
      );
    }

    // Add metadata section
    report.options.footer_text = `${dayjs().format('YYYY-MM-DD HH:mm:ss')}`;

    // Render a readable filter expression if the full filter query is provided
    if (registerData.metadata?.filters) {
      const readable = buildReadableFiltersText(
        registerData.metadata.filters,
        registerData.metadata?.filterPropertyLabels
      );
      if (readable) {
        report.addComponent(
          new Components.Core.Text({
            text: `Filters: ${readable}`,
            size: 'xs',
            align: 'right',
            vertical_margin: 2,
            horizontal_margin: 1,
            inner_padding: 2,
          })
        );
      }
    }

    // Add applied filters section if filters are present
    if (registerData.metadata?.hasFilters) {
      const chips = buildAppliedFiltersText(
        registerData.metadata?.appliedFilters
      );
      if (chips) {
        report.addComponent(
          new Components.Core.Text({
            text: chips,
            size: 'xs',
            align: 'right',
            vertical_margin: 2,
            style: {
              font_family: 'monospace',
            },
            horizontal_margin: 1,
          })
        );
      }
    }

    return report;
  },
};
