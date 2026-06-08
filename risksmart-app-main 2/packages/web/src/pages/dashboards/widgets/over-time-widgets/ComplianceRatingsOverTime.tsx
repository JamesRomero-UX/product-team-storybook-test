import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import { type Ref, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import type { ObligationTableFields } from 'src/pages/compliance/obligations/types';

import { useGetWidgetData } from '../../gigawidget/hooks/useGetWidgetData';
import type { WidgetRef } from '../../types';
import { dataSources } from '../../universal-widget/data-sources';
import type { FilterSettings } from '../../universal-widget/util';
import { useDashboardStore } from '../../useDashboardStore';
import { convertDateRangeValues } from '../filterHelpers';
import LineChartWidget from '../line-chart-widget/LineChartWidget';
import { WidgetSettingsModal } from '../widget-settings-modal/WidgetSettingsModal';
import { sortByDateX } from './utils';

export const ComplianceRatingsOverTime = (
  _props: unknown,
  ref: Ref<WidgetRef>
) => {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useDashboardWidgetSettings<FilterSettings>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.widgets.complianceRatingsOverTime',
  });

  useImperativeHandle(ref, () => ({
    openSettings: () => setShowModal(true),
  }));

  const { filters } = useDashboardStore();
  const { startDate, endDate } = convertDateRangeValues(filters.dateRange);

  const dataSource = dataSources.obligation;
  const {
    tableProps: { allItems },
    loading,
  } = useGetWidgetData({
    dataSource,
    propertyFilterQuery: settings?.filtering,
    variables: {
      includeAssessmentResultsHistory: true,
      ...(filters.dateRange && startDate && endDate
        ? {
            obligationAssessmentResultsWhere: {
              TestDate: {
                _gte: startDate.toISOString(),
                _lte: endDate.toISOString(),
              },
            },
          }
        : {}),
    },
  });

  const series = useObligationRatingsOverTime(allItems);

  const { getByValue: getPerformanceByValue } = useRating('performance_result');

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
          getPerformanceByValue(y)?.label || String(y)
        }
        pointColorFormatter={(y) =>
          getColorStyles(getPerformanceByValue(y)?.color)?.backgroundColor
        }
      />
    </>
  );
};

const useObligationRatingsOverTime = (
  data: readonly ObligationTableFields[] | undefined
) => {
  const series = data
    ? data.flatMap((obligation) => {
        if (
          !obligation.assessmentResults ||
          obligation.assessmentResults.length === 0
        ) {
          return [];
        }

        return {
          name: obligation.Title,
          data: obligation.assessmentResults
            .filter((result) => Boolean(result.obligationAssessmentResult))
            .map((result) => ({
              x:
                result.obligationAssessmentResult!.TestDate ??
                result.obligationAssessmentResult!.CreatedAtTimestamp,
              y: result.obligationAssessmentResult!.Rating ?? 0,
            }))
            .sort(sortByDateX),
        };
      })
    : [];

  return series;
};
