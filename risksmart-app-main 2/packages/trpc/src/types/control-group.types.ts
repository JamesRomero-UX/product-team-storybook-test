import type {
  InferQueryModel,
  InferSelectModel,
} from '@risksmart-app/drizzle/src/db';
import type {
  getControlGroupByIdQueryConfig,
  getControlGroupRegisterQueryConfig,
  getControlGroupsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/control-group.query';

export type ControlGroupRegisterResponseRow = InferQueryModel<
  'control_group',
  typeof getControlGroupRegisterQueryConfig
>;

export type ControlGroupsByTitleResponseRow = InferQueryModel<
  'control_group',
  typeof getControlGroupsQueryConfig
>;

export type ControlGroupResponseRow = InferQueryModel<
  'control_group',
  typeof getControlGroupByIdQueryConfig
>;

export type ControlGroupsResponseRow = InferQueryModel<
  'control_group',
  typeof getControlGroupsQueryConfig
>;

export type CreateControlGroupResponse = InferSelectModel<'control_group'>;
