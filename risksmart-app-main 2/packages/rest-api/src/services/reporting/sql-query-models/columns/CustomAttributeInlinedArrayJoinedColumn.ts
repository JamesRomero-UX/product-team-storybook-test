import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
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

import { customAttributeQueryInfo } from '../../custom-attribute-fields';
import type { CustomAttributeWithJoin } from '../../custom-attribute-fields/types';
import {
  buildInlineArrayFilterPredicate,
  getTableAlias,
} from '../../sqlQueryHelpers';
import type { QueryBuilder } from '../../types';
import { CustomAttributeJoinedColumn } from './CustomAttributeJoinedColumn';

interface Options {
  customAttribute: string;
  pgLabelColumn: string;
  customAttributeType: CustomAttributeFieldType;
}

/**
 * Represents a column that that requires a join to another table to display multiple vlues in a single column
 */
export class CustomAttributeInlinedArrayJoinedColumn extends CustomAttributeJoinedColumn {
  customAttributeQueryInfo: CustomAttributeWithJoin;
  constructor(
    dataSourceField: DataSourceField,
    protected fieldDefinitionOptions: Options
  ) {
    super(dataSourceField, fieldDefinitionOptions);
    this.customAttributeQueryInfo = customAttributeQueryInfo[
      fieldDefinitionOptions.customAttributeType
    ] as CustomAttributeWithJoin;
  }

  getTableAlias(): string {
    return getTableAlias(this.dataSourceField.dataSourceIndex, {
      suffix: this.fieldDefinitionOptions.customAttribute,
    });
  }

  addRequiredJoins(
    queryBuilder: QueryBuilder,
    {
      unnestInlineArrays,
    }: { isGroupBy: boolean; unnestInlineArrays: boolean | undefined }
  ): QueryBuilder {
    if (unnestInlineArrays) {
      return queryBuilder.innerJoin(
        `${this.customAttributeQueryInfo.pgTable} as ${this.getTableAlias()}`,
        (join) =>
          join.onRef(
            `${this.getTableAlias()}.${this.customAttributeQueryInfo.pgIdColumn}`,
            'in',
            sql`(select (jsonb_array_elements_text((${this.getCustomAttributeAsColumn(false)})::jsonb)::${sql.raw(this.customAttributeQueryInfo.pgIdColumnDataType)}))`
          )
      );
    }

    if ('pgTable' in this.customAttributeQueryInfo) {
      return queryBuilder.leftJoinLateral(
        ({ eb }) => {
          const from = eb.selectFrom(
            `${this.customAttributeQueryInfo.pgTable} as tt`
          );

          return from
            .select(({ eb }) =>
              eb.fn
                .coalesce(
                  eb.fn.jsonAgg(
                    `tt.${this.customAttributeQueryInfo.pgLabelColumn}`
                  ),
                  sql`'[]'`
                )
                .as(this.customAttributeQueryInfo.pgLabelColumn)
            )
            .whereRef(
              `tt.${this.customAttributeQueryInfo.pgIdColumn}`,
              'in',
              sql`(select (jsonb_array_elements_text((${this.getCustomAttributeAsColumn(false)})::jsonb)::${sql.raw(this.customAttributeQueryInfo.pgIdColumnDataType)}))`
            )
            .as(this.getTableAlias());
        },
        (join) => join.onTrue()
      );
    }
    throw new Error('Unsupported lateral join for custom attribute');
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
