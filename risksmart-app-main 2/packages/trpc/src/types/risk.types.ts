import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getRiskByIdQueryConfig,
  getRiskListOnlyOptimizedQueryConfig,
  getRiskListOnlyWithEntitiesOptimizedQueryConfig,
  getRiskRegisterQueryConfig,
  getRiskScoreQueryConfig,
  getRiskScoresByRiskIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/risk.query';

export type RiskRegisterResponseRow = InferQueryModel<
  'risk',
  typeof getRiskRegisterQueryConfig
>;

export type RiskByIdResponseRow = InferQueryModel<
  'risk',
  typeof getRiskByIdQueryConfig
>;

export type RiskListOnlyOptimizedResponseRow = InferQueryModel<
  'risk',
  typeof getRiskListOnlyOptimizedQueryConfig
>;

export type RiskListOnlyWithEntitiesOptimizedResponseRow = InferQueryModel<
  'risk',
  typeof getRiskListOnlyWithEntitiesOptimizedQueryConfig
>;

export type RiskScoreRow = InferQueryModel<
  'risk',
  typeof getRiskScoreQueryConfig
>;

export type RiskScoresByRiskIdResponseRow = InferQueryModel<
  'risk_assessment_result',
  typeof getRiskScoresByRiskIdQueryConfig
>;

export interface RiskScoresByRiskIdResponse {
  risk: {
    Tier: number;
  }[];
  inherent: RiskScoresByRiskIdResponseRow[];
  residual: RiskScoresByRiskIdResponseRow[];
}

export type CreateRiskResponse = RiskByIdResponseRow;

export interface UpdateRiskResponse {
  Id: string;
}
