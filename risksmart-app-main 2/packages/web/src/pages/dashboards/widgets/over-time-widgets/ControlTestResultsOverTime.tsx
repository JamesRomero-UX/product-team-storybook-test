import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import { type Ref, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import type { ControlTestTableFields } from 'src/pages/controls/control-tests/types';

import { useGetWidgetData } from '../../gigawidget/hooks/useGetWidgetData';
import type { WidgetRef } from '../../types';
import { dataSources } from '../../universal-widget/data-sources';
import type { FilterSettings } from '../../universal-widget/util';
import { useDashboardStore } from '../../useDashboardStore';
import { convertDateRangeValues } from '../filterHelpers';
import LineChartWidget from '../line-chart-widget/LineChartWidget';
import { WidgetSettingsModal } from '../widget-settings-modal/WidgetSettingsModal';
import { sortByDateX } from './utils';

export const ControlTestResultsOverTime = (
  _props: unknown,
  ref: Ref<WidgetRef>
) => {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useDashboardWidgetSettings<FilterSettings>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.widgets.controlTestResultsOverTime',
  });

  useImperativeHandle(ref, () => ({
    openSettings: () => setShowModal(true),
  }));

  const { filters } = useDashboardStore();
  const { startDate, endDate } = convertDateRangeValues(filters.dateRange);

  const dataSource = dataSources.controlTest;
  const {
    tableProps: { allItems },
    loading,
  } = useGetWidgetData({
    dataSource,
    propertyFilterQuery: settings?.filtering,
    variables:
      filters.dateRange && startDate && endDate
        ? {
            where: {
              TestDate: {
                _gte: startDate.toISOString(),
                _lte: endDate.toISOString(),
              },
            },
          }
        : {},
  });

  const series = useControlTestResultsOverTime(allItems);

  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');

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
        tooltipYValueFormatter={(y) =>
          getEffectivenessByValue(y)?.label || String(y)
        }
        pointColorFormatter={(y) =>
          getColorStyles(getEffectivenessByValue(y)?.color)?.backgroundColor
        }
      />
    </>
  );
};

const useControlTestResultsOverTime = (
  data: readonly ControlTestTableFields[] | undefined
) => {
  const groupedByTest = data?.reduce(
    (acc, test) => {
      const testId = test.parent?.Id;
      const testTitle = test.parent?.Title;

      if (!testId || !testTitle) {
        return acc;
      }

      if (!acc[testId]) {
        acc[testId] = {
          name: testTitle,
          data: [],
        };
      }
      acc[testId].data.push({
        x: test.TestDate,
        y: test.OverallEffectiveness ?? 0,
      });

      return acc;
    },
    {} as Record<
      string,
      { name: string; data: Array<{ x: string; y: number }> }
    >
  );

  if (groupedByTest) {
    const values = Object.values(groupedByTest);

    values.forEach((test) => {
      test.data.sort(sortByDateX);
    });

    return values;
  }

  return undefined;
};
