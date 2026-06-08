import { type ComponentProps, Fragment, useMemo } from 'react';

import { cn, getAccessibleTextColor } from '../../lib/utils';
import {
  RatingItem,
  RatingItemContent,
  RatingItemDescription,
  RatingItemTitle,
} from '../rating-item';
import type { AxisRating, MatrixCell } from './types';
import { buildMatrixGrid, getCellData } from './utils';

export type RatingsMatrixProps = ComponentProps<'div'> & {
  likelihoodRatings: AxisRating[];
  impactRatings: AxisRating[];
  matrix: MatrixCell[];
  inverted?: boolean;
  onCellClick?: (cell: MatrixCell) => void;
};

function RatingsMatrix({
  likelihoodRatings,
  impactRatings,
  matrix,
  inverted = false,
  onCellClick,
  className,
  ...props
}: RatingsMatrixProps) {
  const grid = useMemo(() => buildMatrixGrid(matrix), [matrix]);

  const columnRatings = inverted ? likelihoodRatings : impactRatings;
  const rowRatings = inverted ? impactRatings : likelihoodRatings;

  const sortedColumns = useMemo(
    () => [...columnRatings].sort((a, b) => a.value - b.value),
    [columnRatings]
  );

  const sortedRows = useMemo(
    () => [...rowRatings].sort((a, b) => a.value - b.value),
    [rowRatings]
  );

  const columnCount = sortedColumns.length;
  const rowCount = sortedRows.length;

  return (
    <div
      data-slot={'ratings-matrix'}
      className={cn('grid w-full gap-1', className)}
      style={{
        gridTemplateColumns: `auto repeat(${columnCount}, 1fr)`,
        gridTemplateRows: `auto repeat(${rowCount}, 1fr)`,
      }}
      {...props}
    >
      <RatingsMatrixCorner inverted={inverted} />

      {sortedColumns.map((col) => (
        <RatingsMatrixColumnHeader key={col.value} rating={col} />
      ))}

      {sortedRows.map((row) => (
        <Fragment key={row.value}>
          <RatingsMatrixRowHeader rating={row} />
          {sortedColumns.map((col) => {
            const likelihood = inverted ? col.value : row.value;
            const impact = inverted ? row.value : col.value;
            const cellData = getCellData(grid, likelihood, impact);

            return (
              <RatingsMatrixCell
                key={`${row.value}-${col.value}`}
                cellData={cellData}
                onClick={
                  onCellClick
                    ? () =>
                        onCellClick(
                          cellData ?? {
                            title: '',
                            value: 0,
                            color: '#E0E0E0',
                            likelihood,
                            impact,
                          }
                        )
                    : undefined
                }
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

function RatingsMatrixCorner({
  inverted,
  className,
  ...props
}: ComponentProps<'div'> & { inverted: boolean }) {
  return (
    <div
      data-slot={'ratings-matrix-corner'}
      className={cn(
        'flex flex-col items-center justify-center min-w-24 rounded-xl bg-neutral px-3 py-2 text-sm font-bold border border-neutral-border text-primary text-center',
        className
      )}
      {...props}
    >
      <span>{inverted ? 'Likelihood \u2192' : 'Impact \u2192'}</span>
      <span>{inverted ? 'Impact \u2193' : 'Likelihood \u2193'}</span>
    </div>
  );
}

function RatingsMatrixColumnHeader({
  rating,
  className,
  ...props
}: ComponentProps<'div'> & { rating: AxisRating }) {
  const textColor = getAccessibleTextColor(rating.color);

  return (
    <div
      data-slot={'ratings-matrix-column-header'}
      className={cn(
        'flex items-center justify-center rounded-xl px-2 py-2 text-sm font-semibold text-center min-h-[46px]',
        className
      )}
      style={{ backgroundColor: rating.color, color: textColor }}
      {...props}
    >
      {rating.title}
    </div>
  );
}

function RatingsMatrixRowHeader({
  rating,
  className,
  ...props
}: ComponentProps<'div'> & { rating: AxisRating }) {
  const textColor = getAccessibleTextColor(rating.color);

  return (
    <div
      data-slot={'ratings-matrix-row-header'}
      className={cn(
        'flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-center min-h-[46px]',
        className
      )}
      style={{ backgroundColor: rating.color, color: textColor }}
      {...props}
    >
      {rating.title}
    </div>
  );
}

function RatingsMatrixCell({
  cellData,
  className,
  ...props
}: ComponentProps<'div'> & {
  cellData?: MatrixCell;
}) {
  if (!cellData) {
    return (
      <RatingItem
        data-slot={'ratings-matrix-cell'}
        color={'#E0E0E0'}
        size={'sm'}
        className={className}
        {...props}
      >
        <RatingItemContent>
          <RatingItemTitle>{'-'}</RatingItemTitle>
        </RatingItemContent>
      </RatingItem>
    );
  }

  return (
    <RatingItem
      data-slot={'ratings-matrix-cell'}
      color={cellData.color}
      size={'sm'}
      className={className}
      {...props}
    >
      <RatingItemContent>
        <RatingItemTitle>{cellData.title}</RatingItemTitle>
        <RatingItemDescription>{cellData.value}</RatingItemDescription>
      </RatingItemContent>
    </RatingItem>
  );
}

export {
  RatingsMatrix,
  RatingsMatrixCell,
  RatingsMatrixColumnHeader,
  RatingsMatrixCorner,
  RatingsMatrixRowHeader,
};
