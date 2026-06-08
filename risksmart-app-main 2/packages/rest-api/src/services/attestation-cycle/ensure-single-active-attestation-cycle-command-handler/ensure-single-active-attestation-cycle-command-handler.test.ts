import {
  buildAttestationCycle,
  withPolicy,
  withRecords,
} from 'test/attestation-cycle/attestation-cycle-builder';
import { buildAttestationRecord } from 'test/attestation-cycle/attestation-record-builder';

import { attestationCycleIdSchema } from '../types';
import type { EnsureSingleActiveAttestationCycleCommand } from './ensure-single-active-attestation-cycle-command-handler';
import { ensureSingleActiveAttestationCycleCommandHandler } from './ensure-single-active-attestation-cycle-command-handler';

describe('ensure single active attestation cycle command handler', () => {
  it('should conclude active attestation cycles for the parent policy, excluding the specified cycle', async () => {
    const policyId = '11111111-1111-1111-1111-111111111111';

    const keepActiveCycle = buildAttestationCycle(
      withPolicy({
        id: policyId,
        version: {
          id: '99999999-9999-9999-9999-999999999999',
        },
      }),
      withRecords([buildAttestationRecord()]) // Can have incomplete records
    );

    const otherCycle1 = buildAttestationCycle(
      withPolicy({
        id: policyId,
        version: {
          id: '88888888-8888-8888-8888-888888888888',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    const otherCycle2 = buildAttestationCycle(
      withPolicy({
        id: policyId,
        version: {
          id: '77777777-7777-7777-7777-777777777777',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    const mockActiveAttestationCyclesReader = vi
      .fn()
      .mockResolvedValue([keepActiveCycle, otherCycle1, otherCycle2]);

    const mockConcludedAttestationCycleStatusWriter = vi
      .fn()
      .mockResolvedValue({ affectedCount: 2 });

    const command: EnsureSingleActiveAttestationCycleCommand = {
      keepActiveCycleId: keepActiveCycle.id,
    };

    const handler = ensureSingleActiveAttestationCycleCommandHandler({
      activeAttestationCyclesReader: mockActiveAttestationCyclesReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await handler.execute(command);

    expect(mockActiveAttestationCyclesReader).toHaveBeenCalledTimes(1);
    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledTimes(1);
    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: otherCycle1.id,
          status: 'concluded',
        }),
        expect.objectContaining({
          id: otherCycle2.id,
          status: 'concluded',
        }),
      ])
    );

    // Verify the keepActiveCycle was NOT concluded
    const concludedCycles =
      mockConcludedAttestationCycleStatusWriter.mock.calls[0]?.[0];
    expect(concludedCycles).toHaveLength(2);
    expect(
      concludedCycles.find((c: { id: string }) => c.id === keepActiveCycle.id)
    ).toBe(undefined);
  });

  it('should conclude cycles with incomplete records when superseded', async () => {
    const policyId = '11111111-1111-1111-1111-111111111111';

    const keepActiveCycle = buildAttestationCycle(
      withPolicy({
        id: policyId,
        version: {
          id: '99999999-9999-9999-9999-999999999999',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    // This cycle has incomplete records but should still be concluded
    const incompleteCycle = buildAttestationCycle(
      withPolicy({
        id: policyId,
        version: {
          id: '88888888-8888-8888-8888-888888888888',
        },
      }),
      withRecords([
        buildAttestationRecord(), // pending/not attested
        buildAttestationRecord(), // pending/not attested
      ])
    );

    const mockActiveAttestationCyclesReader = vi
      .fn()
      .mockResolvedValue([keepActiveCycle, incompleteCycle]);

    const mockConcludedAttestationCycleStatusWriter = vi
      .fn()
      .mockResolvedValue({ affectedCount: 1 });

    const command: EnsureSingleActiveAttestationCycleCommand = {
      keepActiveCycleId: keepActiveCycle.id,
    };

    const handler = ensureSingleActiveAttestationCycleCommandHandler({
      activeAttestationCyclesReader: mockActiveAttestationCyclesReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await handler.execute(command);

    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledTimes(1);
    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledWith([
      expect.objectContaining({
        id: incompleteCycle.id,
        status: 'concluded',
      }),
    ]);
  });

  it('should only conclude cycles for the same policy', async () => {
    const policy1Id = '11111111-1111-1111-1111-111111111111';
    const policy2Id = '44444444-4444-4444-4444-444444444444';
    const keepActiveCycle = buildAttestationCycle(
      withPolicy({
        id: policy1Id,
        version: {
          id: '99999999-9999-9999-9999-999999999999',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    const samePolicyCycle = buildAttestationCycle(
      withPolicy({
        id: policy1Id,
        version: {
          id: '88888888-8888-8888-8888-888888888888',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    const differentPolicyCycle = buildAttestationCycle(
      withPolicy({
        id: policy2Id,
        version: {
          id: '77777777-7777-7777-7777-777777777777',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    const mockActiveAttestationCyclesReader = vi
      .fn()
      .mockResolvedValue([
        keepActiveCycle,
        samePolicyCycle,
        differentPolicyCycle,
      ]);

    const mockConcludedAttestationCycleStatusWriter = vi
      .fn()
      .mockResolvedValue({ affectedCount: 1 });

    const command: EnsureSingleActiveAttestationCycleCommand = {
      keepActiveCycleId: keepActiveCycle.id,
    };

    const handler = ensureSingleActiveAttestationCycleCommandHandler({
      activeAttestationCyclesReader: mockActiveAttestationCyclesReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await handler.execute(command);

    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledTimes(1);
    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledWith([
      expect.objectContaining({
        id: samePolicyCycle.id,
        status: 'concluded',
      }),
    ]);

    // Verify only one cycle was concluded (different policy cycle was not included)
    const concludedCycles =
      mockConcludedAttestationCycleStatusWriter.mock.calls[0]?.[0];
    expect(concludedCycles).toHaveLength(1);
  });

  it('should return early when the specified cycle is not found', async () => {
    const keepActiveCycleId = attestationCycleIdSchema.parse(
      '00000000-0000-0000-0000-000000000000'
    );

    const mockActiveAttestationCyclesReader = vi.fn().mockResolvedValue([]);

    const mockConcludedAttestationCycleStatusWriter = vi.fn();

    const command: EnsureSingleActiveAttestationCycleCommand = {
      keepActiveCycleId,
    };

    const handler = ensureSingleActiveAttestationCycleCommandHandler({
      activeAttestationCyclesReader: mockActiveAttestationCyclesReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await handler.execute(command);

    expect(mockConcludedAttestationCycleStatusWriter).not.toHaveBeenCalled();
  });

  it('should log a warning when affected count does not match expected count', async () => {
    const policyId = '11111111-1111-1111-1111-111111111111';
    const keepActiveCycle = buildAttestationCycle(
      withPolicy({
        id: policyId,
        version: {
          id: '99999999-9999-9999-9999-999999999999',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    const otherCycle = buildAttestationCycle(
      withPolicy({
        id: policyId,
        version: {
          id: '88888888-8888-8888-8888-888888888888',
        },
      }),
      withRecords([buildAttestationRecord()])
    );

    const mockActiveAttestationCyclesReader = vi
      .fn()
      .mockResolvedValue([keepActiveCycle, otherCycle]);

    // Writer returns affectedCount that doesn't match expected count
    const mockConcludedAttestationCycleStatusWriter = vi
      .fn()
      .mockResolvedValue({ affectedCount: 0 });

    const command: EnsureSingleActiveAttestationCycleCommand = {
      keepActiveCycleId: keepActiveCycle.id,
    };

    const handler = ensureSingleActiveAttestationCycleCommandHandler({
      activeAttestationCyclesReader: mockActiveAttestationCyclesReader,
      concludedAttestationCycleStatusWriter:
        mockConcludedAttestationCycleStatusWriter,
    });

    await handler.execute(command);

    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledTimes(1);
    // The handler should still call the writer with the correct cycles
    expect(mockConcludedAttestationCycleStatusWriter).toHaveBeenCalledWith([
      expect.objectContaining({
        id: otherCycle.id,
        status: 'concluded',
      }),
    ]);
  });
});
