import { getColorStyles } from '@risksmart-app/components/src/utils/colours';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { forwardRef, type Ref, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardWidgetSettings } from 'src/context/useDashboardWidgetSettings';
import type { RiskRegisterFields } from 'src/pages/risks/types';
import { useRiskRatingResolver } from 'src/ratings/useRiskRatingResolver';

import { useGetWidgetData } from '../../../gigawidget/hooks/useGetWidgetData';
import type { WidgetRef } from '../../../types';
import { dataSources } from '../../../universal-widget/data-sources';
import type { FilterSettings } from '../../../universal-widget/util';
import { useDashboardStore } from '../../../useDashboardStore';
import { convertDateRangeValues } from '../../filterHelpers';
import LineChartWidget from '../../line-chart-widget/LineChartWidget';
import { WidgetSettingsModal } from '../../widget-settings-modal/WidgetSettingsModal';
import { sortByDateX } from '../utils';

type Props = {
  controlType: Risk_Assessment_Result_Control_Type_Enum;
};

export const RiskRatingsOverTime = forwardRef(
  ({ controlType }: Props, ref: Ref<WidgetRef>) => {
    const [showModal, setShowModal] = useState(false);
    const [settings, setSettings] =
      useDashboardWidgetSettings<FilterSettings>();
    const { t } = useTranslation(['common'], {
      keyPrefix:
        controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
          ? 'dashboard.widgets.controlledRiskRatingsOverTime'
          : 'dashboard.widgets.uncontrolledRiskRatingsOverTime',
    });

    useImperativeHandle(ref, () => ({
      openSettings: () => setShowModal(true),
    }));

    const { filters } = useDashboardStore();
    const { startDate, endDate } = convertDateRangeValues(filters.dateRange);

    const dataSource = dataSources.risk;
    const {
      tableProps: { allItems },
      loading,
    } = useGetWidgetData({
      dataSource,
      propertyFilterQuery: settings?.filtering,
      variables:
        filters.dateRange && startDate && endDate
          ? {
              riskAssessmentResultsWhere: {
                TestDate: {
                  _gte: startDate.toISOString(),
                  _lte: endDate.toISOString(),
                },
              },
            }
          : {},
    });

    const series = useRiskRatingsOverTime(allItems, controlType);

    const { resolveRiskRating } = useRiskRatingResolver();

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
          tooltipYValueFormatter={(y, _seriesIndex, custom) => {
            const resolved = resolveRiskRating({
              likelihood: (custom?.likelihood as number) ?? null,
              impact: (custom?.impact as number) ?? null,
              controlType,
              rating: y ?? null,
            });

            return resolved?.label || String(y);
          }}
          pointColorFormatter={(y, _seriesIndex, custom) => {
            const resolved = resolveRiskRating({
              likelihood: (custom?.likelihood as number) ?? null,
              impact: (custom?.impact as number) ?? null,
              controlType,
              rating: y ?? null,
            });

            return getColorStyles(resolved?.color)?.backgroundColor;
          }}
        />
      </>
    );
  }
);

const useRiskRatingsOverTime = (
  data: readonly RiskRegisterFields[] | undefined,
  controlType: Risk_Assessment_Result_Control_Type_Enum
) => {
  const series = data
    ? data.flatMap((risk) => {
        const assessmentResults = risk.assessmentResults.filter(
          (result) =>
            Boolean(result.riskAssessmentResult) &&
            result.riskAssessmentResult!.ControlType === controlType
        );

        if (assessmentResults.length === 0) {
          return [];
        }

        return {
          name: risk.Title,
          data: assessmentResults
            .map((result) => ({
              x:
                result.riskAssessmentResult!.TestDate ??
                result.riskAssessmentResult!.CreatedAtTimestamp,
              y: result.riskAssessmentResult!.Rating ?? 0,
              likelihood: result.riskAssessmentResult!.Likelihood,
              impact: result.riskAssessmentResult!.Impact,
            }))
            .sort(sortByDateX),
        };
      })
    : [];

  return series;
};
