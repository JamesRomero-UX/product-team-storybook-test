import { BadRequest } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';

import type { UpdateInput } from '../../repositories/risk/risk.repository';
import { isOrgModuleEnabled } from '../orgUtilities';
import type { ServiceOptions } from '../types';

export const RiskService = (opts: ServiceOptions) => {
  const apiClient = getBackendRestApiClient(opts);

  return {
    async delete(id: string) {
      await apiClient.deleteRisks({ where: { Id: { _eq: id } } });
    },
    async update(data: UpdateInput) {
      const result = await apiClient.updateRisk(data);
      if (!result) {
        throw new BadRequest('Risk not found');
      }
      const { ctx, refreshRiskScheduleState } = createScheduleRefresh({
        orgKey: opts.orgKey,
        userId: opts.userId,
        userRole: opts.userRole,
        tenant: opts.tenant,
      });
      const useImpacts = await isOrgModuleEnabled(
        { orgKey: opts.orgKey, tenant: opts.tenant },
        'risk.subModules.impact'
      );
      await refreshRiskScheduleState(ctx, data.Id, {
        useImpacts,
      });

      return result;
    },
    async findById(id: string) {
      const { risk } = await apiClient.getRisks({
        where: { Id: { _eq: id } },
        limit: 1,
      });

      if (!risk[0]) {
        throw new BadRequest('Risk not found');
      }

      return risk[0];
    },
  };
};
