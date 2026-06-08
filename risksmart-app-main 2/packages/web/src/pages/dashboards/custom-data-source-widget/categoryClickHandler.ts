import type {
  TypedPropertyFilterQuery,
  TypedPropertyFilterToken,
} from '@risksmart-app/components/src/table/tableUtils';
import type { GroupByDatePrecision } from '@risksmart-app/shared/reporting/api/schema';
import type { DataType } from '@risksmart-app/shared/reporting/datasets/types';
import type { CustomDatasourceField } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import { getFieldUniqueId } from 'src/pages/custom-datasources/update/fieldValue';

import { tablePropertyFilterDateFormat } from '@/utils/dateUtils';

/**
 * Creates a filter property query based on a category value and date precision
 * @param param0
 * @returns
 */
export const getFilterPropertyForCategory = ({
  value,
  x1FieldDatePrecision,
  x1Field,
  x1FieldType,
}: {
  value: unknown;
  x1FieldDatePrecision?: GroupByDatePrecision | null;
  x1Field: CustomDatasourceField;
  x1FieldType: DataType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): TypedPropertyFilterQuery<any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenGroups: TypedPropertyFilterToken<any>[] = [];

  if (x1FieldType === 'date') {
    if (value === null) {
      tokenGroups.push({
        propertyKey: getFieldUniqueId(x1Field),
        operator: '=',
        value: value,
      });
    } else {
      const precision = x1FieldDatePrecision ?? 'day';
      const start = dayjs(value as string).startOf(precision);
      const end = start.add(1, precision);

      tokenGroups.push({
        propertyKey: getFieldUniqueId(x1Field),
        operator: '>=',
        value: start.format(tablePropertyFilterDateFormat),
      });
      tokenGroups.push({
        propertyKey: getFieldUniqueId(x1Field),
        operator: '<',
        value: end.format(tablePropertyFilterDateFormat),
      });
    }
  } else {
    tokenGroups.push({
      propertyKey: getFieldUniqueId(x1Field),
      operator: '=',
      value,
    });
  }

  return {
    operation: 'and',
    tokenGroups,
    tokens: [],
  };
};
