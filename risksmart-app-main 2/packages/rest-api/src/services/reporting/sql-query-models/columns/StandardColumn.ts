import type { DataSourceField } from '@risksmart-app/shared/reporting/api/schema';
import type { DB } from 'generated-db/db';
import type { AliasableExpression } from 'kysely';
import { sql } from 'kysely';

import type { TableNames } from '../../datasets/types';
import { BaseColumn } from './BaseColumn';

interface Options<Table extends TableNames> {
  pgColumn: keyof DB[Table];
}

/**
 * Represents a column that lives on the "primary" table represented by the data source.
 */
export class StandardColumn<Table extends TableNames> extends BaseColumn {
  constructor(
    protected dataSourceField: DataSourceField,
    protected fieldDefinition: Options<Table>
  ) {
    super(dataSourceField);
  }

  getSelectExpression(): AliasableExpression<unknown>[] {
    return [
      sql.ref(
        `${this.getTableAlias()}.${String(this.fieldDefinition.pgColumn)}`
      ),
    ];
  }
}
