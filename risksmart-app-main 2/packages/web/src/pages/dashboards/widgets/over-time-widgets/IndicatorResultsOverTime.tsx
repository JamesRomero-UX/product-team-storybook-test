import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import { type Ref, useCallback, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import { conformanceIndicatorRating } from 'src/pages/indicators/calculateConformanceRating';
import type { IndicatorTableFields } from 'src/pages/indicators/types';

import { useGetWidgetData } from '../../gigawidget/hooks/useGetWidgetData';
import type { WidgetRef } from '../../types';
import { dataSources } from '../../universal-widget/data-sources';
import type { FilterSettings } from '../../universal-widget/util';
import { useDashboardStore } from '../../useDashboardStore';
import { convertDateRangeValues } from '../filterHelpers';
import LineChartWidget from '../line-chart-widget/LineChartWidget';
import { WidgetSettingsModal } from '../widget-settings-modal/WidgetSettingsModal';
import { sortByDateX } from './utils';

export const IndicatorResultsOverTime = (
  _props: unknown,
  ref: Ref<WidgetRef>
) => {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useDashboardWidgetSettings<FilterSettings>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.widgets.indicatorResultsOverTime',
  });

  useImperativeHandle(ref, () => ({
    openSettings: () => setShowModal(true),
  }));

  const { filters } = useDashboardStore();
  const { startDate, endDate } = convertDateRangeValues(filters.dateRange);

  const dataSource = dataSources.indicator;
  const {
    tableProps: { allItems },
    loading,
  } = useGetWidgetData({
    dataSource,
    propertyFilterQuery: settings?.filtering,
    variables:
      filters.dateRange && startDate && endDate
        ? {
            resultsWhere: {
              // This chart only makes sense with numeric results
              TargetValueNum: { _is_null: false },
              ResultDate: {
                _gte: startDate.toISOString(),
                _lte: endDate.toISOString(),
              },
            },
          }
        : {},
  });

  const { series, validIndicators } = useIndicatorResultsOverTime(allItems);

  const { getByValue: statusGetByValue } = useRating(
    'indicator_conformance_status'
  );

  const getResultConformanceRating = useCallback(
    (seriesIndex: number, y: number | undefined) => {
      const indicator = validIndicators[seriesIndex];
      const rating = conformanceIndicatorRating(indicator, {
        TargetValueNum: y,
      });

      return statusGetByValue(rating);
    },
    [statusGetByValue, validIndicators]
  );

  const handleSave = async (data: FilterSettings) => {
    setSettings(data);
  };

  return (
    <>
      {showModal && (
        <WidgetSettingsModal
          onDismiss={() => setShowModal(false)}
          onSave={handleSave}
          dataSource={dataSource}
        />
      )}
      <LineChartWidget
        series={series}
        loading={loading}
        xTitle={t('xTitle')}
        yTitle={t('yTitle')}
        tooltipYValueFormatter={(y, seriesIndex) => {
          const statusLabel = getResultConformanceRating(seriesIndex, y)?.label;

          return statusLabel ? `${String(y)} (${statusLabel})` : String(y);
        }}
        pointColorFormatter={(y, seriesIndex) => {
          return getColorStyles(
            getResultConformanceRating(seriesIndex, y)?.color
          )?.backgroundColor;
        }}
      />
    </>
  );
};

const useIndicatorResultsOverTime = (
  data: readonly IndicatorTableFields[] | undefined
) => {
  const validIndicators =
    data?.filter(
      (indicator) =>
        indicator.orderedResults.length > 0 &&
        indicator.orderedResults.some((r) => r.TargetValueNum != null)
    ) ?? [];

  const series = validIndicators.map((indicator) => ({
    name: indicator.Title,
    data: indicator.orderedResults
      .filter((result) => result.TargetValueNum != null)
      .map((result) => ({
        x: result.ResultDate,
        y: result.TargetValueNum ?? 0,
      }))
      .sort(sortByDateX),
  }));

  return { series, validIndicators };
};
