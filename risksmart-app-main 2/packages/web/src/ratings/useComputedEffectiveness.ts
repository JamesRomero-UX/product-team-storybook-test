import { useRating } from '@risksmart-app/components/src/hooks/useRating';

import { hasRange } from '@/utils/utils';

export const useComputedEffectiveness = ({
  design,
  performance,
}: {
  design: number;
  performance: number;
}) => {
  const overall = design * performance;

  const { options } = useRating('effectiveness');
  const overallOption = options.find(
    (band) =>
      hasRange(band) && overall >= band.range[0] && overall <= band.range[1]
  );

  return Number(overallOption?.value);
};
