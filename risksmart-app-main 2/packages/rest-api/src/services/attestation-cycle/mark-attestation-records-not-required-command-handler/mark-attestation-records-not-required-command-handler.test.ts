import {
  buildAttestationRecord,
  withAttestedState,
  withNotRequiredState,
} from 'test/attestation-cycle/attestation-record-builder';

import { attestationRecordIdSchema } from '../attestation-record';
import {
  type MarkAttestationRecordsNotRequiredCommand,
  markAttestationRecordsNotRequiredCommandHandler,
} from './mark-attestation-records-not-required-command-handler';

describe('MarkAttestationRecordsNotRequiredCommandHandler', () => {
  it('should mark pending attestation records as not_required and set active to false', async () => {
    const pendingRecord1 = buildAttestationRecord();
    const pendingRecord2 = buildAttestationRecord();

    const mockAttestationRecordReader = vi
      .fn()
      .mockResolvedValue([pendingRecord1, pendingRecord2]);

    const mockAttestationRecordStatusWriter = vi.fn().mockResolvedValue({
      affectedCount: 2,
    });

    const handler = markAttestationRecordsNotRequiredCommandHandler({
      attestationRecordReader: mockAttestationRecordReader,
      attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
    });

    const command: MarkAttestationRecordsNotRequiredCommand = {
      attestationRecordIds: [pendingRecord1.id, pendingRecord2.id],
    };

    await handler.execute(command);

    expect(mockAttestationRecordReader).toHaveBeenCalledExactlyOnceWith([
      pendingRecord1.id,
      pendingRecord2.id,
    ]);

    expect(mockAttestationRecordStatusWriter).toHaveBeenCalledExactlyOnceWith([
      { ...pendingRecord1, status: 'not_required', active: false },
      { ...pendingRecord2, status: 'not_required', active: false },
    ]);
  });

  it('should mark attested attestation records as inactive without changing status', async () => {
    const attestedRecord = buildAttestationRecord(withAttestedState());

    const mockAttestationRecordReader = vi
      .fn()
      .mockResolvedValue([attestedRecord]);

    const mockAttestationRecordStatusWriter = vi.fn().mockResolvedValue({
      affectedCount: 1,
    });

    const handler = markAttestationRecordsNotRequiredCommandHandler({
      attestationRecordReader: mockAttestationRecordReader,
      attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
    });

    const command: MarkAttestationRecordsNotRequiredCommand = {
      attestationRecordIds: [attestedRecord.id],
    };

    await handler.execute(command);

    expect(mockAttestationRecordStatusWriter).toHaveBeenCalledExactlyOnceWith([
      { ...attestedRecord, active: false },
    ]);
  });

  it('should handle mixed attestation record statuses', async () => {
    const pendingRecord = buildAttestationRecord();
    const attestedRecord = buildAttestationRecord(withAttestedState());
    const notRequiredRecord = buildAttestationRecord(withNotRequiredState());

    const mockAttestationRecordReader = vi
      .fn()
      .mockResolvedValue([pendingRecord, attestedRecord, notRequiredRecord]);

    const mockAttestationRecordStatusWriter = vi.fn().mockResolvedValue({
      affectedCount: 3,
    });

    const handler = markAttestationRecordsNotRequiredCommandHandler({
      attestationRecordReader: mockAttestationRecordReader,
      attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
    });

    const command: MarkAttestationRecordsNotRequiredCommand = {
      attestationRecordIds: [
        pendingRecord.id,
        attestedRecord.id,
        notRequiredRecord.id,
      ],
    };

    await handler.execute(command);

    expect(mockAttestationRecordStatusWriter).toHaveBeenCalledExactlyOnceWith([
      { ...pendingRecord, status: 'not_required', active: false },
      { ...attestedRecord, active: false },
      { ...notRequiredRecord, active: false },
    ]);
  });

  it('should throw an error if not all records were updated', async () => {
    const record1 = buildAttestationRecord();
    const record2 = buildAttestationRecord();
    const record3 = buildAttestationRecord();

    const mockAttestationRecordReader = vi
      .fn()
      .mockResolvedValue([record1, record2, record3]);

    // Only 2 out of 3 records were updated
    const mockAttestationRecordStatusWriter = vi.fn().mockResolvedValue({
      affectedCount: 2,
    });

    const handler = markAttestationRecordsNotRequiredCommandHandler({
      attestationRecordReader: mockAttestationRecordReader,
      attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
    });

    const command: MarkAttestationRecordsNotRequiredCommand = {
      attestationRecordIds: [record1.id, record2.id, record3.id],
    };

    await expect(handler.execute(command)).rejects.toThrow(
      'Failed to mark all attestation records as not required'
    );
  });

  it('should throw an error if reader returns fewer records than requested', async () => {
    const record1 = buildAttestationRecord();
    const record2 = buildAttestationRecord();
    const nonExistentId = crypto.randomUUID();

    // Reader only returns 1 record even though 3 were requested
    const mockAttestationRecordReader = vi.fn().mockResolvedValue([record1]);

    const mockAttestationRecordStatusWriter = vi.fn().mockResolvedValue({
      affectedCount: 1,
    });

    const handler = markAttestationRecordsNotRequiredCommandHandler({
      attestationRecordReader: mockAttestationRecordReader,
      attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
    });

    const command: MarkAttestationRecordsNotRequiredCommand = {
      attestationRecordIds: [
        record1.id,
        record2.id,
        attestationRecordIdSchema.parse(nonExistentId),
      ],
    };

    await expect(handler.execute(command)).rejects.toThrow(
      'Failed to mark all attestation records as not required'
    );

    // Writer should not be called with whatever records were found
    expect(mockAttestationRecordStatusWriter).not.toHaveBeenCalled();
  });

  it('should handle empty attestation record list', async () => {
    const mockAttestationRecordReader = vi.fn().mockResolvedValue([]);

    const mockAttestationRecordStatusWriter = vi.fn().mockResolvedValue({
      affectedCount: 0,
    });

    const handler = markAttestationRecordsNotRequiredCommandHandler({
      attestationRecordReader: mockAttestationRecordReader,
      attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
    });

    const command: MarkAttestationRecordsNotRequiredCommand = {
      attestationRecordIds: [],
    };

    await handler.execute(command);

    expect(mockAttestationRecordReader).toHaveBeenCalledExactlyOnceWith([]);
    expect(mockAttestationRecordStatusWriter).toHaveBeenCalledExactlyOnceWith(
      []
    );
  });

  it('should handle a single attestation record', async () => {
    const singleRecord = buildAttestationRecord();

    const mockAttestationRecordReader = vi
      .fn()
      .mockResolvedValue([singleRecord]);

    const mockAttestationRecordStatusWriter = vi.fn().mockResolvedValue({
      affectedCount: 1,
    });

    const handler = markAttestationRecordsNotRequiredCommandHandler({
      attestationRecordReader: mockAttestationRecordReader,
      attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
    });

    const command: MarkAttestationRecordsNotRequiredCommand = {
      attestationRecordIds: [singleRecord.id],
    };

    await handler.execute(command);

    expect(mockAttestationRecordStatusWriter).toHaveBeenCalledExactlyOnceWith([
      { ...singleRecord, status: 'not_required', active: false },
    ]);
  });
});
