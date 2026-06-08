import type {
  DataSourceField,
  DatasourceRelationshipType,
  DataSourceRequest,
  FilterGroup,
  GroupBy,
} from '@risksmart-app/shared/reporting/api/schema';
import type { DataType } from '@risksmart-app/shared/reporting/datasets/types';
import { aggregateTypeSupportedDataTypes } from '@risksmart-app/shared/reporting/dataTypes';
import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import type { ParentTypeEnum } from 'generated/graphql';
import type { DB } from 'generated-db/db';
import { BadRequest } from 'http-errors';
import type {
  AggregateFunctionBuilder,
  AliasableExpression,
  Expression,
  ExpressionBuilder,
  ExpressionWrapper,
  SqlBool,
} from 'kysely';
import { Kysely, PostgresDialect, sql } from 'kysely';
import _ from 'lodash';
import { Pool, types } from 'pg';
import { format } from 'sql-formatter';
import { getLogger } from 'src/logger';

import { CustomDatasourceService } from './customDatasourceService';
import type { ParentJoinInfo } from './datasets/types';
import { getFieldAlias, getTableAlias } from './sqlQueryHelpers';
import type { QueryBuilder, QueryOptions } from './types';

const int8TypeId = 20;
// Map int8 to number.
types.setTypeParser(int8TypeId, (val) => {
  return parseInt(val, 10);
});

// Because of the dynamic nature of these queries, used a typed Kysely instance is more of a hindrance then a help,
// so setting generic to any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

const logger = getLogger();

/**
 * Returns the sql command required to retrieve the requested data
 * @param options
 * @returns
 */
export const getReportDataSql = async (options: QueryOptions) => {
  const {
    getDatasetByType,
    getFieldDefinition,
    getDatasetByIndex,
    getQueryColumn,
  } = await CustomDatasourceService(options);

  // Create memoization maps to avoid redundant lookups
  const datasetByTypeCache = new Map<
    string,
    ReturnType<typeof getDatasetByType>
  >();
  const datasetByIndexCache = new Map<
    number,
    ReturnType<typeof getDatasetByIndex>
  >();
  const fieldDefinitionCache = new Map<
    string,
    ReturnType<typeof getFieldDefinition>
  >();
  const queryColumnCache = new Map<string, ReturnType<typeof getQueryColumn>>();

  // Helper function to create cache key for DataSourceField
  const getFieldCacheKey = (field: DataSourceField): string =>
    `${field.dataSourceIndex}:${field.fieldId}`;

  // Memoized wrapper functions
  const memoizedGetDatasetByType = (datasource: DataSourceRequest) => {
    const key = `${datasource.type}:${datasource.parentIndex ?? 'null'}:${datasource.latest ?? false}`;
    if (!datasetByTypeCache.has(key)) {
      datasetByTypeCache.set(key, getDatasetByType(datasource));
    }

    return datasetByTypeCache.get(key)!;
  };

  const memoizedGetDatasetByIndex = (index: number) => {
    if (!datasetByIndexCache.has(index)) {
      datasetByIndexCache.set(index, getDatasetByIndex(index));
    }

    return datasetByIndexCache.get(index)!;
  };

  const memoizedGetFieldDefinition = (field: DataSourceField) => {
    const key = getFieldCacheKey(field);
    if (!fieldDefinitionCache.has(key)) {
      fieldDefinitionCache.set(key, getFieldDefinition(field));
    }

    return fieldDefinitionCache.get(key)!;
  };

  const memoizedGetQueryColumn = (field: DataSourceField) => {
    const key = getFieldCacheKey(field);
    if (!queryColumnCache.has(key)) {
      queryColumnCache.set(key, getQueryColumn(field));
    }

    return queryColumnCache.get(key)!;
  };

  /**
   * Recursively get all filters from a filter group.
   * Does not include the operator or value
   * @param filterGroup
   * @returns
   */
  const getFilterFields = (filterGroup?: FilterGroup): DataSourceField[] => {
    if (!filterGroup) {
      return [];
    }
    const filterFields: DataSourceField[] = [];
    for (const filter of filterGroup.filters) {
      if ('filters' in filter) {
        filterFields.push(...getFilterFields(filter));
      } else {
        filterFields.push(filter.field);
      }
    }

    return filterFields;
  };

  // opting in to logged options as some of the values may contain customer sensitive data
  logger.appendKeys({
    limit: options.limit,
    offset: options.offset,
    fields: options.fields,
    dataSources: options.dataSources,
    filters: getFilterFields(options.filters),
    groupBy: options.groupBy,
    aggregateField: options.aggregateField,
    aggregateType: options.aggregateType,
    unnestInlineArrays: options.unnestInlineArrays,
    distinct: options.distinct,
  });

  /**
   * Construct the sql query
   * @returns
   */
  const buildQuery = (): QueryBuilder => {
    const { offset, limit, filters, distinct } = options;
    let queryBuilder = addFromClauseToQuery();
    queryBuilder = addSelectClauseToQuery(queryBuilder);
    queryBuilder = addGroupByClauseToQuery(queryBuilder);

    if (filters) {
      queryBuilder = addWhereClauseToQuery(queryBuilder);
    }

    if (offset) {
      queryBuilder = queryBuilder.offset(offset);
    }
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }
    if (distinct) {
      queryBuilder = queryBuilder.distinct();
    }

    return queryBuilder;
  };

  /**
   * Adds a GROUP BY clause to the query.
   * This will add number based group by clause for simplicity.
   * @param queryBuilder The query builder to modify
   * @returns The modified query builder
   */
  const addGroupByClauseToQuery = (
    queryBuilder: QueryBuilder
  ): QueryBuilder => {
    const { groupBy } = options;
    if (!groupBy || groupBy.length === 0) {
      return queryBuilder;
    }
    let index = 0;
    groupBy.forEach((group) => {
      index += 1;
      queryBuilder = queryBuilder.groupBy(sql.lit<number>(index));

      const additionalResponse = group.field
        ? memoizedGetQueryColumn(group.field).addAdditionalGroupbys(
            queryBuilder,
            index
          )
        : { queryBuilder, index };
      index = additionalResponse.index;
      queryBuilder = additionalResponse.queryBuilder;
    });

    return queryBuilder;
  };

  const getFilterGroupExpression = (
    filterGroup: FilterGroup,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eb: ExpressionBuilder<any, any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ExpressionWrapper<any, any, SqlBool> | null => {
    const { groupBy } = options;
    const conditions: Expression<SqlBool>[] = [];

    for (const filter of filterGroup.filters) {
      if ('filters' in filter) {
        const groupExpression = getFilterGroupExpression(filter, eb);
        if (groupExpression) {
          conditions.push(groupExpression);
        }
        continue;
      }

      const fieldDefinition = memoizedGetFieldDefinition(filter.field);
      let value = filter.value;

      const cols = memoizedGetQueryColumn(filter.field).getSelectExpression();
      let col = cols[0];
      if (!col) {
        throw new Error('Missing col');
      }

      if (['contains', ':', '!:'].includes(filter.operator)) {
        value = `%${filter.value}%`;
        if (fieldDefinition.dataType === 'guid') {
          col = sql`${col}::text`;
        }
      }
      const isGroupBy = !!groupBy?.find(
        (g) =>
          g.field.dataSourceIndex === filter.field.dataSourceIndex &&
          g.field.fieldId === filter.field.fieldId
      );

      conditions.push(
        memoizedGetQueryColumn(filter.field).getFilterExpression(eb, col, {
          isGroupBy,
          filter: { value, operator: filter.operator, field: filter.field },
          unnestInlineArrays: options.unnestInlineArrays,
        })
      );
    }

    if (conditions.length === 0) {
      return null;
    }

    switch (filterGroup.operation) {
      case 'and':
        return eb.and(conditions);
      case 'or':
        return eb.or(conditions);
      default:
        throw new BadRequest(
          `Unsupported filter operation ${filterGroup.operation}`
        );
    }
  };

  const getJoinFunction = (
    queryBuilder: QueryBuilder,
    datasource: DataSourceRequest
  ): QueryBuilder['innerJoin'] => {
    switch (datasource.joinType) {
      case 'left':
        return queryBuilder.leftJoin.bind(queryBuilder);
      default:
        return queryBuilder.innerJoin.bind(queryBuilder);
    }
  };

  /**
   * Adds a WHERE clause to the query.
   * @param queryBuilder The query builder to modify
   * @returns The modified query builder
   */
  const addWhereClauseToQuery = (queryBuilder: QueryBuilder): QueryBuilder => {
    const { filters } = options;

    if (!filters || filters.filters.length === 0) {
      return queryBuilder;
    }

    return queryBuilder.where(({ eb }) => {
      const expression = getFilterGroupExpression(filters, eb);

      return expression ?? eb(sql.lit(1), '=', sql.lit(1)); // 1=1 is just to keep kysely types happy
    });
  };

  /**
   * Builds the from clause of the sql query
   * @param datasources
   * @returns
   */
  const addFromClauseToQuery = (): QueryBuilder => {
    const { dataSources, fields, filters, groupBy, aggregateField } = options;

    if (!hasLengthAtLeast(dataSources, 1)) {
      throw new BadRequest('At least 1 datasource is required');
    }
    const topLevelDatasources = dataSources.filter(
      (d) => d.parentIndex === undefined
    );

    if (!hasLengthAtLeast(topLevelDatasources, 1)) {
      throw new BadRequest('At least 1 datasource must have no parents');
    }

    const initialDatasource = dataSources[0];

    const datasourcesToJoin = dataSources.filter(
      (ds) => ds !== initialDatasource
    );

    const initialDatasetDef = memoizedGetDatasetByIndex(0);

    const tableAlias = getTableAlias(dataSources.indexOf(initialDatasource));
    let queryBuilder: QueryBuilder = db.selectFrom(
      `${initialDatasetDef.pgTable} as ${tableAlias}`
    );

    datasourcesToJoin.forEach((rightDatasource, index) => {
      // plus 1 as we have already removed the first item
      const rightDataSourceIndex = index + 1;
      const relationshipToLeft =
        rightDatasource.relationshipToParentIndex ?? 'child';

      if (_.isNil(rightDatasource.parentIndex)) {
        throw new BadRequest(
          `Cannot have multiple data sources without a parent ${rightDatasource.parentIndex}`
        );
      }
      const leftDatasetRequest = dataSources[rightDatasource.parentIndex];
      if (!leftDatasetRequest) {
        throw new BadRequest(
          `No datasource found for parentIndex ${rightDatasource.parentIndex}"`
        );
      }
      const rightDatasetDef = memoizedGetDatasetByType(rightDatasource);
      const leftDatasetDef = memoizedGetDatasetByType(leftDatasetRequest);

      const leftToRightRelationships =
        leftDatasetDef.datasetRelationships[rightDatasource.type];

      if (!leftToRightRelationships) {
        throw new BadRequest(
          `Unsupported join between "${leftDatasetRequest.type}" and "${rightDatasource.type}"`
        );
      }

      if (!leftToRightRelationships.includes(relationshipToLeft)) {
        throw new BadRequest(
          `Unsupported "${relationshipToLeft}" join between "${leftDatasetRequest.type}" and "${rightDatasource.type}"`
        );
      }

      const rightTableAlias = getTableAlias(rightDataSourceIndex);
      const leftTableAlias = getTableAlias(rightDatasource.parentIndex);

      /**
       * Selects the appropriate parent join configuration based on the left dataset's objectType.
       * If the dataset has multiple parent join paths (parentJoinPaths), this function will:
       * 1. Check if any path has applicableForObjectTypes that matches the left dataset
       * 2. Fall back to parentJoin if no matching path is found or parentJoinPaths is not defined
       */
      const getApplicableParentJoin = (
        dataset: ReturnType<typeof memoizedGetDatasetByType>,
        leftDatasetObjectType?: ParentTypeEnum
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ): any => {
        // If multiple parent join paths are defined, try to find one that applies to the left dataset
        if (dataset.parentJoinPaths && leftDatasetObjectType) {
          for (const joinInfo of Object.values(dataset.parentJoinPaths)) {
            if (
              joinInfo.applicableForObjectTypes?.includes(leftDatasetObjectType)
            ) {
              return joinInfo;
            }
          }
        }

        // Fall back to single parent join configuration
        return dataset.parentJoin;
      };

      const getJoinInfo = (
        datasourceRelationshipType: DatasourceRelationshipType
      ) => {
        switch (datasourceRelationshipType) {
          case 'child': {
            // Currently the joins are represented as a tree, with only one join allowed to the left, but multiple to right.
            // The code below allows us to join to the left via a different column/table
            // which is useful for pre-aggregated data sets.
            const parentJoin =
              rightDatasetDef.parentJoinForSingleParent ??
              getApplicableParentJoin(
                rightDatasetDef,
                leftDatasetDef.objectType
              );
            if (!parentJoin) {
              throw new Error(
                `Missing parent join for relationship ${datasourceRelationshipType}`
              );
            }

            return parentJoin;
          }
          case 'parent': {
            const parentJoin = getApplicableParentJoin(
              leftDatasetDef,
              rightDatasetDef.objectType
            );

            if (!parentJoin) {
              throw new Error(
                `Missing parent join for relationship ${datasourceRelationshipType}`
              );
            }

            return parentJoin;
          }
          case 'sibling': {
            if (!rightDatasetDef.objectType) {
              throw new Error(
                `Cannot perform a sibling join on dataset ${rightDatasetDef.pgTable} as it does not have objectType set`
              );
            }
            if (!leftDatasetDef.objectType) {
              throw new Error(
                `Cannot perform a sibling join on dataset ${leftDatasetDef.pgTable} as it does not have objectType set`
              );
            }
            const linkedItemJoin: ParentJoinInfo<
              never,
              'risksmart.linked_item'
            > = {
              pgTable: 'risksmart.linked_item',
              parentKeyCol: 'Target',
              idCol: 'Source',
              additionalJoinClauses: [
                {
                  pgColumn: 'TargetType',
                  filterValue: rightDatasetDef.objectType,
                },
                {
                  pgColumn: 'SourceType',
                  filterValue: leftDatasetDef.objectType,
                },
              ],
            };

            return linkedItemJoin;
          }
        }
      };

      const joinInfo = getJoinInfo(relationshipToLeft);

      if (joinInfo?.pgTable) {
        const junctionAlias = getTableAlias(rightDataSourceIndex, {
          isJoinTable: true,
        });

        const parentDatasetDef = memoizedGetDatasetByIndex(
          rightDatasource.parentIndex
        );

        const {
          pgTable: junctionPgTable,
          parentKeyCol,
          idCol,
          additionalJoinClauses,
        } = joinInfo;

        const parentJunctionColumn = `${junctionAlias}.${parentKeyCol as string}`;
        const childJunctionColumn = `${junctionAlias}.${idCol as string}`;

        const leftJunctionColumn =
          relationshipToLeft === 'child'
            ? parentJunctionColumn
            : childJunctionColumn;
        const rightJunctionColumn =
          relationshipToLeft === 'child'
            ? childJunctionColumn
            : parentJunctionColumn;

        queryBuilder = getJoinFunction(queryBuilder, rightDatasource)(
          `${junctionPgTable} as ${junctionAlias}`,
          (join) => {
            let joinClause = join.onRef(
              leftJunctionColumn,
              '=',
              `${leftTableAlias}.${parentDatasetDef.pk}`
            );
            if (additionalJoinClauses) {
              for (const clause of additionalJoinClauses) {
                joinClause = joinClause.on(
                  `${junctionAlias}.${clause.pgColumn}`,
                  '=',
                  sql.lit(clause.filterValue)
                );
              }
            }

            return joinClause;
          }
        );

        queryBuilder = getJoinFunction(queryBuilder, rightDatasource)(
          `${rightDatasetDef.pgTable} as ${rightTableAlias}`,
          `${rightTableAlias}.${rightDatasetDef.pk}`,
          rightJunctionColumn
        );
      } else {
        const parentCol = `${relationshipToLeft === 'child' ? rightTableAlias : leftTableAlias}.${joinInfo.parentKeyCol as string}`;
        const childCol =
          relationshipToLeft === 'child'
            ? `${leftTableAlias}.${leftDatasetDef.pk}`
            : `${rightTableAlias}.${rightDatasetDef.pk}`;
        queryBuilder = getJoinFunction(queryBuilder, rightDatasource)(
          `${rightDatasetDef.pgTable} as ${rightTableAlias}`,
          parentCol,
          childCol
        );
      }
    });

    const filterFields = filters ? getFilterFields(filters) : [];

    const groupByFields = groupBy?.map((f) => f.field) ?? [];

    const fieldsAndFilterFields = filterFields
      .concat(fields ?? [])
      .concat(aggregateField ? [aggregateField] : [])
      .concat(groupByFields);

    // Some columns require additional joins to retrieve the data
    const addedJoins = new Set<string>();
    fieldsAndFilterFields?.forEach((field) => {
      const column = memoizedGetQueryColumn(field);

      // Check if this column requires a parent join (for parentInlineArrayJoin fields)
      if (
        'getRequiredParentJoin' in column &&
        typeof column.getRequiredParentJoin === 'function'
      ) {
        const parentJoin = column.getRequiredParentJoin();
        if (parentJoin && !addedJoins.has(parentJoin.alias)) {
          queryBuilder = parentJoin.addJoin(queryBuilder);
          addedJoins.add(parentJoin.alias);
        }
      }

      const tableAlias = column.getTableAlias();
      if (!addedJoins.has(tableAlias)) {
        const isGroupBy = !!groupBy?.find(
          (f) =>
            f.field.fieldId === field.fieldId &&
            f.field.dataSourceIndex === field.dataSourceIndex
        );
        queryBuilder = column.addRequiredJoins(queryBuilder, {
          isGroupBy,
          unnestInlineArrays: options.unnestInlineArrays,
        });
        addedJoins.add(tableAlias);
      }
    });

    return queryBuilder;
  };

  const getAggregatedField = () => {
    const { aggregateType, aggregateField } = options;
    if (!aggregateType) {
      throw new Error('Missing aggregateType');
    }
    if (!aggregateField) {
      throw new Error(
        `Aggregate field required for aggregate type ${aggregateType}`
      );
    }

    const aggregateFieldDefinition = memoizedGetFieldDefinition(aggregateField);

    if (
      aggregateFieldDefinition.dataType &&
      !aggregateTypeSupportedDataTypes[aggregateType].includes(
        aggregateFieldDefinition.dataType as DataType
      )
    ) {
      throw new Error(
        `Aggregate type ${aggregateType} does not support aggregation field data type ${aggregateFieldDefinition.dataType}`
      );
    }
    const cols = memoizedGetQueryColumn(aggregateField).getSelectExpression();

    const col = cols[0];
    if (!col) {
      throw new Error(`Missing col`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aggregationBuilder: AggregateFunctionBuilder<DB, keyof DB, any>;
    switch (aggregateType) {
      case 'avg':
        aggregationBuilder = db.fn.avg(col);
        break;
      case 'min':
        aggregationBuilder = db.fn.min(col);
        break;
      case 'max':
        aggregationBuilder = db.fn.max(col);
        break;
      case 'sum':
        aggregationBuilder = db.fn.sum(col);
        break;
      case 'count':
        aggregationBuilder = db.fn.count(col);
        break;
      case 'distinctCount':
        aggregationBuilder = db.fn.count(col).distinct();
        break;
      default:
        throw new Error(`Unsupported aggregateType ${aggregateType}`);
    }

    return aggregationBuilder;
  };

  /**
   * Get select expression for group by field
   * @param groupBy
   * @returns
   */
  const getGroupBySelectExpression = (
    groupBy: GroupBy
  ): AliasableExpression<unknown>[] => {
    const cols = memoizedGetQueryColumn(groupBy.field).getSelectExpression();
    if (groupBy.datePrecision) {
      const groupByFieldDefinition = memoizedGetFieldDefinition(groupBy.field);
      if (groupByFieldDefinition.dataType !== 'date') {
        throw new Error('Cannot use datePrecision on a non-date field');
      }
      if (!cols[0]) {
        throw new Error('Missing col');
      }

      return [
        db.fn('date_trunc', [sql.lit(groupBy.datePrecision), cols[0]]),
        ...cols.splice(1),
      ];
    } else {
      return cols;
    }
  };

  /**
   * Creates the "select" clauses of the query
   * @param queryBuilder
   * @param param1
   * @returns
   */
  const addSelectClauseToQuery = (queryBuilder: QueryBuilder): QueryBuilder => {
    const { fields, groupBy, aggregateType, aggregateField } = options;

    const selectFields: AliasableExpression<unknown>[] = [];

    if (fields && fields.length > 0 && groupBy && groupBy.length > 0) {
      throw new Error('Cannot specified both fields and groupBy');
    }
    if (aggregateType) {
      groupBy?.forEach((grouping) => {
        const cols = getGroupBySelectExpression(grouping);
        cols.forEach((col) => {
          selectFields.push(col);
        });
      });

      if (aggregateType === 'count' && !aggregateField) {
        selectFields.push(db.fn.countAll());
      } else {
        selectFields.push(getAggregatedField());
      }
    } else {
      if (!hasLengthAtLeast(fields ?? [], 1)) {
        throw new BadRequest('At least 1 field is required');
      }

      fields?.forEach((field) => {
        const cols = memoizedGetQueryColumn(field).getSelectExpression();
        cols.forEach((col) => {
          selectFields.push(col);
        });
      });
    }

    return queryBuilder.select(
      selectFields.map((sf, fieldIndex) => sf.as(getFieldAlias(fieldIndex)))
    );
  };

  logger.info('Compiling SQL query');
  const compiled = buildQuery().compile();
  logger.info('SQL generated', { sql: compiled.sql });

  return {
    sql: format(compiled.sql, { language: 'postgresql' }),
    parameters: compiled.parameters,
  };
};
