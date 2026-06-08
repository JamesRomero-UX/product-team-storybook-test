import type { DataSourceField } from '@risksmart-app/shared/reporting/api/schema';
import type { DB } from 'generated-db/db';
import type { AliasableExpression } from 'kysely';
import { sql } from 'kysely';

import type { LazyTables, TableNames } from '../../datasets/types';
import { getTableAlias } from '../../sqlQueryHelpers';
import type { QueryBuilder } from '../../types';
import { JoinedColumn } from './JoinedColumn';

interface Options<Table extends TableNames> {
  pgColumn: keyof DB[Table];
  metaPgColumns: { [key: string]: string };
  sourceMetaPgColumns?: { [key: string]: string };
  tableRef: string;
  relations: LazyTables<Table>;
}

/**
 * Represents a column that that requires a join to another table, and returns multiple columns (specificied with metaPgColumns) from that table
 */
export class JoinedColumnWithMeta<
  Table extends TableNames,
> extends JoinedColumn<Table> {
  constructor(
    dataSourceField: DataSourceField,
    private fieldDefinitionWithMeta: Options<Table>
  ) {
    super(dataSourceField, fieldDefinitionWithMeta);
  }

  getSelectExpression(): AliasableExpression<unknown>[] {
    const baseColumns = super.getSelectExpression();

    if (this.fieldDefinitionWithMeta.metaPgColumns) {
      Object.keys(this.fieldDefinitionWithMeta.metaPgColumns).forEach((col) => {
        baseColumns.push(
          sql.ref(
            `${getTableAlias(this.dataSourceField.dataSourceIndex, { suffix: this.fieldDefinitionWithMeta.tableRef })}.${this.fieldDefinitionWithMeta.metaPgColumns[col]}`
          )
        );
      });
    }

    if (this.fieldDefinitionWithMeta.sourceMetaPgColumns) {
      const sourceAlias = getTableAlias(this.dataSourceField.dataSourceIndex);
      Object.keys(this.fieldDefinitionWithMeta.sourceMetaPgColumns).forEach(
        (col) => {
          baseColumns.push(
            sql.ref(
              `${sourceAlias}.${this.fieldDefinitionWithMeta.sourceMetaPgColumns![col]}`
            )
          );
        }
      );
    }

    return [...baseColumns];
  }

  /**
   * As the select expression returns multiple columns, we need to ensure that the group by clause includes all of them.
   * @param queryBuilder The query builder to modify
   * @param index The current index for the group by clause
   * @returns The modified query builder and the updated index
   */
  addAdditionalGroupbys(queryBuilder: QueryBuilder, index: number) {
    Object.keys(this.fieldDefinitionWithMeta.metaPgColumns).forEach(() => {
      index += 1;
      queryBuilder = queryBuilder.groupBy(sql.lit<number>(index));
    });

    if (this.fieldDefinitionWithMeta.sourceMetaPgColumns) {
      Object.keys(this.fieldDefinitionWithMeta.sourceMetaPgColumns).forEach(
        () => {
          index += 1;
          queryBuilder = queryBuilder.groupBy(sql.lit<number>(index));
        }
      );
    }

    return {
      queryBuilder,
      index,
    };
  }
}
