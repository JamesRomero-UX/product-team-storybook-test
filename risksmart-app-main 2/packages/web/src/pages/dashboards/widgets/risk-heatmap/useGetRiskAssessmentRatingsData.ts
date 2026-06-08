import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { Dictionary } from 'lodash';
import _ from 'lodash';
import type { RiskRegisterFields } from 'src/pages/risks/types';
import { useCalculateRiskRating } from 'src/ratings/useCalculateRiskRating';
import { useRiskRatingResolver } from 'src/ratings/useRiskRatingResolver';

import { handleError } from '@/utils/errorUtils';

import { initializeHeatmapCells } from '../heatmap-widget/heatmapUtils';
import type { HeatmapCellData } from '../heatmap-widget/types';

type ImpactLikelihood = { Impact: number; Likelihood: number };
type OptionalImpactLikelihood = {
  Impact: null | number | undefined;
  Likelihood: null | number | undefined;
};

type UseGetRiskAssessmentRatingsDataOptions = {
  controlType: Risk_Assessment_Result_Control_Type_Enum;
  risks: readonly RiskRegisterFields[] | undefined;
  getImpactIndex: (value: number) => number | undefined;
  getLikelihoodIndex: (value: number) => number | undefined;
};

type PopulateCellDataValuesOptions = {
  cellData: HeatmapCellData[][];
  rawData: ImpactLikelihood[] | undefined;
  getImpactIndex: (value: number) => number | undefined;
  getLikelihoodIndex: (value: number) => number | undefined;
};

const hasImpactAndLikelihood = (
  rawData: OptionalImpactLikelihood
): rawData is ImpactLikelihood => !!rawData.Impact && !!rawData.Likelihood;

const populateCellDataValues = ({
  cellData,
  rawData,
  getImpactIndex,
  getLikelihoodIndex,
}: PopulateCellDataValuesOptions) => {
  const counts: Dictionary<number> = _.countBy(
    rawData,
    (item) => `${item.Impact},${item.Likelihood}`
  );
  Object.keys(counts).forEach((k) => {
    const fields = k.split(',');

    const impact = Number(fields[0]);
    const impactIndex = getImpactIndex(impact);

    const likelihood = Number(fields[1]);
    const likelihoodIndex = getLikelihoodIndex(likelihood);

    if (impactIndex === undefined) {
      handleError(`Unable to find index for impact value ${impact}`);

      return;
    }
    if (likelihoodIndex === undefined) {
      handleError(`Unable to find index for likelihood value ${likelihood}`);

      return;
    }

    cellData[likelihoodIndex][impactIndex].value = counts[k];
  });
};

const useCreateCellDataWithBackgroundColor = (
  controlType: Risk_Assessment_Result_Control_Type_Enum
) => {
  const {
    options: { likelihood: likelihoodOptions, impact: impactOptions },
  } = useRiskRatingResolver();
  const getComputedRating = useCalculateRiskRating(controlType);

  return initializeHeatmapCells(
    likelihoodOptions.length,
    impactOptions.length,
    (r, c) => {
      const rating = getComputedRating({
        likelihood: likelihoodOptions[r].value,
        impact: impactOptions[c].value,
      });

      return { label: rating.label, background: rating.color! };
    }
  );
};

export const useGetRiskAssessmentRatingsData = ({
  controlType,
  risks,
  getImpactIndex,
  getLikelihoodIndex,
}: UseGetRiskAssessmentRatingsDataOptions): HeatmapCellData[][] => {
  const cellData = useCreateCellDataWithBackgroundColor(controlType);

  const rawData = risks
    ?.map((a) => {
      return {
        Impact:
          controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
            ? a?.ControlledImpactValue
            : a?.UncontrolledImpactValue,
        Likelihood:
          controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
            ? a?.ControlledLikelihoodValue
            : a?.UncontrolledLikelihoodValue,
      };
    })
    .filter(hasImpactAndLikelihood);

  populateCellDataValues({
    cellData,
    rawData,
    getImpactIndex,
    getLikelihoodIndex,
  });

  return cellData;
};
