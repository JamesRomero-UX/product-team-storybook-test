import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import type { DataType } from '@risksmart-app/shared/reporting/datasets/types';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useState } from 'react';
import type { TypedCustomDatasource } from 'src/pages/custom-datasources/types';
import CustomDatasourceTable from 'src/pages/custom-datasources/update/CustomDatasourceTable';
import type { CustomAttributeSchemaLookup } from 'src/pages/custom-datasources/update/types';

import ValueWidget from '../../widgets/value-widget/ValueWidget';
import type { ChartType } from '../form/customDataSourceWidgetSettingsSchema';
import { WidgetBarChart } from './bar-chart/WidgetBarChart';
import type { DatePrecision, ReportField, Series } from './types';
import { WidgetPieChart } from './WidgetPieChart';
import { WidgetRadarChart } from './WidgetRadarChart';

export type Props = {
  chartType: ChartType;
  loading: boolean;
  xAxisDataType: DataType;
  xAxisDatePrecision: DatePrecision | null;
  seriesData: Series[];
  innerMetricValue?: string;
  reportData: ReportField[][];
  customDatasource: Pick<TypedCustomDatasource, 'Datasources' | 'Fields'>;
  onPageChangeClick?: (e: { requestedPageIndex: number }) => void;
  onCategoryClick?: (item: { value: unknown }) => void;
  pageSize?: number;
  currentPageIndex?: number;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
  tablePreferences?: CollectionPreferencesProps.Preferences<unknown>;
  onTablePreferencesChange?: (
    preferences: CollectionPreferencesProps.Preferences<unknown>
  ) => void;
  showAsPercentage?: boolean;
};

export const WidgetChart: FC<Props> = ({
  chartType,
  loading,
  xAxisDataType,
  xAxisDatePrecision,
  seriesData,
  innerMetricValue,
  reportData,
  customDatasource,
  onPageChangeClick,
  onCategoryClick,
  pageSize,
  currentPageIndex,
  customAttributeSchemaLookup,
  tablePreferences,
  onTablePreferencesChange,
  formFieldConfigurations,
  showAsPercentage,
}) => {
  const [localPreferences, setLocalPreferences] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useState<CollectionPreferencesProps.Preferences<any>>();

  // Use provided preferences or fall back to local state
  const preferences = tablePreferences ?? localPreferences;
  const setPreferences = onTablePreferencesChange ?? setLocalPreferences;
  const firstSeries = seriesData?.[0];
  switch (chartType) {
    case 'table':
      return (
        <CustomDatasourceTable
          formFieldConfigurations={formFieldConfigurations}
          columnsAlwaysVisible={false}
          preferences={preferences}
          onSetPreferences={setPreferences}
          variant={'embedded'}
          customDatasource={customDatasource}
          items={reportData}
          onPageChangeClick={onPageChangeClick}
          currentPageIndex={currentPageIndex ?? 0}
          pageSize={pageSize ?? 20}
          loading={loading}
          customAttributeSchemaLookup={customAttributeSchemaLookup}
        />
      );
    case 'kpi':
      return (
        <ValueWidget
          loading={loading}
          value={
            firstSeries?.data.length === 0
              ? undefined
              : firstSeries.data[0].label
          }
        />
      );
    case 'bar':
    case 'stacked-bar':
      return (
        <WidgetBarChart
          onSegmentClick={onCategoryClick}
          loading={loading}
          stackedBars={chartType === 'stacked-bar'}
          xAxisDataType={xAxisDataType}
          xAxisDatePrecision={xAxisDatePrecision}
          series={seriesData}
        />
      );
    case 'pie':
    case 'donut':
      return (
        <WidgetPieChart
          onSegmentClick={onCategoryClick}
          innerMetricValue={innerMetricValue}
          loading={loading}
          data={firstSeries?.data}
          donut={chartType === 'donut'}
          showAsPercentage={showAsPercentage}
        />
      );
    case 'radar':
      return (
        <WidgetRadarChart
          onSegmentClick={onCategoryClick}
          loading={loading}
          xAxisDataType={xAxisDataType}
          xAxisDatePrecision={xAxisDatePrecision}
          series={seriesData}
        />
      );
  }
};
