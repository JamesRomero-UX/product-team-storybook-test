import type { QueryConfig } from '../db';
import { ancestorContributor, controlGroup } from './fragments/index';

export const getControlGroupRegisterQueryConfig = {
  ...controlGroup,
  with: {
    controls: {
      columns: {
        ControlId: true,
      },
    },
  },
} as const satisfies QueryConfig<'control_group'>;

export const getControlGroupsQueryConfig = {
  ...controlGroup,
} as const satisfies QueryConfig<'control_group'>;

export const getControlGroupByIdQueryConfig = {
  ...controlGroup,
  with: {
    ancestorContributors: {
      ...ancestorContributor,
    },
  },
} as const satisfies QueryConfig<'control_group'>;
