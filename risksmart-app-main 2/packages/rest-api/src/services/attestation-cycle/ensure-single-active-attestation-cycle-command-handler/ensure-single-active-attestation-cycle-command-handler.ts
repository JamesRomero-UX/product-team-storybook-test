import { getLogger } from 'src/logger';
import z from 'zod';

import type { ConcludedAttestationCycle } from '../attestation-cycle';
import {
  asConcludedSuperseded,
  type AttestationCycle,
} from '../attestation-cycle';
import { attestationCycleIdSchema } from '../types';

const logger = getLogger();

interface Dependencies {
  activeAttestationCyclesReader: () => Promise<AttestationCycle[]>;
  concludedAttestationCycleStatusWriter: (
    concludedAttestationCycles: ConcludedAttestationCycle[]
  ) => Promise<{ affectedCount: number }>;
}

const _ensureSingleActiveAttestationCycleCommandSchema = z.object({
  keepActiveCycleId: attestationCycleIdSchema,
});

export type EnsureSingleActiveAttestationCycleCommand = Readonly<
  z.infer<typeof _ensureSingleActiveAttestationCycleCommandSchema>
>;

export const ensureSingleActiveAttestationCycleCommandHandler = ({
  activeAttestationCyclesReader,
  concludedAttestationCycleStatusWriter,
}: Dependencies) => ({
  execute: async (
    command: EnsureSingleActiveAttestationCycleCommand
  ): Promise<void> => {
    const allActiveCycles = await activeAttestationCyclesReader();

    const activeCycle = allActiveCycles.find(
      (cycle) => cycle.id === command.keepActiveCycleId
    );

    if (!activeCycle) {
      logger.warn(
        `No active attestation cycle found with ID: ${command.keepActiveCycleId}`
      );

      return;
    }

    const concludedCycles = allActiveCycles
      .filter(
        (cycle) =>
          cycle.policy.id === activeCycle.policy.id &&
          cycle.id !== command.keepActiveCycleId
      )
      .map(asConcludedSuperseded);

    if (concludedCycles.length === 0) {
      logger.info(
        `No other active attestation cycles found for policy: ${activeCycle.policy.id}`
      );

      return;
    }

    const { affectedCount } =
      await concludedAttestationCycleStatusWriter(concludedCycles);

    if (affectedCount !== concludedCycles.length) {
      logger.warn(`Mismatch in concluded attestation cycles count`, {
        expectedCount: concludedCycles.length,
        affectedCount,
      });
    }

    logger.info(`Concluded active attestation cycle(s) for policy`, {
      ids: concludedCycles.map((cycle) => cycle.id),
    });
  },
});
