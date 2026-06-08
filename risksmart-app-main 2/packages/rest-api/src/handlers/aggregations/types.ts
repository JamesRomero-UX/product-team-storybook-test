import type {
  ControlTypeEnum,
  GetAncestorRiskScoresByRiskIdQuery,
  GetRiskScoreDataQuery,
  RiskScoreInsertInput,
} from 'generated/graphql';

export type Controls = GetRiskScoreDataQuery['risk'][number]['controls'];

export type Risk = GetRiskScoreDataQuery['risk'][number];

export type RiskScoreForInsert = RiskScoreInsertInput &
  Required<
    Pick<
      RiskScoreInsertInput,
      | 'InherentRating'
      | 'ResidualRating'
      | 'ResidualScore'
      | 'InherentScore'
      | 'ResidualImpact'
      | 'ResidualLikelihood'
      | 'InherentImpact'
      | 'InherentLikelihood'
      | 'RiskId'
    >
  >;

export interface RatingCategory {
  label: string;
  value: number;
  range: [number, number];
  likelihoodImpact?: { likelihood: number; impact: number }[];
}

export type CalculateResidualRatingFn = (options: {
  residualScore: number | null;
  residualRatingCategories: RatingCategory[];
  latestResidualRating: Risk['residualAssessmentResults'][number]['riskAssessmentResult'];
  residualLikelihood?: number | null;
  residualImpact?: number | null;
}) => number | null;

export type CalculateInherentRatingFn = (options: {
  inherentScore: number | null;
  inherentRatingCategories: RatingCategory[];
  latestInherentRating: Risk['inherentAssessmentResults'][number]['riskAssessmentResult'];
  inherentLikelihood?: number | null;
  inherentImpact?: number | null;
}) => number | null;

export type CalculateControlEffectivenessFn<T> = (options: {
  config: T;
  controls: Partial<Controls>;
}) => {
  impactMitigation?: number;
  likelihoodMitigation?: number;
  overallMitigation: number;
} | null;

export type CalculateInherentScoreFn<T> = (options: {
  config: T;
  riskId: string;
  latestInherentRating: Risk['inherentAssessmentResults'][number]['riskAssessmentResult'];
}) => { impact: number; likelihood: number; score: number } | null;

export type CalculateResidualScoreFn = (options: {
  inherentScore: { impact: number; likelihood: number; score: number } | null;
  inherentRating?: number | null;
  controlEffectiveness: null | {
    impactMitigation?: number;
    likelihoodMitigation?: number;
    overallMitigation: number;
  };
  latestResidualRating: Risk['residualAssessmentResults'][number]['riskAssessmentResult'];
}) => number | { impact: number; likelihood: number; score: number } | null;

export type AncestorScores = GetAncestorRiskScoresByRiskIdQuery;

export interface ControlFilter {
  controlFilterField?: 'Type' | 'Id' | 'CustomAttributeData';
  controlFilterCustomAttributeKey?: string;
  controlFilterValues?: string[];
}

export interface ControlWeights {
  enableWeighting?: boolean;
  weightFieldName?: string;
}

export type NumberOfControlsWithGapsConfig = ControlFilter & {
  inherentScoreOverride?: number;
  excludeControlsWithValues?: number[];
  nonEffectiveValues: number[];
};

export type ControlEffectivenessAveragesConfig = ControlFilter &
  ControlWeights & {
    mitigations: {
      lowerBound: number;
      upperBound: number;
      mitigationMultiplier: number;
    }[];
    roundControlEffectiveness?: boolean;
    ignoreOverallEffectiveness?: boolean;
  };

export interface AppetiteCascadingConfig {
  enableTierTwoCascading: boolean;
}

export type TypedControlEffectivenessAveragesConfig =
  ControlEffectivenessAveragesConfig & {
    likelihoodImpactWeights?: {
      [key in keyof typeof ControlTypeEnum]: {
        likelihoodWeight: number;
        impactWeight: number;
      };
    };
  };
