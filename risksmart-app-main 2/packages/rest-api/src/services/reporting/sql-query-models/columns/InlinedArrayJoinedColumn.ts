import type {
  DataSourceField,
  Filter,
} from '@risksmart-app/shared/reporting/api/schema';
import type {
  AliasableExpression,
  Expression,
  ExpressionBuilder,
  SqlBool,
} from 'kysely';
import { sql } from 'kysely';

import type { InlineArrayJoinArrayFieldTypes } from '../../lateral-join-array-field-types';
import { inlineArrayJoinFieldsTypes } from '../../lateral-join-array-field-types';
import {
  buildInlineArrayFilterPredicate,
  getTableAlias,
} from '../../sqlQueryHelpers';
import type { QueryBuilder } from '../../types';
import { BaseColumn } from './BaseColumn';

interface Options {
  type: InlineArrayJoinArrayFieldTypes;
  datasourcePkPgColumn: string;
}

/**
 * Represents a column that that requires a join to another table to display multiple vlues in a single column
 */
export class InlinedArrayJoinedColumn extends BaseColumn {
  constructor(
    dataSourceField: DataSourceField,
    private fieldDefinition: Options
  ) {
    super(dataSourceField);
  }

  getSelectExpression(): AliasableExpression<unknown>[] {
    const joinInfo = inlineArrayJoinFieldsTypes[this.fieldDefinition.type];
    if (!('objectTableQueryCol' in joinInfo)) {
      throw new Error(
        `Field definition for ${this.fieldDefinition.type} does not contain a query column`
      );
    }

    return [sql.ref(`${this.getTableAlias()}.${joinInfo.objectTableQueryCol}`)];
  }

  getTableAlias(): string {
    return getTableAlias(this.dataSourceField.dataSourceIndex, {
      suffix: this.fieldDefinition.type,
    });
  }

  addRequiredJoins(
    queryBuilder: QueryBuilder,
    {
      isGroupBy,
      unnestInlineArrays,
    }: { isGroupBy: boolean; unnestInlineArrays: boolean | undefined }
  ): QueryBuilder {
    const parentCol = `${getTableAlias(this.dataSourceField.dataSourceIndex)}.${this.fieldDefinition.datasourcePkPgColumn}`;

    const queryInfo = inlineArrayJoinFieldsTypes[this.fieldDefinition.type];

    if (!('objectTableQueryCol' in queryInfo)) {
      throw new Error(
        `Field definition for ${this.fieldDefinition.type} does not contain a query column`
      );
    }

    const alias = this.getTableAlias();
    if (unnestInlineArrays) {
      const m2mAlias = `${alias}-m2m`;

      if ('manyToManyTable' in queryInfo) {
        return queryBuilder
          .innerJoin(
            `${queryInfo.manyToManyTable} as ${m2mAlias}`,
            parentCol,
            `${m2mAlias}.${queryInfo.manyToManyPk}`
          )
          .innerJoin(
            `${queryInfo.objectTable} as ${alias}`,
            `${m2mAlias}.${queryInfo.manyToManyJoinCol}`,
            `${alias}.${queryInfo.objectTableJoinCol}`
          );
      } else {
        return queryBuilder.innerJoin(
          `${queryInfo.objectTable} as ${alias}`,
          parentCol,
          `${alias}.${queryInfo.objectPk}`
        );
      }
    }

    return queryBuilder.leftJoinLateral(
      ({ eb }) => {
        let from = eb.selectFrom(`${queryInfo.objectTable} as tt`);
        if ('manyToManyTable' in queryInfo) {
          from = from.innerJoin(
            `${queryInfo.manyToManyTable} as t`,
            `t.${queryInfo.manyToManyJoinCol}`,
            `tt.${queryInfo.objectTableJoinCol}`
          );
        }

        return from
          .select(
            isGroupBy
              ? `tt.${queryInfo.objectTableQueryCol}`
              : ({ eb }) =>
                  eb.fn
                    .coalesce(
                      eb.fn.jsonAgg(`tt.${queryInfo.objectTableQueryCol}`),
                      sql`'[]'`
                    )
                    .as(queryInfo.objectTableQueryCol)
          )
          .whereRef(
            'manyToManyTable' in queryInfo
              ? `t.${queryInfo.manyToManyPk}`
              : `tt.${queryInfo.objectPk}`,
            '=',
            parentCol
          )
          .as(alias);
      },
      (join) => join.onTrue()
    );
  }

  getFilterExpression(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eb: ExpressionBuilder<any, any>,
    col: AliasableExpression<unknown>,
    options: {
      isGroupBy: boolean;
      filter: Filter;
      unnestInlineArrays: boolean | undefined;
    }
  ): Expression<SqlBool> {
    if (options.isGroupBy || options.unnestInlineArrays) {
      return super.getFilterExpression(eb, col, options);
    }

    return buildInlineArrayFilterPredicate(eb, col, options);
  }
}
