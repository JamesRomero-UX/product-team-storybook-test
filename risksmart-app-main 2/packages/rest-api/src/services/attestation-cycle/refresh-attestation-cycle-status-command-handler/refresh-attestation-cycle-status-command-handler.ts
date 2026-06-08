import { getLogger } from 'src/logger';

import type {
  AttestationCycle,
  ConcludedAttestationCycle,
} from '../attestation-cycle';
import {
  asConcludedNaturally,
  canBeConcludedNaturally,
} from '../attestation-cycle';
import type { AttestationCycleId } from '../types';

const logger = getLogger();

export type RefreshAttestationCycleStatusCommand = Readonly<{
  attestationCycleId: AttestationCycleId;
}>;

interface RefreshAttestationCycleStatusCommandHandler {
  execute(command: RefreshAttestationCycleStatusCommand): Promise<void>;
}

interface Dependencies {
  attestationCycleByIdReader: (
    attestationCycleId: AttestationCycleId
  ) => Promise<AttestationCycle | null>;

  concludedAttestationCycleStatusWriter: (
    attestationCycle: ConcludedAttestationCycle
  ) => Promise<void>;
}

export const refreshAttestationCycleStatusCommandHandler = ({
  attestationCycleByIdReader,
  concludedAttestationCycleStatusWriter,
}: Dependencies): RefreshAttestationCycleStatusCommandHandler => {
  const execute = async ({
    attestationCycleId,
  }: RefreshAttestationCycleStatusCommand) => {
    const attestationCycle =
      await attestationCycleByIdReader(attestationCycleId);

    if (!attestationCycle) {
      throw new Error(`Attestation cycle not found: ${attestationCycleId}`);
    }

    if (attestationCycle.status === 'concluded') {
      logger.info('Attestation cycle already concluded, skipping');

      return;
    }

    if (canBeConcludedNaturally(attestationCycle)) {
      await concludedAttestationCycleStatusWriter(
        asConcludedNaturally(attestationCycle)
      );
      logger.info('Attestation cycle concluded', { id: attestationCycle.id });
    }
  };

  return { execute };
};
