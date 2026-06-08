import type { ServiceOptions } from 'src/services/types';

import { AttestationCycleDataAdaptor } from '../adaptors/attestation-cycle-data-adaptor';
import type { ConcludedAttestationCycle } from '../attestation-cycle';
import { ensureSingleActiveAttestationCycleCommandHandler as handler } from './ensure-single-active-attestation-cycle-command-handler';

export const createEnsureSingleActiveAttestationCycleCommandHandler = (
  opts: ServiceOptions
) => {
  const {
    batchUpdateActiveCycleStatusByIds,
    getAllActive: activeAttestationCyclesReader,
  } = AttestationCycleDataAdaptor(opts);

  const concludedAttestationCycleStatusWriter = async (
    concludedAttestationCycles: ConcludedAttestationCycle[]
  ): Promise<{ affectedCount: number }> => {
    const first = concludedAttestationCycles[0];

    if (!first) {
      return { affectedCount: 0 };
    }

    const result = await batchUpdateActiveCycleStatusByIds(
      concludedAttestationCycles.map((cycle) => cycle.id),
      {
        status: first.status,
        concludedAtTimestamp: first.concludedAtTimestamp,
      }
    );

    if (result.updatedCycleIds.length !== concludedAttestationCycles.length) {
      throw new Error(
        `Failed to conclude all attestation cycles. Expected to update ${concludedAttestationCycles.length}, but updated ${result.updatedCycleIds.length}`
      );
    }

    return { affectedCount: result.updatedCycleIds.length };
  };

  return handler({
    activeAttestationCyclesReader,
    concludedAttestationCycleStatusWriter,
  });
};
