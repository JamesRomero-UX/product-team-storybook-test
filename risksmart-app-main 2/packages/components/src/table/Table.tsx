import type { TableProps } from '@risk-smart/themed-cloudscape-components/table';
import CSTable from '@risk-smart/themed-cloudscape-components/table';
import type { FC } from 'react';
import { forwardRef, useMemo } from 'react';

import style from './style.module.scss';

const DEFAULT_MIN_COL_WIDTH = 50; // px

const Table: FC<TableProps> = forwardRef<TableProps.Ref, TableProps>(
  (props, ref) => {
    const normalizedColumns = useMemo(
      () =>
        (props.columnDefinitions ?? []).map((col) => ({
          ...col,
          // Apply a sensible default only when minWidth isn't provided
          minWidth: col.minWidth ?? DEFAULT_MIN_COL_WIDTH,
        })),
      [props.columnDefinitions]
    );

    return (
      <div className={style.root}>
        <CSTable {...props} columnDefinitions={normalizedColumns} ref={ref} />
      </div>
    );
  }
);
Table.displayName = 'Table';

export default Table;
