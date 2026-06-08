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
 * Represents a column that that requires a join to a table values function to display multiple vlues in a single column
 */
export class InlinedArrayJoinedFunctionColumn extends BaseColumn {
  constructor(
    dataSourceField: DataSourceField,
    private fieldDefinition: Options
  ) {
    super(dataSourceField);
  }

  getSelectExpression(): AliasableExpression<unknown>[] {
    const joinInfo = inlineArrayJoinFieldsTypes[this.fieldDefinition.type];
    if (!('tableFunctionName' in joinInfo)) {
      throw new Error(
        `Field definition for ${this.fieldDefinition.type} does not contain a table function name`
      );
    }

    return [sql.ref(`${this.getTableAlias()}.${joinInfo.functionQueryCol}`)];
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
    const queryInfo = inlineArrayJoinFieldsTypes[this.fieldDefinition.type];
    if (!('tableFunctionName' in queryInfo)) {
      throw new Error(
        `Field definition for ${this.fieldDefinition.type} does not contain a table function name`
      );
    }
    const parentCol = `${getTableAlias(this.dataSourceField.dataSourceIndex)}.${this.fieldDefinition.datasourcePkPgColumn}`;

    const alias = this.getTableAlias();

    return queryBuilder.leftJoinLateral(
      ({ eb }) => {
        eb.fn(queryInfo.tableFunctionName, []);
        const from = eb.selectFrom(
          sql`${sql.ref(queryInfo.tableFunctionName)}(${sql.ref(parentCol)})`.as(
            'tt'
          )
        );

        return from
          .select(
            isGroupBy || unnestInlineArrays
              ? `tt.${queryInfo.functionQueryCol}`
              : ({ eb }) =>
                  eb.fn
                    .coalesce(
                      eb.fn.jsonAgg(`tt.${queryInfo.functionQueryCol}`),
                      sql`'[]'`
                    )
                    .as(queryInfo.functionQueryCol)
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
