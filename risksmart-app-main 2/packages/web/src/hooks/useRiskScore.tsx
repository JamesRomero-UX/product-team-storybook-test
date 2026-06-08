import { useSubscription } from '@apollo/client';
import {
  GetLatestRiskScoresByRiskIdDocument,
  GetRiskScoresDocument,
  Risk_Assessment_Result_Control_Type_Enum,
  Risk_Scoring_Model_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useAggregation } from 'src/hooks/useAggregation';
import { UNRATED } from 'src/pages/controls/lookupData';
import type { RatingOption } from 'src/ratings/ratings';
import { useRiskRatingResolver } from 'src/ratings/useRiskRatingResolver';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { useGetRiskScoresByRiskId } from './queries';

export type RiskScore = {
  id: string;
  inherentRating: null | number;
  inherentScore: null | number;
  inherentLikelihood?: null | number;
  inherentImpact?: null | number;
  inherentRatingId: string | undefined;
  residualRating: null | number;
  residualScore: null | number;
  residualLikelihood?: null | number;
  residualImpact?: null | number;
  inherentCompletionDate: null | string | undefined;
  residualCompletionDate: null | string | undefined;
  residualRatingId: string | undefined;
};

type RiskScoreMeta = {
  loading: boolean;
  showScore?: boolean;
};

export const getRiskScoreBadge = (
  lookupValue: null | number | undefined,
  getLabelByFn: (
    r: null | number | string | undefined
  ) => RatingOption | undefined,
  displayValue?: null | number
) => {
  if (!lookupValue) {
    return <SimpleRatingBadge rating={UNRATED} />;
  }

  let ratingOption = getLabelByFn(lookupValue) ?? UNRATED;
  if (!_.isNil(displayValue) && ratingOption.label !== 'Unrated') {
    ratingOption = {
      ...ratingOption,
      label: displayValue?.toFixed(1),
    };
  }

  return <SimpleRatingBadge rating={ratingOption} />;
};

export const useRiskScoreFormatters = () => {
  const { resolveRiskRating } = useRiskRatingResolver();

  return useCallback(
    (score: Partial<RiskScore> | undefined) => {
      const getInherentOption = () =>
        resolveRiskRating({
          likelihood: score?.inherentLikelihood ?? null,
          impact: score?.inherentImpact ?? null,
          controlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
          rating: score?.inherentRating ?? null,
        });

      const getResidualOption = () =>
        resolveRiskRating({
          likelihood: score?.residualLikelihood ?? null,
          impact: score?.residualImpact ?? null,
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          rating: score?.residualRating ?? null,
        });

      return {
        getInherentOption,
        getResidualOption,
        getInherentLabel: () => getInherentOption()?.label ?? UNRATED.label,
        getResidualLabel: () => getResidualOption()?.label ?? UNRATED.label,
        getInherentRatingBadge: () => (
          <SimpleRatingBadge rating={getInherentOption() ?? UNRATED} />
        ),
        getResidualRatingBadge: () => (
          <SimpleRatingBadge rating={getResidualOption() ?? UNRATED} />
        ),
      };
    },
    [resolveRiskRating]
  );
};

export type UseRiskScoreFormattersResponse = ReturnType<
  typeof useRiskScoreFormatters
>;

export const useRiskScore = (riskId: string): RiskScore & RiskScoreMeta => {
  const { riskModel } = useAggregation();
  const { data: riskScores } = useSubscription(
    GetLatestRiskScoresByRiskIdDocument,
    {
      variables: {
        RiskId: riskId,
      },
    }
  );

  const { data, loading } = useGetRiskScoresByRiskId({
    queryArgs: { riskId },
  });

  const showScore = riskModel !== 'default';

  const latestInherent = data?.inherent[0];
  const latestResidual = data?.residual[0];
  const riskScore = riskScores?.risk_score[0];
  const scores = mapToRiskScore({
    showScore,
    id: riskId,
    latestInherent,
    latestResidual,
    riskScore,
  });

  return {
    loading,
    showScore,
    ...scores,
  };
};

type RiskAssessmentResult =
  | {
      Id: string;
      Rating?: null | number | undefined;
      Impact?: null | number | undefined;
      Likelihood?: null | number | undefined;
      TestDate?: null | string | undefined;
    }
  | null
  | undefined;

const mapToRiskScore = ({
  showScore,
  id,
  latestInherent,
  latestResidual,
  riskScore,
}: {
  showScore: boolean;
  id: string;
  latestInherent: RiskAssessmentResult;
  latestResidual: RiskAssessmentResult;
  riskScore:
    | {
        ResidualScore?: null | number | undefined;
        InherentScore?: null | number | undefined;
        ResidualRating?: null | number | undefined;
        InherentRating?: null | number | undefined;
        ResidualLikelihood?: null | number | undefined;
        ResidualImpact?: null | number | undefined;
        InherentLikelihood?: null | number | undefined;
        InherentImpact?: null | number | undefined;
        ModifiedAtTimestamp: string;
      }
    | null
    | undefined;
}): RiskScore => {
  const score: RiskScore = {
    id,
    inherentRating: riskScore?.InherentRating ?? null,
    inherentScore: riskScore?.InherentScore ?? null,
    inherentImpact: showScore
      ? riskScore?.InherentImpact
      : latestInherent?.Impact,
    inherentLikelihood: showScore
      ? riskScore?.InherentLikelihood
      : latestInherent?.Likelihood,
    residualRating: riskScore?.ResidualRating ?? null,
    residualScore: riskScore?.ResidualScore ?? null,
    residualImpact: showScore
      ? riskScore?.ResidualImpact
      : latestResidual?.Impact,
    residualLikelihood: showScore
      ? riskScore?.ResidualLikelihood
      : latestResidual?.Likelihood,
    inherentRatingId: !showScore ? latestInherent?.Id : undefined,
    inherentCompletionDate: !showScore
      ? latestInherent?.TestDate
      : riskScore?.ModifiedAtTimestamp,
    residualCompletionDate: !showScore
      ? latestResidual?.TestDate
      : riskScore?.ModifiedAtTimestamp,
    residualRatingId: !showScore ? latestResidual?.Id : undefined,
  };

  return score;
};

const useGetRiskScoresSubscriptionWrapper = () => {
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { data: graphqlData, loading: graphqlLoading } = useSubscription(
    GetRiskScoresDocument,
    {
      skip: trpcEnabled,
    }
  );

  const trpc = useTRPC();
  const { data: trpcData, isLoading: trpcLoading } = useReactQuery({
    ...trpc.frontend.risk.scores.queryOptions(),
    enabled: trpcEnabled, // Only enable TRPC query when flag is true
  });
  if (trpcEnabled) {
    return {
      data: trpcData,
      loading: trpcLoading,
    };
  }

  return {
    data: graphqlData,
    loading: graphqlLoading,
  };
};

export const useRiskScores = (): {
  loading: boolean;
  showScore: boolean;
  scores: RiskScore[] | undefined;
} => {
  const { data, loading } = useGetRiskScoresSubscriptionWrapper();
  const { riskModel } = useAggregation();

  const showScore = riskModel !== Risk_Scoring_Model_Enum.Default;

  return useMemo(
    () => ({
      loading,
      showScore,
      scores: data?.risk.map((r) => {
        const latestInherent = r?.inherent[0]?.riskAssessmentResult;
        const latestResidual = r?.residual[0]?.riskAssessmentResult;

        return mapToRiskScore({
          showScore,
          id: r.Id,
          latestInherent,
          latestResidual,
          riskScore: r.riskScore,
        });
      }),
    }),
    [data?.risk, loading, showScore]
  );
};
