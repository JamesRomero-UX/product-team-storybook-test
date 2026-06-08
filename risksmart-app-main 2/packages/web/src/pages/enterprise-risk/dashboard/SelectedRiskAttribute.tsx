import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { FC } from 'react';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import type { CardType } from './types';
import { EnterpriseRiskAttribute } from './types';

const SelectedRiskAttribute: FC<{
  data: CardType;
  selectedRiskAttribute: EnterpriseRiskAttribute;
}> = ({ data, selectedRiskAttribute }) => {
  const { getByRange: getResidualRating } = useRating('risk_controlled');
  const { getByRange: getInherentRating } = useRating('risk_uncontrolled');

  if (data.unlinked) {
    return;
  }

  let rating: { color?: string; label: string; tooltip?: string } | undefined =
    undefined;

  switch (selectedRiskAttribute) {
    case EnterpriseRiskAttribute.InherentMean:
      rating = getInherentRating(data.score?.InherentScoreMean);
      break;
    case EnterpriseRiskAttribute.ResidualMean:
      rating = getResidualRating(data.score?.ResidualScoreMean);
      break;
    case EnterpriseRiskAttribute.InherentWorstCase:
      rating = getInherentRating(data.score?.InherentScoreWorstCase);
      break;
    case EnterpriseRiskAttribute.ResidualWorstCase:
      rating = getResidualRating(data.score?.ResidualScoreWorstCase);
      break;
  }

  return <SimpleRatingBadge rating={rating} />;
};

export default SelectedRiskAttribute;
