import {
  buildAttestationCycle,
  withRecords,
} from 'test/attestation-cycle/attestation-cycle-builder';
import {
  buildAttestationRecord,
  withAttestedState,
} from 'test/attestation-cycle/attestation-record-builder';

import { attestationCycleIdSchema } from '../types';
import type { RefreshAttestationCycleStatusCommand } from './refresh-attestation-cycle-status-command-handler';
import { refreshAttestationCycleStatusCommandHandler } from './refresh-attestation-cycle-status-command-handler';

describe('refresh attestation cycle status command handler', () => {
  it('should throw an error when attestation cycle is not found', async () => {
    const mockConcludedAttestationCycleStatusWriter = vi.fn();
    const mockAttestationCycleByIdReader = vi.fn().mockResolvedValue(null);

    const command: RefreshAttestationCycleStatusCommand = {
      attestationCycleId: attestationCycleIdSchema.parse(
        '00000000-0000-0000-0000-000000000000'
      ),
    };

    const handler = refreshAttestationCycleStatusCommandHandler({
      attestationCycleByIdReader: mockAttestationCycleByIdReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await expect(handler.execute(command)).rejects.toThrow(
      `Attestation cycle not found: ${command.attestationCycleId}`
    );
  });

  it('should conclude an attestation cycle when all records are attested', async () => {
    const mockCycle = buildAttestationCycle(
      withRecords([
        buildAttestationRecord(withAttestedState()),
        buildAttestationRecord(withAttestedState()),
      ])
    );

    const mockConcludedAttestationCycleStatusWriter = vi.fn();
    const mockAttestationCycleByIdReader = vi.fn().mockResolvedValue(mockCycle);

    const command: RefreshAttestationCycleStatusCommand = {
      attestationCycleId: attestationCycleIdSchema.parse(
        '00000000-0000-0000-0000-000000000000'
      ),
    };

    const handler = refreshAttestationCycleStatusCommandHandler({
      attestationCycleByIdReader: mockAttestationCycleByIdReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await handler.execute(command);

    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledTimes(1);
    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockCycle.id,
        status: 'concluded',
      })
    );
  });

  it('should not conclude an attestation cycle when some records are not attested', async () => {
    const mockCycle = buildAttestationCycle(
      withRecords([
        buildAttestationRecord(withAttestedState()),
        buildAttestationRecord(),
      ])
    );

    const mockConcludedAttestationCycleStatusWriter = vi.fn();
    const mockAttestationCycleByIdReader = vi.fn().mockResolvedValue(mockCycle);

    const command: RefreshAttestationCycleStatusCommand = {
      attestationCycleId: attestationCycleIdSchema.parse(
        '00000000-0000-0000-0000-000000000000'
      ),
    };

    const handler = refreshAttestationCycleStatusCommandHandler({
      attestationCycleByIdReader: mockAttestationCycleByIdReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await handler.execute(command);

    expect(mockConcludedAttestationCycleStatusWriter).not.toHaveBeenCalled();
  });
});
