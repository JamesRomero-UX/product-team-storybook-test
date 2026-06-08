import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getControlByIdQueryConfig,
  getControlNodesQueryConfig,
  getControlRegisterQueryConfig,
  getControlsBasicQueryConfig,
  getControlsByUserIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/control.query';

export type ControlRegisterResponseRow = InferQueryModel<
  'control',
  typeof getControlRegisterQueryConfig
>;

export type ControlByIdResponseRow = InferQueryModel<
  'control',
  typeof getControlByIdQueryConfig
>;

export type ControlsByUserIdResponseRow = InferQueryModel<
  'control',
  typeof getControlsByUserIdQueryConfig
>;

export type ControlsBasicResponseRow = InferQueryModel<
  'control',
  typeof getControlsBasicQueryConfig
>;

export type ControlNodesResponseRow = InferQueryModel<
  'node',
  typeof getControlNodesQueryConfig
>;

export interface ControlsBasicResponse {
  control: ControlsBasicResponseRow[];
  node: ControlNodesResponseRow[];
}

export type CreateControlResponse = ControlByIdResponseRow;
