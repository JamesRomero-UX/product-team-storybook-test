import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import {
  BarChart01,
  BarChart10,
  Grid01,
  LineChartUp05,
  PieChart02,
  PieChart03,
  Star01,
} from '@untitled-ui/icons-react';
import { t } from 'i18next';

import type { ChartType } from './customDataSourceWidgetSettingsSchema';

type ChartTypeConfig = {
  category: boolean;
  subCategory: boolean;
  aggregation: boolean;
} & Pick<SelectProps.Option, 'iconSvg' | 'label'>;

export const getChartTypeConfig = (): Record<ChartType, ChartTypeConfig> => ({
  bar: {
    label: t('dashboard.chartTypes.bar'),
    iconSvg: <BarChart01 viewBox={'0 0 24 24'} width={24} height={24} />,
    category: true,
    aggregation: true,
    subCategory: true,
  },

  'stacked-bar': {
    label: t('dashboard.chartTypes.stacked-bar'),
    iconSvg: <BarChart10 viewBox={'0 0 24 24'} width={24} height={24} />,
    category: true,
    aggregation: true,
    subCategory: true,
  },
  pie: {
    label: t('dashboard.chartTypes.pie'),
    iconSvg: <PieChart03 viewBox={'0 0 24 24'} width={24} height={24} />,
    category: true,
    aggregation: true,
    subCategory: false,
  },
  donut: {
    label: t('dashboard.chartTypes.donut'),
    iconSvg: <PieChart02 viewBox={'0 0 24 24'} width={24} height={24} />,
    category: true,
    aggregation: true,
    subCategory: false,
  },
  table: {
    label: t('dashboard.chartTypes.table'),
    iconSvg: <Grid01 viewBox={'0 0 24 24'} width={24} height={24} />,
    category: false,
    aggregation: false,
    subCategory: false,
  },
  kpi: {
    label: t('dashboard.chartTypes.kpi'),
    iconSvg: <Star01 viewBox={'0 0 24 24'} width={24} height={24} />,
    category: false,
    aggregation: true,
    subCategory: false,
  },
  radar: {
    label: t('dashboard.chartTypes.radar'),
    iconSvg: <LineChartUp05 viewBox={'0 0 24 24'} width={24} height={24} />,
    category: true,
    aggregation: true,
    subCategory: true,
  },
});

export const getChartTypeOptions = () => {
  const chartTypeConfig = getChartTypeConfig();

  return Object.keys(chartTypeConfig)
    .map((chartType) => ({
      value: chartType,
      ...chartTypeConfig[chartType as ChartType],
    }))
    .sort((a, b) => a.label?.localeCompare(b.label ?? '') ?? 0);
};
