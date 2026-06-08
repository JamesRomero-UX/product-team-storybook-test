import type {
  PropertyFilterProperty,
  PropertyFilterQuery,
  UseCollectionResult,
} from '@cloudscape-design/collection-hooks';
import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import type { TableProps } from '@risk-smart/themed-cloudscape-components/table';
import type { LocalStorageKeys } from '@risksmart-app/components/src/hooks/useLocalStorage';
import type { FieldRegistryLookup } from '@risksmart-app/shared/forms/formConfigRegistry';
import type {
  FormConfigurationPartsFragment,
  Order_By,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ParseKeys } from 'i18next';
import type { JSX, ReactNode } from 'react';

export type TableRecordColumnWidths<T extends TableRecord> = Record<
  keyof T,
  number | undefined
>;

export type TablePreferences<T extends TableRecord> =
  CollectionPreferencesProps.Preferences<{
    columnWidths?: TableRecordColumnWidths<T>;
  }>;

export type CustomContentDisplayItem = {
  id: string;
  visible: boolean;
  custom: boolean;
};

export type CollectionActions<T> = UseCollectionResult<T>['actions'];

export type TablePropsWithActions<T extends TableRecord> = TableProps<T> & {
  actions: CollectionActions<T>;
  propertyFilterProps: PropertyFilterProps;
  propertyFilterQuery: PropertyFilterQuery;
  filteringProperties: readonly PropertyFilterProperty<unknown>[];
  allItems: readonly T[] | undefined;
  exportToCsvString: () => string;
  exportToCsv: () => void;
  preferenceDetails: {
    preferences: TablePreferences<T>;
    setPreferences: (preferences: TablePreferences<T>) => void;
  };
  isItemDisabled?: (item: T) => boolean;
  useAbsoluteUrls?: boolean;
  // Expose the table field config so consumers (e.g., export) don't need to recompute it
  fields?: TableFields<T>;
  // Pass through form config so downstream exports (e.g., PDF) can resolve custom labels
  labelFormConfigurations?: FormConfigurationPartsFragment[] | null;
};

export const emptyFilterQuery = {
  tokens: [],
  operation: 'and',
  tokenGroups: [],
} as const;

export type TableRecord = Record<string, unknown>;

export type CustomFieldValue<T extends TableRecord> = (
  record: T,
  {
    userLookup,
    departmentTypeLookup,
  }: {
    userLookup: Record<string, string> | undefined;
    departmentTypeLookup?: Record<string, string>;
  }
) => null | string | string[];

type CustomFieldConfig<T extends TableRecord> =
  | {
      isVirtual?: boolean;
      custom: true;
      /**
       * Returns the value of a custom field.
       * @param record
       * @returns
       */
      customFieldValue: CustomFieldValue<T>;
    }
  | {
      isVirtual?: boolean;
      custom?: false;
    };

export type Header =
  | {
      /**
       * Simple text label for the header
       */
      header: string;
    }
  | (FieldRegistryLookup & {
      /**
       * Include the type postfix (e.g., (issue), (assessment)) in the header label.
       */
      includeFromTypePostfix?: boolean;
    });

export type FieldConfig<T extends TableRecord> = Partial<
  Omit<TableProps.ColumnDefinition<T>, 'header'>
> &
  CustomFieldConfig<T> & {
    filterOptions?: FieldFilterConfig<T>;
    exportVal?: (record: T) => CsvFieldType;
    /**
     * Optional: Provide styling hints for this cell when exporting to PDF.
     * Return null/undefined when no styling should be applied.
     */
    exportCellStyle?: (record: T) =>
      | null
      | undefined
      | {
          backgroundColor?: string;
          color?: string; // text color
        };
    footerExportVal?: (records: readonly T[]) => CsvFieldType;
    footerVal?: (records: readonly T[]) => CsvFieldType;
    footerLabel?: string;
    sortingDisabled?: boolean;
    fieldType?: 'date' | 'number' | 'string';
    // TODO: remove this when we migrate all registers to the new date format
    _typename?: Parent_Type_Enum;
  } & Header;

type WhereFilterPart<T extends TableRecord> = {
  [K in keyof Partial<T>]: T[K] extends boolean | null | number | string
    ? null | Partial<{
        _eq: null | T[K];
        _neq: null | T[K];
        _ilike: null | T[K];
        _nilike: null | T[K];
        _lt: null | T[K];
        _lte: null | T[K];
        _gt: null | T[K];
        _gte: null | T[K];
      }>
    : T[K] extends TableRecord
      ? WhereFilterPart<T[K]>
      : never;
};

export type WhereFilter<T extends TableRecord> = WhereFilterPart<T> & {
  _and?: null | WhereFilter<T>;
  _or?: null | WhereFilter<T>;
  _not?: null | WhereFilter<T>;
};

type LazyDatasetOptions<T extends TableRecord> = {
  offset: number;
  limit: number;
  orderBy: Record<keyof T, Order_By>;
  where: WhereFilter<T>;
};

export type LazyDataset<T extends TableRecord> = (
  options: LazyDatasetOptions<T>
) => Promise<{ data: T[]; totalCount?: number }>;

export type Dataset<T extends TableRecord> = T[];

export type RootTablePropsOptions<
  T extends TableRecord,
  TDataset extends Dataset<T> | LazyDataset<T>,
> = {
  // TODO: Got a max of ParseKeys and string usage and the translation keys are working correctly. Need a better solution
  entityLabel: ParseKeys<'common'> | string;
  preferencesStorageKey?: LocalStorageKeys;
  /**
   * Unique Id for the table.
   * Used for storing sort and filter state in db
   */
  tableId?: string;
  fields: TableFields<T>;
  data?: TDataset;
  emptyCollectionAction?: JSX.Element;
  initialColumns?: (keyof T)[];
  defaultSortingState?: DefaultSortingState<T>;
  enableFiltering?: boolean;
  defaultPreferences?: CollectionPreferencesProps.Preferences;
  extraFilters?: ReactNode;
  usesRelativeCustomAttributeDates?: boolean;
  initialVisibleContent?: readonly string[];
  /**
   * Ids of forms for which you want custom attributes to be shown.
   */
  customAttributeFormIds: Parent_Type_Enum[];
};

type FieldFilterConfig<T extends TableRecord> = {
  filteringProperties?: Partial<PropertyFilterProps.FilteringProperty>;
  /**
   * Add filtering options (auto complete) when filtering table.
   * Useful when the data is not a string/number so useCollection doesn't automatically pick up the properties.
   * E.g. multiple tags associated with record
   */
  filteringOptions?:
    | ((
        records: T[]
      ) => ReadonlyArray<
        Omit<PropertyFilterProps.FilteringOption, 'propertyKey'>
      >)
    | ReadonlyArray<Omit<PropertyFilterProps.FilteringOption, 'propertyKey'>>;
};

export type TableFields<T extends TableRecord> = {
  [K in keyof Partial<T>]: FieldConfig<T>;
};

export type DefaultSortingState<T extends TableRecord> = {
  sortingColumn: keyof T;
  sortingDirection: 'asc' | 'desc';
};

export type CsvFieldType = boolean | null | number | string | undefined;
