import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { DatasourceRelationshipType } from '@risksmart-app/shared/reporting/api/schema';
import { getDatasetRelationships } from '@risksmart-app/shared/reporting/datasetRelationships';
import type { SharedDataset } from '@risksmart-app/shared/reporting/datasets/types';
import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import type { ParentTypeEnum } from 'generated/graphql';
import type { DB } from 'generated-db/db';

import type { InlineArrayJoinArrayFieldTypes } from '../lateral-join-array-field-types';

export type TableNames = keyof DB;

/**
 * Represents a column that exists on the primary table
 */
interface ColumnFieldType<Table extends TableNames> {
  /**
   * Postgres column associated with this field
   */
  pgColumn: keyof DB[Table];
  fieldType: 'column';
  isFromJoinTable?: false;
}

/**
 * Represents a custom attribute field on a CustomAttribute column
 */
export interface CustomAttributeFieldDefType {
  /**
   * Field name of custom attribute
   */
  customAttribute: string;
  fieldType: 'customAttribute';
  isFromJoinTable?: false;
  customAttributeType: CustomAttributeFieldType;
}

/**
 * Represents a column that exists on the table that joins to the parent!
 */
interface ParentColumnFieldType<Table extends TableNames> {
  /**
   * Postgres column associated with this field
   */
  pgColumn: keyof DB[Table];
  fieldType: 'column';
  isFromJoinTable: true;
}

/**
 * Represents a column that exists on another table
 */
type LazyJoinedColumn<
  ParentTable extends TableNames,
  Lz extends LazyTables<ParentTable>,
  TableRef,
> = TableRef extends keyof Lz
  ? {
      /**
       * Postgres column associated with this field
       */
      pgColumn: keyof DB[Lz[TableRef]['pgTable']];
      /**
       * Reference to table with this column.
       */
      tableRef: ExtractStrings<TableRef>;
      fieldType: 'lazyJoinedColumn';
      isFromJoinTable?: false;

      /**
       * Additional columns that should be queried/grouped on along with pgColumn
       * This is useful when a column has multiple attributes such as a colour which are also stored in the database,
       * but shouldn't be exposed for filtering
       * Note: this option must be used carefully, as it can potentially effect the results of a group buy
       * i.e. that same meta column values must be returned for a specific pgColumn
       */
      metaPgColumns?: { [key: string]: keyof DB[Lz[TableRef]['pgTable']] };

      /**
       * Additional columns from the SOURCE table (not the joined table) to include as meta.
       * Useful when the source table has related data (e.g. likelihood/impact) that should
       * accompany the joined column value.
       */
      sourceMetaPgColumns?: { [key: string]: keyof DB[ParentTable] & string };
    }
  : never;

/**
 * Represents an array column that needs to be retrieved with a lateral join.
 * Useful for retrieving multiple items for a single row
 */
export interface InlineArrayJoinFieldType {
  fieldType: 'inlineArrayJoin';
  type: InlineArrayJoinArrayFieldTypes;
  /**
   * Optional override for which column to use as the ID for the join.
   * If not specified, uses the dataset's primary key (pk).
   * Useful when querying from a view where the relevant ID is not the PK.
   *
   * Example: When querying questionnaires_view,
   * tags/owners/contributors are associated with TemplateId, not Id.
   */
  idColumn?: string;
}

export type ParentJoinInfo<
  Table extends TableNames,
  ParentJoinTable extends TableNames,
> =  // Many to Many
  | {
      pgTable: ParentJoinTable;

      /**
       * Parent column on parent join table
       */
      parentKeyCol: keyof DB[ParentJoinTable];
      /**
       * Id column on parent join table
       */
      idCol: keyof DB[ParentJoinTable];

      /**
       * Add additional join clauses
       */
      additionalJoinClauses?: {
        pgColumn: keyof DB[ParentJoinTable];
        filterValue: string;
      }[];

      /**
       * Specifies which parent object types this join path applies to.
       * Used when a dataset has multiple parent join paths (parentJoinPaths).
       * If specified, this join will only be used when the left dataset's objectType matches one of these.
       */
      applicableForObjectTypes?: ParentTypeEnum[];
    }
  // One to many
  | {
      pgTable: null;
      parentKeyCol: keyof DB[Table];
      idCol: null;

      /**
       * Specifies which parent object types this join path applies to.
       * Used when a dataset has multiple parent join paths (parentJoinPaths).
       * If specified, this join will only be used when the left dataset's objectType matches one of these.
       */
      applicableForObjectTypes?: ParentTypeEnum[];
    };

export interface Dataset<
  FieldIds extends string,
  Table extends TableNames,
  ParentJoinTable extends TableNames,
  Lz extends LazyTables<Table>,
  ParentJoinForSingleParentTable extends TableNames = ParentJoinTable,
> {
  /**
   * Basically this is the value saved in the risksmart.node table for this type of entity.
   * It's important to set this to allow for correct filtering on the risksmart.linked_item table
   */
  objectType?: ParentTypeEnum;
  /**
   * When specified, retrieves custom attributes fields
   */
  customAttributeFormConfigurationParentTypes?: ParentTypeEnum[];
  /**
   * Postgres table that this dataset is associated with.
   * Note, could expand this to be a view/ multiple joined tables etc in future
   */
  pgTable: Table;
  /**
   * Primary key of postgres table
   */
  pk: keyof DB[Table];

  datasetRelationships: {
    [datasourceType in DataSourceType]?: DatasourceRelationshipType[];
  };
  /**
   * Information on how this dataset joins to other datasets
   * If pgTable is set, then we have a many-2-many relationship and require two joins
   */
  parentJoin?: ParentJoinInfo<Table, ParentJoinTable>;

  /**
   * Multiple named parent join paths for datasets that can join to different parent types via different foreign keys.
   *
   * Example: third_party_response can join to third_party via ParentId OR questionnaire_template_version via QuestionnaireTemplateVersionId.
   *
   * Usage:
   * ```typescript
   * parentJoinPaths: {
   *   thirdParty: {
   *     pgTable: null,
   *     idCol: null,
   *     parentKeyCol: 'ParentId',
   *     applicableForObjectTypes: [ParentTypeEnum.ThirdParty],
   *   },
   *   questionnaireTemplateVersion: {
   *     pgTable: null,
   *     idCol: null,
   *     parentKeyCol: 'QuestionnaireTemplateVersionId',
   *     applicableForObjectTypes: [ParentTypeEnum.QuestionnaireTemplateVersion],
   *   },
   * },
   * ```
   *
   * The appropriate path is automatically selected based on the left dataset's objectType during query building.
   * If no matching path is found (or parentJoinPaths is not specified), falls back to the single parentJoin.
   */
  parentJoinPaths?: {
    [pathName: string]: ParentJoinInfo<Table, ParentJoinTable>;
  };

  /**
   * This is a bit confusing, and really a bit of a hack to avoid remodelling how datasets are related to each other,
   * but essentially this can be set to override how this dataset is joined to its parent in the data source tree, whilst
   * allowing the the current parentJoin to be used when joining to parent datasets that appear under this dataset in the data source tree.
   * Why on earth would we want this?
   * For latest test results, we're using a view why contains the latest test result for each control or assessment, so we don't want to join to a different parent
   * due to the fast there is a many to many relationship between test results and controls/assessments. However, we may still want to join to the parent control/assessment
   * when joining lower in the data source tree, so we can see all parents of the test result.
   */
  parentJoinForSingleParent?: ParentJoinInfo<
    Table,
    ParentJoinForSingleParentTable
  >;

  /**
   * List of fields the user is able to select from this dataset
   */
  fields: {
    [fieldId in FieldIds]: FieldInfo<Table, Lz, ParentJoinTable>;
  };

  /**
   * If a field isn't a column on the primary table, the table it exists on can be specified here, and it will be retrieved if the field/filter requires (currently using a left join)
   */
  relations?: Lz;

  /**
   * If true, this dataset supports getting the latest record for each parent.
   */
  supportedLatest?: boolean;
}

export interface LazyTables<ParentTable extends TableNames> {
  [tableName: string]: JoinedTable<ParentTable>;
}

type JoinedTable<ParentTable extends TableNames> =
  TableNames extends infer Table
    ? Table extends TableNames
      ? {
          pgTable: Table;
          /**
           * Join info
           */
          columnMapping: { pk: keyof DB[Table]; fk: keyof DB[ParentTable] }[];
        }
      : never
    : never;

export type FieldInfo<
  Table extends keyof DB,
  Lz extends LazyTables<Table>,
  ParentJoinTable extends keyof DB,
> =
  | ColumnFieldType<Table>
  | InlineArrayJoinFieldType
  | LazyJoinedColumn<Table, Lz, keyof Lz>
  | ParentColumnFieldType<ParentJoinTable>
  | CustomAttributeFieldDefType;

/**
 * Help function to avoid specifying types when creating a dataset
 * @param obj
 * @returns
 */
export function createDataset<
  Table extends TableNames,
  ParentJoinTable extends TableNames,
  Lz extends LazyTables<Table>,
  S extends SharedDataset,
  ParentJoinForSingleParentTable extends TableNames = ParentJoinTable,
>(
  sharedDataSet: S,
  obj: Omit<
    Dataset<
      ExtractStrings<keyof S['fields']>,
      Table,
      ParentJoinTable,
      Lz,
      ParentJoinForSingleParentTable
    >,
    'datasetRelationships' | 'objectType'
  >
): Dataset<
  ExtractStrings<keyof S['fields']>,
  Table,
  ParentJoinTable,
  Lz,
  ParentJoinForSingleParentTable
> {
  const relationships = sharedDataSet.objectType
    ? getDatasetRelationships(sharedDataSet.objectType)
    : {};

  const fields = obj.fields;
  const relationshipsWithOverrides = {
    ...relationships,
    ...sharedDataSet.datasetRelationshipOverrides,
  };

  return {
    ...sharedDataSet,
    ...obj,
    fields,
    customAttributeFormConfigurationParentTypes:
      sharedDataSet.customAttributeFormConfigurationParentTypes,
    datasetRelationships: relationshipsWithOverrides,
  };
}

type ExtractStrings<T> = T extends string ? T : never;
