import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import type { AggregateType } from '@risksmart-app/shared/reporting/schema';
import { t } from 'i18next';

export const getAggregateTypeConfig = (): Record<
  AggregateType,
  Pick<SelectProps.Option, 'label'> & { isYFieldRequired: boolean }
> => ({
  distinctCount: {
    label: t('dashboard.aggregationTypes.distinctCount'),
    isYFieldRequired: true,
  },
  count: {
    label: t('dashboard.aggregationTypes.count'),
    isYFieldRequired: false,
  },
  min: {
    label: t('dashboard.aggregationTypes.min'),
    isYFieldRequired: true,
  },
  max: {
    label: t('dashboard.aggregationTypes.max'),
    isYFieldRequired: true,
  },
  sum: {
    label: t('dashboard.aggregationTypes.sum'),
    isYFieldRequired: true,
  },
  avg: {
    label: t('dashboard.aggregationTypes.avg'),
    isYFieldRequired: true,
  },
});

export const getAggregateTypeOptions = () => {
  const aggregateTypeConfig = getAggregateTypeConfig();

  return Object.keys(aggregateTypeConfig)
    .map((aggregateType) => ({
      value: aggregateType,
      ...aggregateTypeConfig[aggregateType as AggregateType],
    }))
    .sort((a, b) => a.label?.localeCompare(b.label ?? '') ?? 0);
};
