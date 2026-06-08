// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  RatingsMatrix,
  RatingsMatrixCell,
  RatingsMatrixColumnHeader,
  RatingsMatrixCorner,
  RatingsMatrixRowHeader,
} from './index';
import type { AxisRating, MatrixCell } from './types';
import { buildMatrixGrid, getCellData } from './utils';

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

describe('buildMatrixGrid', () => {
  it('builds a map keyed by likelihood-impact', () => {
    const cells: MatrixCell[] = [
      { title: 'Low', value: 1, color: '#green', likelihood: 1, impact: 2 },
      { title: 'High', value: 9, color: '#red', likelihood: 3, impact: 3 },
    ];
    const grid = buildMatrixGrid(cells);

    expect(grid.size).toBe(2);
    expect(grid.get('1-2')).toEqual(cells[0]);
    expect(grid.get('3-3')).toEqual(cells[1]);
  });

  it('returns empty map for empty array', () => {
    const grid = buildMatrixGrid([]);

    expect(grid.size).toBe(0);
  });
});

describe('getCellData', () => {
  it('returns matching cell', () => {
    const cell: MatrixCell = {
      title: 'Med',
      value: 4,
      color: '#yellow',
      likelihood: 2,
      impact: 2,
    };
    const grid = new Map([['2-2', cell]]);

    expect(getCellData(grid, 2, 2)).toBe(cell);
  });

  it('returns undefined for missing key', () => {
    const grid = new Map<string, MatrixCell>();

    expect(getCellData(grid, 1, 1)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

describe('RatingsMatrixCorner', () => {
  it('shows Impact/Likelihood labels when not inverted', () => {
    const html = renderToString(
      createElement(RatingsMatrixCorner, { inverted: false })
    );

    expect(html).toContain('data-slot="ratings-matrix-corner"');
    expect(html).toContain('Impact');
    expect(html).toContain('Likelihood');
  });

  it('swaps labels when inverted', () => {
    const html = renderToString(
      createElement(RatingsMatrixCorner, { inverted: true })
    );

    expect(html).toContain('Likelihood →');
    expect(html).toContain('Impact ↓');
  });
});

describe('RatingsMatrixColumnHeader', () => {
  it('renders rating title with background color', () => {
    const rating: AxisRating = { title: 'High', value: 3, color: '#ff0000' };
    const html = renderToString(
      createElement(RatingsMatrixColumnHeader, { rating })
    );

    expect(html).toContain('data-slot="ratings-matrix-column-header"');
    expect(html).toContain('High');
    expect(html).toContain('background-color:#ff0000');
  });
});

describe('RatingsMatrixRowHeader', () => {
  it('renders rating title with background color', () => {
    const rating: AxisRating = { title: 'Low', value: 1, color: '#00ff00' };
    const html = renderToString(
      createElement(RatingsMatrixRowHeader, { rating })
    );

    expect(html).toContain('data-slot="ratings-matrix-row-header"');
    expect(html).toContain('Low');
    expect(html).toContain('background-color:#00ff00');
  });
});

describe('RatingsMatrixCell', () => {
  it('renders a dash when cellData is undefined', () => {
    const html = renderToString(createElement(RatingsMatrixCell));

    expect(html).toContain('data-slot="ratings-matrix-cell"');
    expect(html).toContain('-');
  });

  it('renders cell title and value when cellData is provided', () => {
    const cellData: MatrixCell = {
      title: 'Medium',
      value: 5,
      color: '#ffcc00',
      likelihood: 2,
      impact: 3,
    };
    const html = renderToString(createElement(RatingsMatrixCell, { cellData }));

    expect(html).toContain('Medium');
    expect(html).toContain('5');
  });
});

// ---------------------------------------------------------------------------
// RatingsMatrix (full)
// ---------------------------------------------------------------------------

const likelihoodRatings: AxisRating[] = [
  { title: 'Rare', value: 1, color: '#00ff00' },
  { title: 'Likely', value: 2, color: '#ffcc00' },
];

const impactRatings: AxisRating[] = [
  { title: 'Minor', value: 1, color: '#00ff00' },
  { title: 'Major', value: 2, color: '#ff0000' },
];

const matrixCells: MatrixCell[] = [
  { title: 'Low', value: 1, color: '#00ff00', likelihood: 1, impact: 1 },
  { title: 'Med', value: 2, color: '#ffcc00', likelihood: 1, impact: 2 },
  { title: 'Med', value: 3, color: '#ffcc00', likelihood: 2, impact: 1 },
  { title: 'High', value: 4, color: '#ff0000', likelihood: 2, impact: 2 },
];

describe('RatingsMatrix', () => {
  it('renders the full matrix grid', () => {
    const html = renderToString(
      createElement(RatingsMatrix, {
        likelihoodRatings,
        impactRatings,
        matrix: matrixCells,
      })
    );

    expect(html).toContain('data-slot="ratings-matrix"');
    expect(html).toContain('data-slot="ratings-matrix-corner"');
    expect(html).toContain('data-slot="ratings-matrix-column-header"');
    expect(html).toContain('data-slot="ratings-matrix-row-header"');
    expect(html).toContain('data-slot="ratings-matrix-cell"');
  });

  it('renders with inverted axes', () => {
    const html = renderToString(
      createElement(RatingsMatrix, {
        likelihoodRatings,
        impactRatings,
        matrix: matrixCells,
        inverted: true,
      })
    );

    expect(html).toContain('Likelihood →');
  });

  it('renders grid template columns based on impact ratings count', () => {
    const html = renderToString(
      createElement(RatingsMatrix, {
        likelihoodRatings,
        impactRatings,
        matrix: matrixCells,
      })
    );

    expect(html).toContain('grid-template-columns:auto repeat(2, 1fr)');
  });

  it('renders empty cells when matrix data is missing', () => {
    const html = renderToString(
      createElement(RatingsMatrix, {
        likelihoodRatings,
        impactRatings,
        matrix: [],
      })
    );

    expect(html).toContain('-');
  });

  it('calls onCellClick with cell data when a populated cell is clicked', () => {
    const onCellClick = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(
        createElement(RatingsMatrix, {
          likelihoodRatings,
          impactRatings,
          matrix: matrixCells,
          onCellClick,
        })
      );
    });

    const cells = container.querySelectorAll(
      '[data-slot="ratings-matrix-cell"]'
    );
    // Click the first cell (likelihood=1, impact=1 => 'Low')
    act(() => {
      cells[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onCellClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Low', value: 1 })
    );

    document.body.removeChild(container);
  });

  it('calls onCellClick with fallback data when an empty cell is clicked', () => {
    const onCellClick = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Only provide one cell so most grid positions are empty
    const sparseMatrix: MatrixCell[] = [
      { title: 'Low', value: 1, color: '#00ff00', likelihood: 1, impact: 1 },
    ];

    act(() => {
      createRoot(container).render(
        createElement(RatingsMatrix, {
          likelihoodRatings,
          impactRatings,
          matrix: sparseMatrix,
          onCellClick,
        })
      );
    });

    const cells = container.querySelectorAll(
      '[data-slot="ratings-matrix-cell"]'
    );
    // Click the second cell (likelihood=1, impact=2 => no data, should use fallback)
    act(() => {
      cells[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onCellClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: '', value: 0, color: '#E0E0E0' })
    );

    document.body.removeChild(container);
  });

  it('merges custom className', () => {
    const html = renderToString(
      createElement(RatingsMatrix, {
        likelihoodRatings,
        impactRatings,
        matrix: matrixCells,
        className: 'custom-matrix',
      })
    );

    expect(html).toContain('custom-matrix');
  });
});
