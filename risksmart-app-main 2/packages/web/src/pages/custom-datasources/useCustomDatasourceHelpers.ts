import { useRating } from '@risksmart-app/components/src/hooks/useRating';

import useEntityInfo from '@/hooks/getEntityInfo';
import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';
import { useIsFeatureFlagEnabledLazy } from '@/hooks/useIsFeatureFlagEnabled';
import { useScoringSettings } from '@/ratings/useScoringSettings';

import type { Helpers } from './update/display-types/types';

export const useCustomDatasourceHelpers = () => {
  const isFeatureFlagEnabled = useIsFeatureFlagEnabledLazy();
  const getEntityInfo = useEntityInfo();
  const {
    getByValueAndRatingKey: getRatingByValue,
    getOptionsByRatingKey: getRatingOptions,
  } = useRating();
  const {
    getByValue: getCommonLookupByValue,
    getOptions: getCommonLookupOptions,
  } = useCommonLookupLazy();
  const {
    hasScoringSettings,
    getRatingByLikelihoodAndImpact,
    getLikelihoodByValue,
    getImpactByValue,
    likelihoodOptions,
    impactOptions,
    ratingLevelOptions,
  } = useScoringSettings();

  const helpers: Helpers = {
    isFeatureFlagEnabled,
    getRatingByValue,
    getCommonLookupByValue,
    getRatingOptions,
    getCommonLookupOptions,
    getEntityInfo,
    hasScoringSettings,
    getRatingByLikelihoodAndImpact,
    getLikelihoodByValue,
    getImpactByValue,
    likelihoodOptions,
    impactOptions,
    ratingLevelOptions,
  };

  return helpers;
};
