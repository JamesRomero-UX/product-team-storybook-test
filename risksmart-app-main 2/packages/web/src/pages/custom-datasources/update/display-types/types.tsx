import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import type { FeatureFlag } from '@risksmart-app/modules/src/index';
import type { GroupByDatePrecision } from '@risksmart-app/shared/reporting/api/schema';
import type { FieldDefinition } from '@risksmart-app/shared/reporting/datasets/types';
import type { FieldTypeDefinition } from '@risksmart-app/shared/reporting/display-types';
import type {
  GetDepartmentsQuery,
  GetTagsQuery,
  GetUserGroupsQuery,
  GetUsersQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ReportField } from 'src/pages/dashboards/custom-data-source-widget/widget-chart/types';
import type { RatingKeys, RatingOption } from 'src/ratings/ratings';
import type { MatrixCell } from 'src/ratings/useScoringSettings';

import type { EntityInfo } from '@/hooks/getEntityInfo';
import type { CommonKeys, Option } from '@/hooks/useCommonLookupLazy';

export type Helpers = {
  getRatingByValue: (
    ratingKey: RatingKeys,
    value: number | string
  ) => RatingOption | undefined;
  getRatingOptions: (ratingKey: RatingKeys) => RatingOption[];

  getCommonLookupByValue: (
    i18nKey: CommonKeys,
    value: number | string
  ) => Option | undefined;
  getCommonLookupOptions(i18nKey: CommonKeys): Option[];

  getEntityInfo: (type: Parent_Type_Enum) => EntityInfo;
  isFeatureFlagEnabled: (flag: FeatureFlag) => boolean;

  hasScoringSettings: boolean;
  getRatingByLikelihoodAndImpact: (
    likelihood: number,
    impact: number
  ) => MatrixCell | undefined;
  getLikelihoodByValue: (
    value: number
  ) => { label: string; value: number; color: string } | undefined;
  getImpactByValue: (
    value: number
  ) => { label: string; value: number; color: string } | undefined;
  likelihoodOptions: { label: string; value: number; color: string }[];
  impactOptions: { label: string; value: number; color: string }[];
  ratingLevelOptions: { label: string; value: number; color: string }[];
};

export type CellInfo = {
  fieldData: ReportField;
  fieldDef: FieldDefinition;
  helpers: Helpers;
};

export type AggregatedCellInfo = CellInfo & {
  groupByDatePrecision: GroupByDatePrecision | null;
};

/**
 * Bit of a fudge to allow conditional fields to display filtering properties.
 * Will need to more dynamic way to get populated data once we support fields such a obligations/risks etc otherwsie we'll need to request all data every time
 */
export type AdditionalData = {
  departmentTypes: GetDepartmentsQuery['department_type'];
  users: GetUsersQuery['user'];
  userGroups: GetUserGroupsQuery['user_group'];
  tagTypes: GetTagsQuery['tag_type'];
};

export type ReportFieldType = {
  /**
   * How the data should be presenting in a csv export
   * @param cellInfo
   * @returns
   */
  exportVal: (cellInfo: AggregatedCellInfo) => string;

  /**
   * Color to display in charts
   */
  getChartColor?: (cellInfo: AggregatedCellInfo) => string | undefined;
  /**
   * Label to display in charts
   */
  getChartLabel: (cellInfo: AggregatedCellInfo) => string;

  /**
   * Set to true to make an api request to retrieve suggestions
   */
  asyncOptionSuggestions?: boolean;

  /**
   * How to format content of table cells, as used by cloudscapes table component
   * @param cellInfo
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell: (cellInfo: CellInfo) => any;

  /**
   * How to configure the filtering of the cell, as used by cloudscapes property filter
   * @param field
   * @param helpers
   */
  propertyConfig?(
    field: {
      key: string;
      propertyLabel: string;
      groupValuesLabel: string;
    } & FieldTypeDefinition,
    helpers: Helpers,
    filteringData: AdditionalData
  ): PropertyFilterProps.FilteringProperty;
};
