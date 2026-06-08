import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { DataSourceField } from '@risksmart-app/shared/reporting/api/schema';
import type { AliasableExpression } from 'kysely';
import { sql } from 'kysely';

import { customAttributeQueryInfo } from '../../custom-attribute-fields';
import {
  assertValidCustomAttributeName,
  getTableAlias,
} from '../../sqlQueryHelpers';
import { BaseColumn } from './BaseColumn';

interface Options {
  customAttribute: string;
  customAttributeType: CustomAttributeFieldType;
}

/**
 * Represents a column that is a custom attrinbute.
 */
export class CustomAttributeColumn extends BaseColumn {
  constructor(
    dataSourceField: DataSourceField,
    private fieldDefinition: Options
  ) {
    super(dataSourceField);
  }

  getSelectExpression(): AliasableExpression<unknown>[] {
    return [this.getCustomAttributeAsColumn(true)];
  }

  /**
   * Returns sql to query a custom attribute data column json field
   * @param field
   * @returns
   */
  getCustomAttributeAsColumn = (castToPgIdColumnDataType: boolean = true) => {
    /*
      As we are using sql literals here to generate the query, we need to ensure that any user submitted data is safe.
      In the statement below, sql.lit(fieldDefinition.customAttribute) is the only text that the customer can choose themselves, and although it's checked against the json schema for the table,
      this area of the system lacks good validation.
    */
    // Note this check is already made elsewhere, but just to be sure!
    assertValidCustomAttributeName(this.fieldDefinition.customAttribute);

    const customAttributeQuery =
      customAttributeQueryInfo[this.fieldDefinition.customAttributeType];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const column = sql<any>`${sql.table(getTableAlias(this.dataSourceField.dataSourceIndex, { isJoinTable: false }))}.${sql.ref('CustomAttributeData')} ->> ${sql.lit(this.fieldDefinition.customAttribute)}`;
    if (
      !customAttributeQuery ||
      customAttributeQuery.pgIdColumnDataType === 'text' ||
      !castToPgIdColumnDataType
    ) {
      return column;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sql<any>`(${column})::${sql.raw(customAttributeQuery.pgIdColumnDataType)}`;
  };
}
