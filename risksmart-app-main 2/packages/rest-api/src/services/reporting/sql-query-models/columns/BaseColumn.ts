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

import { getOperator, getTableAlias } from '../../sqlQueryHelpers';
import type { QueryBuilder } from '../../types';

export abstract class BaseColumn {
  constructor(protected dataSourceField: DataSourceField) {}

  /**
   * Override if the column doesn't live in the main table, but instead needs to be joined
   * @param queryBuilder
   * @returns
   */
  addRequiredJoins(
    queryBuilder: QueryBuilder,
    _options: { isGroupBy: boolean; unnestInlineArrays: boolean | undefined }
  ): QueryBuilder {
    return queryBuilder;
  }

  /**
   * Returns the table alias on which this column can be accessed.
   * @returns
   */
  getTableAlias(): string {
    return getTableAlias(this.dataSourceField.dataSourceIndex);
  }

  /**
   * Returns an array of table aliased columns for the specified data source field.
   * This will generally return a single column, however if the column has metadata, it may return multiple.
   * In this case, it should be the first column that is used for filtering, however all fields must be selected and group on
   * @param field
   * @returns
   */
  abstract getSelectExpression(): AliasableExpression<unknown>[];

  /**
   * Returns a filter expression used in the where clause
   */
  getFilterExpression(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eb: ExpressionBuilder<any, any>,
    col: AliasableExpression<unknown>,
    {
      filter,
    }: {
      isGroupBy: boolean;
      filter: Filter;
      unnestInlineArrays: boolean | undefined;
    }
  ): Expression<SqlBool> {
    return eb(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      col as any,
      getOperator(
        filter.operator,
        filter.value === null ||
          filter.value === undefined ||
          filter.value === 'null'
      ),
      filter.value === null ||
        filter.value === undefined ||
        filter.value === 'null'
        ? null
        : filter.value
    );
  }

  /**
   * Adds additional group by clauses to the query builder.
   * Useful when a column physically represents multiple columns which will require grouping on
   * @param queryBuilder
   * @returns
   */
  addAdditionalGroupbys(
    queryBuilder: QueryBuilder,
    index: number
  ): { queryBuilder: QueryBuilder; index: number } {
    return { queryBuilder, index };
  }
}
