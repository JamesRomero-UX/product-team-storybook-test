import type { DataSourceField } from '@risksmart-app/shared/reporting/api/schema';
import type { DB } from 'generated-db/db';
import type { AliasableExpression } from 'kysely';
import { sql } from 'kysely';

import type { TableNames } from '../../datasets/types';
import { getTableAlias } from '../../sqlQueryHelpers';
import { BaseColumn } from './BaseColumn';

interface Options<Table extends TableNames> {
  pgColumn: keyof DB[Table];
}

/**
 * Represents a column that lives on the "junction" table that joins the primary table to its parent
 */
export class JunctionTableColumn<Table extends TableNames> extends BaseColumn {
  constructor(
    dataSourceField: DataSourceField,
    private fieldDefinition: Options<Table>
  ) {
    super(dataSourceField);
  }

  getSelectExpression(): AliasableExpression<unknown>[] {
    return [
      sql.ref(
        `${getTableAlias(this.dataSourceField.dataSourceIndex, { isJoinTable: true })}.${String(this.fieldDefinition.pgColumn)}`
      ),
    ];
  }
}
