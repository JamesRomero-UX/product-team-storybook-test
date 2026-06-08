import { BadRequest } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { ModifiedSinceLastViewError } from 'src/errors/ModifiedSinceLastViewError';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';

import type { UpdateByPkInput } from '../../repositories/control/control.repository';
import { ControlRepository } from '../../repositories/control/control.repository';
import type { ServiceOptions } from '../types';

export const ControlService = (opts: ServiceOptions) => {
  const controlRepo = ControlRepository(opts);
  const apiClient = getBackendRestApiClient(opts);

  return {
    async delete(id: string | string[]) {
      await controlRepo.delete(id);
    },
    async findById(id: string) {
      const actions = await controlRepo.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );
      if (!actions[0]) {
        throw new BadRequest('Control not found');
      }

      return actions[0];
    },
    async updateByPk(id: string, data: UpdateByPkInput) {
      const control = await this.findById(id);
      if (
        new Date(control.ModifiedAtTimestamp).valueOf() !==
        new Date(data.OriginalTimestamp).valueOf()
      ) {
        throw new ModifiedSinceLastViewError();
      }

      const result = await apiClient.updateControl(data);
      // 0 records being updated is most likely a permission issue which we need to resolve,
      // or the control has been deleted in the small time window between getting it above, and performing the update
      if (!result) {
        throw new Error('Failed to update control');
      }

      const { ctx, refreshControlScheduleState } = createScheduleRefresh(opts);
      await refreshControlScheduleState(ctx, id);

      return result;
    },
  };
};
