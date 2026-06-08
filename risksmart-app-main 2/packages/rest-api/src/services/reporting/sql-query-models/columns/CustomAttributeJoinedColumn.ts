import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { DataSourceField } from '@risksmart-app/shared/reporting/api/schema';
import type { AliasableExpression, JoinBuilder } from 'kysely';
import { sql } from 'kysely';

import { customAttributeQueryInfo } from '../../custom-attribute-fields';
import type { CustomAttributeWithJoin } from '../../custom-attribute-fields/types';
import { getTableAlias } from '../../sqlQueryHelpers';
import type { QueryBuilder } from '../../types';
import { CustomAttributeColumn } from './CustomAttributeColumn';

interface Options {
  customAttribute: string;
  pgLabelColumn: string;
  customAttributeType: CustomAttributeFieldType;
}

/**
 * Represents a custom attribute that requires a join to another table
 */
export class CustomAttributeJoinedColumn extends CustomAttributeColumn {
  customAttributeQueryInfo: CustomAttributeWithJoin;
  constructor(
    dataSourceField: DataSourceField,
    protected joinFieldDefinition: Options
  ) {
    super(dataSourceField, joinFieldDefinition);

    this.customAttributeQueryInfo = customAttributeQueryInfo[
      joinFieldDefinition.customAttributeType
    ] as CustomAttributeWithJoin;
  }

  getSelectExpression(): AliasableExpression<unknown>[] {
    return [
      sql.ref(
        `${getTableAlias(this.dataSourceField.dataSourceIndex, { suffix: this.joinFieldDefinition.customAttribute })}.${this.joinFieldDefinition.pgLabelColumn}`
      ),
    ];
  }

  addRequiredJoins(
    queryBuilder: QueryBuilder,
    _options: { isGroupBy: boolean; unnestInlineArrays: boolean | undefined }
  ): QueryBuilder {
    return queryBuilder.leftJoin(
      `${this.customAttributeQueryInfo.pgTable} as ${this.getTableAlias()}`,
      (join) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let joinBuilder: JoinBuilder<any, any> = join;

        joinBuilder = joinBuilder.onRef(
          this.getCustomAttributeAsColumn(),
          '=',
          `${this.getTableAlias()}.${this.customAttributeQueryInfo.pgIdColumn}`
        );

        return joinBuilder;
      }
    );
  }

  getTableAlias() {
    return getTableAlias(this.dataSourceField.dataSourceIndex, {
      suffix: this.joinFieldDefinition.customAttribute,
    });
  }
}
