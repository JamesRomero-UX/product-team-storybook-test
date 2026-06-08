import type { TypedPropertyFilterQuery } from '@risksmart-app/components/src/table/tableUtils';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Ref } from 'react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router';
import type { RiskRegisterFields } from 'src/pages/risks/types';
import { useRiskRatingResolver } from 'src/ratings/useRiskRatingResolver';
import { merge } from 'ts-deepmerge';

import { emptyFilterQuery } from '@/utils/table/types';

import { useDashboardWidgetSettings } from '../../../../context/useDashboardWidgetSettings';
import { useGetWidgetData } from '../../gigawidget/hooks/useGetWidgetData';
import type { WidgetRef } from '../../types';
import { dataSources } from '../../universal-widget/data-sources';
import type { FilterSettings } from '../../universal-widget/util';
import {
  convertToTokenGroups,
  dashboardFilterToQuery,
} from '../../universal-widget/util';
import { useDashboardStore } from '../../useDashboardStore';
import HeatmapWidget from '../heatmap-widget/HeatmapWidget';
import { WidgetSettingsModal } from '../widget-settings-modal/WidgetSettingsModal';
import { useGetRiskAssessmentRatingsData } from './useGetRiskAssessmentRatingsData';

type Props = {
  controlType: Risk_Assessment_Result_Control_Type_Enum;
};

export const RiskHeatmap = forwardRef((props: Props, ref: Ref<WidgetRef>) => {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useDashboardWidgetSettings<FilterSettings>();
  const navigate = useNavigate();

  const {
    options: { likelihood: likelihoodOptions, impact: impactOptions },
  } = useRiskRatingResolver();

  const impactIndexMap = useMemo(
    () => new Map(impactOptions.map((o, i) => [o.value, i])),
    [impactOptions]
  );
  const likelihoodIndexMap = useMemo(
    () => new Map(likelihoodOptions.map((o, i) => [o.value, i])),
    [likelihoodOptions]
  );
  const getImpactIndex = useCallback(
    (v: number) => impactIndexMap.get(v),
    [impactIndexMap]
  );
  const getLikelihoodIndex = useCallback(
    (v: number) => likelihoodIndexMap.get(v),
    [likelihoodIndexMap]
  );
  const getImpactLabel = useCallback(
    (index: number) => impactOptions[index]?.label ?? '',
    [impactOptions]
  );
  const getLikelihoodLabel = useCallback(
    (index: number) => likelihoodOptions[index]?.label ?? '',
    [likelihoodOptions]
  );

  useImperativeHandle(ref, () => ({
    openSettings: () => setShowModal(true),
  }));

  const { filters } = useDashboardStore();
  const dataSource = dataSources.risk;
  const {
    tableProps: { allItems },
    loading,
  } = useGetWidgetData({
    dataSource,
    propertyFilterQuery: settings?.filtering,
  });
  const handleSave = async (data: FilterSettings) => {
    setSettings(data);
  };

  const data = useGetRiskAssessmentRatingsData({
    controlType: props.controlType,
    risks: allItems,
    getImpactIndex,
    getLikelihoodIndex,
  });

  return (
    <>
      {showModal && (
        <WidgetSettingsModal
          onDismiss={() => setShowModal(false)}
          onSave={handleSave}
          dataSource={dataSource}
        />
      )}
      <HeatmapWidget
        controlType={props.controlType}
        getImpactLabelByIndex={getImpactLabel}
        getLikelihoodLabelByIndex={getLikelihoodLabel}
        onCellClick={(cell) => {
          const localPropertyFilter: TypedPropertyFilterQuery<RiskRegisterFields> =
            settings?.filtering
              ? convertToTokenGroups(settings.filtering)
              : emptyFilterQuery;
          const cellPropertyFilter: TypedPropertyFilterQuery<RiskRegisterFields> =
            {
              operation: 'and',
              tokens: [],
              tokenGroups: [
                {
                  propertyKey:
                    props.controlType ===
                    Risk_Assessment_Result_Control_Type_Enum.Controlled
                      ? 'ControlledImpact'
                      : 'UncontrolledImpact',
                  value: getImpactLabel(cell.x),
                  operator: '=',
                },
                {
                  propertyKey:
                    props.controlType ===
                    Risk_Assessment_Result_Control_Type_Enum.Controlled
                      ? 'ControlledLikelihood'
                      : 'UncontrolledLikelihood',
                  value: getLikelihoodLabel(cell.y),
                  operator: '=',
                },
              ],
            };
          const url = dataSource.clickThroughUrl?.(
            merge(
              localPropertyFilter,
              dashboardFilterToQuery(filters, 'day', undefined, {
                departments:
                  !!dataSource.dashboardFilterConfig.departmentsFilter,
                tags: !!dataSource.dashboardFilterConfig.tagsFilter,
              }),
              cellPropertyFilter
            )
          );
          if (url) {
            navigate(url);
          }
        }}
        data={data}
        loading={loading}
      />
    </>
  );
});

RiskHeatmap.displayName = 'RiskHeatMap';

export default RiskHeatmap;
