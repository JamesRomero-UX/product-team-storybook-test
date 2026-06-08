import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Risk_Scoring_Model_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { UNRATED } from 'src/pages/controls/lookupData';
import { useCalculateRiskRating } from 'src/ratings/useCalculateRiskRating';
import { useScoringSettings } from 'src/ratings/useScoringSettings';

import { getRiskScoreBadge } from '@/hooks/useRiskScore';

export type Props = {
  controlType: Risk_Assessment_Result_Control_Type_Enum;
  riskScoreModel: Risk_Scoring_Model_Enum;
  impact: null | number;
  likelihood: null | number;
  rating: null | number;
  score: null | number;
};

export const RiskScoreBadge: FC<Props> = ({
  controlType,
  impact,
  likelihood,
  rating,
  riskScoreModel,
  score,
}) => {
  const { hasScoringSettings, getRatingByLikelihoodAndImpact } =
    useScoringSettings();
  const { getByValue } = useRating(
    controlType === 'Controlled' ? 'risk_controlled' : 'risk_uncontrolled'
  );

  const calculateRating = useCalculateRiskRating(controlType);

  if (hasScoringSettings) {
    if (likelihood && impact) {
      const cell = getRatingByLikelihoodAndImpact(likelihood, impact);
      if (cell) {
        return (
          <SimpleRatingBadge
            rating={{
              label: score != null ? score.toFixed(1) : cell.label,
              color: cell.color,
            }}
          />
        );
      }
    }

    return <SimpleRatingBadge rating={UNRATED} />;
  }

  // Currently the only way to get a score rating category is to use the impact likelihood values.
  // This is because when using the default scoring model,
  // a) the rating can be overriden so it has no reflection on impact likelihood, whilst the score is always likelihod * impact
  // b) a single score value could potentially map to multiple rating categories e.g. a score of 12 = likelihood 3, impact 4, or likelihood 4, impact 3 (which could have different labels, colours)
  // Note we could simplify this in the future by storing a score-rating value on the risk_score table
  const isDefaultScoringModel =
    riskScoreModel === Risk_Scoring_Model_Enum.Default;

  const scoreRating = isDefaultScoringModel
    ? calculateRating({ impact: impact ?? 0, likelihood: likelihood ?? 0 })
        .value
    : rating;

  return getRiskScoreBadge(scoreRating, getByValue, score);
};
