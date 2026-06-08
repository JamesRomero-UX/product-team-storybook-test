import {
  buildAttestationCycle,
  withConcludedNaturallyState,
  withRecords,
} from 'test/attestation-cycle/attestation-cycle-builder';
import {
  buildAttestationRecord,
  withAttestedState,
} from 'test/attestation-cycle/attestation-record-builder';

import {
  type ArchiveAttestationRecordsCommand,
  archiveAttestationRecordsCommandHandler,
} from './archive-attestation-records-command-handler';

describe('archive attestation records command handler', () => {
  it('should update not attested records with a status of not_attested and set active to false', async () => {
    const pendingAttestationRecord = buildAttestationRecord();
    const attestationCycle = buildAttestationCycle(
      withConcludedNaturallyState(),
      withRecords([pendingAttestationRecord])
    );

    const mockAttestationRecordWriter = vi.fn().mockResolvedValue({
      affectedCount: 0,
    });

    const mockAttestationCycleByIdReader = vi
      .fn()
      .mockResolvedValue(attestationCycle);

    const handler = archiveAttestationRecordsCommandHandler({
      attestationRecordWriter: mockAttestationRecordWriter,
      attestationCycleByIdReader: mockAttestationCycleByIdReader,
    });

    const command: ArchiveAttestationRecordsCommand = {
      attestationCycleId: attestationCycle.id,
    };

    await handler.execute(command);

    expect(mockAttestationRecordWriter).toHaveBeenCalledExactlyOnceWith(
      [pendingAttestationRecord.id],
      {
        active: false,
        status: 'not_attested',
      }
    );
  });

  it('should update attested records and set active to false', async () => {
    const attestedAttestationRecord =
      buildAttestationRecord(withAttestedState());
    const attestationCycle = buildAttestationCycle(
      withConcludedNaturallyState(),
      withRecords([attestedAttestationRecord])
    );

    const mockAttestationRecordWriter = vi.fn().mockResolvedValue({
      affectedCount: 0,
    });
    const mockAttestationCycleByIdReader = vi
      .fn()
      .mockResolvedValue(attestationCycle);

    const handler = archiveAttestationRecordsCommandHandler({
      attestationRecordWriter: mockAttestationRecordWriter,
      attestationCycleByIdReader: mockAttestationCycleByIdReader,
    });

    const command: ArchiveAttestationRecordsCommand = {
      attestationCycleId: attestationCycle.id,
    };

    await handler.execute(command);

    expect(mockAttestationRecordWriter).toHaveBeenCalledExactlyOnceWith(
      [attestedAttestationRecord.id],
      {
        active: false,
      }
    );
  });

  it('should not archive records if the attestation cycle is not concluded', async () => {
    const activeAttestationCycle = buildAttestationCycle();

    const mockAttestationRecordWriter = vi.fn().mockResolvedValue({
      affectedCount: 0,
    });
    const mockAttestationCycleByIdReader = vi
      .fn()
      .mockResolvedValue(activeAttestationCycle);

    const handler = archiveAttestationRecordsCommandHandler({
      attestationRecordWriter: mockAttestationRecordWriter,
      attestationCycleByIdReader: mockAttestationCycleByIdReader,
    });

    const command: ArchiveAttestationRecordsCommand = {
      attestationCycleId: activeAttestationCycle.id,
    };

    await handler.execute(command);

    expect(mockAttestationRecordWriter).not.toHaveBeenCalled();
  });
});
