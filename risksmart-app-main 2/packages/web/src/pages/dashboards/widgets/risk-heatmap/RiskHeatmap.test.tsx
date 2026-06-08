import type { RatingValue } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook, waitFor } from '@testing-library/react';
import { buildRiskRegisterFields } from 'src/testing/test-data/riskRegisterFields';
import { vi } from 'vitest';

import getMyItemWidgets from '../../my-items/privateWidgets';
import { setWidgets as setMyItemWidgets } from '../../my-items/widgets';
import { privateWidgets } from '../../widgetPrivate';
import { setWidgets } from '../../widgets';
import { useGetRiskAssessmentRatingsData } from './useGetRiskAssessmentRatingsData';

vi.mock('src/ratings/useScoringSettings', () => ({
  useScoringSettings: () => ({
    hasScoringSettings: false,
    getRatingByLikelihoodAndImpact: () => undefined,
    getLikelihoodByValue: () => undefined,
    getImpactByValue: () => undefined,
  }),
}));

setWidgets(privateWidgets);
setMyItemWidgets(getMyItemWidgets());

const getIndexMock = (value: RatingValue) =>
  typeof value === 'number' ? value - 1 : undefined;

describe('RiskHeatmap', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('useGetRiskAssessmentRatingsData', () => {
    it('should return a 5 x 5 array of cells with values set to 0 whilst loading', async () => {
      const { result } = renderHook(() =>
        useGetRiskAssessmentRatingsData({
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          risks: undefined,
          getImpactIndex: () => undefined,
          getLikelihoodIndex: () => undefined,
        })
      );
      await waitFor(() => result.current);

      expect(result.current.length).toEqual(5);
      expect(result.current[0].length).toEqual(5);
      const values = result.current.flat().map((c) => c.value);
      expect(values.length).toEqual(25);
      expect(values.every((value) => value === 0)).toBeTruthy();
    });

    it('should ignore records without an Impact or Likelihood value', async () => {
      const { result } = renderHook(() =>
        useGetRiskAssessmentRatingsData({
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          risks: [
            buildRiskRegisterFields({
              ControlledLikelihoodValue: undefined,
              ControlledImpactValue: undefined,
            }),
          ],
          getImpactIndex: () => undefined,
          getLikelihoodIndex: () => undefined,
        })
      );

      const values = result.current.flat().map((c) => c.value);
      expect(values.length).toEqual(25);
      expect(values.every((value) => value === 0)).toBeTruthy();
    });

    it('Impact 1, Likelihood 1 should be set at index 0,0', async () => {
      const { result } = renderHook(() =>
        useGetRiskAssessmentRatingsData({
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          risks: [
            buildRiskRegisterFields({
              ControlledImpactValue: 1,
              ControlledLikelihoodValue: 1,
            }),
          ],
          getImpactIndex: getIndexMock,
          getLikelihoodIndex: getIndexMock,
        })
      );

      expect(result.current[0][0].value).toEqual(1);
    });

    it('Impact 5, Likelihood 5 should be set at index 4,4', () => {
      const { result } = renderHook(() =>
        useGetRiskAssessmentRatingsData({
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          risks: [
            buildRiskRegisterFields({
              ControlledImpactValue: 5,
              ControlledLikelihoodValue: 5,
            }),
          ],
          getImpactIndex: getIndexMock,
          getLikelihoodIndex: getIndexMock,
        })
      );

      expect(result.current[4][4].value).toEqual(1);
    });

    it('Impact 1, Likelihood 5 should be set at index 4,0', () => {
      const { result } = renderHook(() =>
        useGetRiskAssessmentRatingsData({
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          risks: [
            buildRiskRegisterFields({
              ControlledImpactValue: 1,
              ControlledLikelihoodValue: 5,
            }),
          ],
          getImpactIndex: getIndexMock,
          getLikelihoodIndex: getIndexMock,
        })
      );

      expect(result.current[4][0].value).toEqual(1);
    });

    it('Impact 5, Likelihood 1 should be set at index 0,4', () => {
      const { result } = renderHook(() =>
        useGetRiskAssessmentRatingsData({
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          risks: [
            buildRiskRegisterFields({
              ControlledImpactValue: 5,
              ControlledLikelihoodValue: 1,
            }),
          ],
          getImpactIndex: getIndexMock,
          getLikelihoodIndex: getIndexMock,
        })
      );

      expect(result.current[0][4].value).toEqual(1);
    });

    it('should count number of risks with same impact and likelihood', () => {
      const { result } = renderHook(() =>
        useGetRiskAssessmentRatingsData({
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          risks: [
            buildRiskRegisterFields({
              ControlledImpactValue: 1,
              ControlledLikelihoodValue: 1,
            }),
            buildRiskRegisterFields({
              ControlledImpactValue: 1,
              ControlledLikelihoodValue: 1,
            }),
            buildRiskRegisterFields({
              ControlledImpactValue: 1,
              ControlledLikelihoodValue: 1,
            }),
          ],
          getImpactIndex: getIndexMock,
          getLikelihoodIndex: getIndexMock,
        })
      );

      expect(result.current[0][0].value).toEqual(3);
    });
  });
});
