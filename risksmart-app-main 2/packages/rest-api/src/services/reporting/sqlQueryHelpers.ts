import type {
  Filter,
  Operator,
} from '@risksmart-app/shared/reporting/api/schema';
import {
  type AliasableExpression,
  type Expression,
  type ExpressionBuilder,
  sql,
  type SqlBool,
} from 'kysely';
import type { BinaryOperatorExpression } from 'kysely/dist/cjs/parser/binary-operation-parser';

/**
 * Gets a unique table alias for a datasources tables
 * @param dataSourceIndex index of the datasource within the datasources array (a data source type can be included more then once)
 * @param options  parentDatasourceIndex - to created a unique alias on junction table
 * @returns
 *  t0,t1,t2,t3 etc for standard tables, where the number if the data sources index
 *  t0-0, t0-1, t1-0 for the junction tables, where the number before the dash is the child table, and the number after the dash is the index of the parent table
 *  t0-tags, t1-deps, t3-xyz - format used when querying additional tables (or performing lateral joins) to retrieve additional columns for a data source.
 *  The label after the number will either by the lateral join type, or table reference given in the dataset definition
 */
export const getTableAlias = (
  dataSourceIndex: number,
  options?: {
    isJoinTable?: boolean;
    suffix?: string;
  }
) => {
  if (options?.isJoinTable) {
    return `t${dataSourceIndex}-join`;
  }
  if (options?.suffix) {
    return `t${dataSourceIndex}-${options?.suffix}`;
  }

  return `t${dataSourceIndex}`;
};

/**
 * Gets a unique alias for a field based on its index
 * @param fieldIndex
 * @returns
 */
export const getFieldAlias = (fieldIndex: number) => {
  return `f${fieldIndex}`;
};

export const getOperator = (
  op: Operator,
  isNullValue: boolean = false
): BinaryOperatorExpression => {
  switch (op) {
    case '=':
      return isNullValue ? 'is' : '=';
    case '!=':
      return isNullValue ? 'is not' : '!=';
    case '<':
    case '>':
    case '>=':
    case '<=':
      return op;
    case ':':
    case 'contains':
      return 'ilike';
    case '!:':
      return 'not ilike';
    default:
      throw new Error(`Unsupported op '${op}'`);
  }
};

export const assertValidCustomAttributeName = (customFieldId: string) => {
  // Prevent sql injection via a user creating a schema that contains sql for field names
  // and then references those fields in a report query!
  if (!/^[a-zA-Z0-9_]*$/.test(customFieldId)) {
    throw new Error(`Invalid custom attribute field id ${customFieldId}`);
  }
};

export const buildInlineArrayFilterPredicate = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eb: ExpressionBuilder<any, any>,
  col: AliasableExpression<unknown>,
  options: {
    isGroupBy: boolean;
    filter: Filter;
    unnestInlineArrays: boolean | undefined;
  }
): Expression<SqlBool> => {
  // resolve the SQL operator (e.g. '=', 'ilike') for the incoming filter
  const operator = getOperator(options.filter.operator);

  // bind the filter value as a parameter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const val = eb.val<any>(options.filter.value);

  // coalesce null to an empty array to support items with no values
  const columnAsJsonb = eb.cast(col, 'jsonb');
  const normalizedArray = eb.fn.coalesce(columnAsJsonb, sql`'[]'::jsonb`);

  if (options.filter.value === null || options.filter.value === 'null') {
    return eb(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eb.fn<any>('jsonb_array_length', [normalizedArray]),
      operator,
      eb.val(0)
    );
  }

  const arrayIsEmpty = eb(
    eb.fn('jsonb_array_length', [normalizedArray]),
    '=',
    eb.val(0)
  );

  // build the JSON array into rows for querying
  const arrayItemsAlias = 'items';
  const buildArrayElementsSelect = () =>
    eb.selectFrom(
      eb.fn('jsonb_array_elements_text', [normalizedArray]).as(arrayItemsAlias)
    );

  // "contains" predicate
  const containsMatch = eb.exists(
    buildArrayElementsSelect()
      .select(sql`1`.as('match'))
      .where(arrayItemsAlias, 'ilike', val)
  );

  if (operator === 'ilike') {
    return containsMatch;
  }

  // "does not contain" predicate
  if (operator === 'not ilike') {
    return eb.or([eb.not(containsMatch), arrayIsEmpty]);
  }

  // "equals" predicate
  const equalityMatch = eb.exists(
    buildArrayElementsSelect()
      .select(sql`1`.as('match'))
      .where(arrayItemsAlias, '=', val)
  );

  if (operator === '=') {
    return equalityMatch;
  }

  // "does not equal" predicate
  if (operator === '!=') {
    return eb.or([eb.not(equalityMatch), arrayIsEmpty]);
  }

  // fallback: compare the value against ANY element for other operators
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrayQuery = eb.fn.any<any>(buildArrayElementsSelect().selectAll());

  return eb(val, operator, arrayQuery);
};
