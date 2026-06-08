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

import { buildInlineArrayFilterPredicate } from '../../sqlQueryHelpers';
import { CustomAttributeColumn } from './CustomAttributeColumn';

interface Options {
  customAttribute: string;
  customAttributeType: CustomAttributeFieldType;
}

/**
 * Represents a column that that requires a join to another table to display multiple vlues in a single column
 */
export class CustomAttributeInlinedArrayColumn extends CustomAttributeColumn {
  constructor(
    dataSourceField: DataSourceField,
    protected fieldDefinitionOptions: Options
  ) {
    super(dataSourceField, fieldDefinitionOptions);
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
