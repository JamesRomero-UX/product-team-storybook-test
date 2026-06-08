import type { ServiceOptions } from 'src/services/types';

import { AttestationCycleDataAdaptor } from '../adaptors/attestation-cycle-data-adaptor';
import type { ConcludedAttestationCycle } from '../attestation-cycle';
import { refreshAttestationCycleStatusCommandHandler as handler } from './refresh-attestation-cycle-status-command-handler';

export const createRefreshAttestationCycleStatusCommandHandler = (
  opts: ServiceOptions
) => {
  const {
    getById: attestationCycleByIdReader,
    batchUpdateActiveCycleStatusByIds,
  } = AttestationCycleDataAdaptor(opts);

  const concludedAttestationCycleStatusWriter = async (
    attestationCycle: ConcludedAttestationCycle
  ): Promise<void> => {
    const result = await batchUpdateActiveCycleStatusByIds(
      [attestationCycle.id],
      {
        status: attestationCycle.status,
        concludedAtTimestamp: attestationCycle.concludedAtTimestamp,
      }
    );

    if (result.updatedCycleIds.length === 0) {
      throw new Error(
        `Failed to conclude attestation cycle: ${attestationCycle.id}`
      );
    }
  };

  return handler({
    attestationCycleByIdReader,
    concludedAttestationCycleStatusWriter,
  });
};
