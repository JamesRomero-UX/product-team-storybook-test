import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import { type Ref, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import type { PolicyRegisterFields } from 'src/pages/policy/types';

import { useGetWidgetData } from '../../gigawidget/hooks/useGetWidgetData';
import type { WidgetRef } from '../../types';
import { dataSources } from '../../universal-widget/data-sources';
import type { FilterSettings } from '../../universal-widget/util';
import { useDashboardStore } from '../../useDashboardStore';
import { convertDateRangeValues } from '../filterHelpers';
import LineChartWidget from '../line-chart-widget/LineChartWidget';
import { WidgetSettingsModal } from '../widget-settings-modal/WidgetSettingsModal';
import { sortByDateX } from './utils';

export const DocumentRatingsOverTime = (
  _props: unknown,
  ref: Ref<WidgetRef>
) => {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] =
    useDashboardWidgetSettings<FilterSettings<'document'>>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.widgets.documentRatingsOverTime',
  });

  useImperativeHandle(ref, () => ({
    openSettings: () => setShowModal(true),
  }));

  const { filters } = useDashboardStore();
  const { startDate, endDate } = convertDateRangeValues(filters.dateRange);

  const dataSource = dataSources.document;
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
            documentAssessmentResultsWhere: {
              TestDate: {
                _gte: startDate.toISOString(),
                _lte: endDate.toISOString(),
              },
            },
          }
        : {}),
    },
  });

  const series = useDocumentRatingsOverTime(allItems);

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

const useDocumentRatingsOverTime = (
  data: readonly PolicyRegisterFields[] | undefined
) => {
  const series = data
    ? data.flatMap((document) => {
        if (
          !document.assessmentResults ||
          document.assessmentResults.length === 0
        ) {
          return [];
        }

        return {
          name: document.Title,
          data: document.assessmentResults
            .filter((result) => Boolean(result.documentAssessmentResult))
            .map((result) => ({
              x:
                result.documentAssessmentResult!.TestDate ??
                result.documentAssessmentResult!.CreatedAtTimestamp,
              y: result.documentAssessmentResult!.Rating ?? 0,
            }))
            .sort(sortByDateX),
        };
      })
    : [];

  return series;
};
