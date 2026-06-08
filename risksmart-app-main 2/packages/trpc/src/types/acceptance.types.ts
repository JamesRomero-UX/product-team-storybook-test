import type { ApprovalStatus } from '@risksmart-app/domain/src/types/consts/index';
import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAcceptanceByIdQueryConfig,
  getAcceptanceRegisterQueryConfig,
  getAcceptancesByParentRiskIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/acceptance.query';

import type { GetFormConfigurationResponseRow } from './form-configuration.types';

export type AcceptanceRegisterResponseRow = InferQueryModel<
  'acceptance',
  typeof getAcceptanceRegisterQueryConfig
>;

export type GetAcceptanceByIdResponseRow = InferQueryModel<
  'acceptance',
  typeof getAcceptanceByIdQueryConfig
>;

export type GetAcceptancesByParentRiskIdResponseRow = InferQueryModel<
  'acceptance',
  typeof getAcceptancesByParentRiskIdQueryConfig
>;

export type AcceptanceRegisterResponseRowWithChangeRequests =
  AcceptanceRegisterResponseRow & {
    changeRequests: {
      ChangeRequestStatus: ApprovalStatus;
      ModifiedAtTimestamp: string;
    }[];
  };

export type GetAcceptancesByParentRiskIdResponseRowWithChangeRequests =
  GetAcceptancesByParentRiskIdResponseRow & {
    changeRequests: {
      ChangeRequestStatus: ApprovalStatus;
      ModifiedAtTimestamp: string;
    }[];
  };

export interface AcceptancesByParentRiskIdResponse {
  acceptance: GetAcceptancesByParentRiskIdResponseRowWithChangeRequests[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

export interface CreateAcceptanceResponse {
  Id: string;
}

export interface UpdateAcceptanceResponse {
  Id: string;
}
