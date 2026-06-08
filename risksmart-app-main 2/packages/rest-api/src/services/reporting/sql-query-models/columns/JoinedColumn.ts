import type { DataSourceField } from '@risksmart-app/shared/reporting/api/schema';
import type { DB } from 'generated-db/db';
import type { JoinBuilder } from 'kysely';

import type { LazyTables, TableNames } from '../../datasets/types';
import { getTableAlias } from '../../sqlQueryHelpers';
import type { QueryBuilder } from '../../types';
import { StandardColumn } from './StandardColumn';

interface Options<Table extends TableNames> {
  pgColumn: keyof DB[Table];
  tableRef: string;
  relations: LazyTables<Table>;
}

/**
 * Represents a column that that requires a join to another table
 */
export class JoinedColumn<
  Table extends TableNames,
> extends StandardColumn<Table> {
  constructor(
    protected dataSourceField: DataSourceField,
    protected joinFieldDefinition: Options<Table>
  ) {
    super(dataSourceField, joinFieldDefinition);
  }

  getTableAlias(): string {
    return getTableAlias(this.dataSourceField.dataSourceIndex, {
      suffix: this.joinFieldDefinition.tableRef,
    });
  }

  addRequiredJoins(queryBuilder: QueryBuilder): QueryBuilder {
    const lazyJoin =
      this.joinFieldDefinition.relations[this.joinFieldDefinition.tableRef];

    if (!lazyJoin) {
      throw new Error(
        `Unable to find relation ${this.joinFieldDefinition.tableRef} on dataSourceIndex ${this.dataSourceField.dataSourceIndex}`
      );
    }

    const parentAlias = getTableAlias(this.dataSourceField.dataSourceIndex);

    return queryBuilder.leftJoin(
      `${lazyJoin.pgTable} as ${this.getTableAlias()}`,
      (join) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let joinBuilder: JoinBuilder<any, any> = join;
        for (const cols of lazyJoin.columnMapping) {
          joinBuilder = joinBuilder.onRef(
            `${parentAlias}.${String(cols.fk)}`,
            '=',
            `${this.getTableAlias()}.${cols.pk}`
          );
        }

        return joinBuilder;
      }
    );
  }
}
