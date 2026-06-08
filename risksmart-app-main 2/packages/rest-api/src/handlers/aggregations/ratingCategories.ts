import i18n from '@risksmart-app/i18n/src/i18n';
import type { Sdk } from 'generated/graphql2';
import { RiskAssessmentResultConfigSchema } from 'src/handlers/risk-assessment-result-config/schema';
import { getOrgFeatures } from 'src/services/orgUtilities';

import type { RatingCategory } from './types';

export interface RatingCategories {
  inherentRatingCategories: RatingCategory[];
  residualRatingCategories: RatingCategory[];
}

const fromConfig = async (
  apiClient: Sdk,
  orgKey: string
): Promise<RatingCategories | undefined> => {
  const result = await apiClient.getLatestRiskAssessmentResultConfigByOrg({
    OrgKey: orgKey,
  });
  const rawConfig = result.risk_assessment_result_config[0]?.Config;
  const config = rawConfig
    ? RiskAssessmentResultConfigSchema.parse(rawConfig)
    : undefined;

  if (!config) {
    return undefined;
  }

  const categories: RatingCategory[] = config.matrix.map((entry) => ({
    label: entry.title,
    value: entry.value,
    likelihoodImpact: [{ likelihood: entry.likelihood, impact: entry.impact }],
    range: [0, 0] as [number, number],
  }));

  return {
    inherentRatingCategories: categories,
    residualRatingCategories: categories,
  };
};

const fromI18n = (): RatingCategories => ({
  inherentRatingCategories: i18n.t('risk_uncontrolled', {
    ns: 'ratings',
    returnObjects: true,
  }) as unknown as RatingCategory[],
  residualRatingCategories: i18n.t('risk_controlled', {
    ns: 'ratings',
    returnObjects: true,
  }) as unknown as RatingCategory[],
});

export const getRatingCategories = async (
  apiClient: Sdk,
  orgKey: string,
  tenant?: string
): Promise<RatingCategories> => {
  if (tenant) {
    const features = await getOrgFeatures({ orgKey, tenant });
    if (!features.includes('scoring_settings_data')) {
      return fromI18n();
    }
  }

  const config = await fromConfig(apiClient, orgKey);

  if (!config) {
    return fromI18n();
  }

  return config;
};
