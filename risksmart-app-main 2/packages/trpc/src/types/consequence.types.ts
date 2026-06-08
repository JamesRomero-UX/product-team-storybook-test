import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getConsequenceAuditByIdQueryConfig,
  getConsequencesByIdQueryConfig,
  getConsequencesRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/consequence.query';

export type ConsequenceByIdResponseRow = InferQueryModel<
  'consequence',
  typeof getConsequencesByIdQueryConfig
>;

export type ConsequenceAuditByIdResponseRow = InferQueryModel<
  'consequence_audit',
  typeof getConsequenceAuditByIdQueryConfig
>;

export type ConsequenceRegisterResponseRow = InferQueryModel<
  'consequence',
  typeof getConsequencesRegisterQueryConfig
>;
