import type { AttestationCyclePartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  buildAttestationCycle,
  buildDocumentFile,
  withDocument,
  withInitialValues,
  withRecords,
} from 'test/attestation-cycle-builder';
import { vi } from 'vitest';

import type { AttestationRegisterCycleFields } from '../types';
import { mapCyclesData } from './useLabelledFields';
const mockDate = new Date(Date.UTC(2021, 0, 3, 0, 0, 0));

beforeEach(() => {
  vi.setSystemTime(mockDate);
});

describe('useLabelledFields', () => {
  it('should map a concluded cycle correctly', () => {
    const documentVersion = buildDocumentFile({
      Title: 'The manifesto',
      Version: '0.1',
    });

    const attestationCycles: AttestationCyclePartsFragment[] = [
      buildAttestationCycle(
        withInitialValues({
          Status: 'concluded',
          CreatedAtTimestamp: '2025-09-11T15:04:07.691505+00:00',
        }),
        withDocument(documentVersion),
        withRecords([
          {
            attestationRecordStatus: { Status: 'attested' },
            UserId: 'user-1',
            AttestationStatus: 'attested',
          },
          {
            attestationRecordStatus: { Status: 'attested' },
            UserId: 'user-2',
            AttestationStatus: 'attested',
          },
        ])
      ),
    ];

    const expected: Omit<
      AttestationRegisterCycleFields,
      'CycleStatusLabelled'
    >[] = [
      {
        Document: 'The manifesto',
        Version: '0.1',
        AttestationProgress: 100,
        CycleStartDate: '2025-09-11T15:04:07.691505+00:00',
        CycleStatus: 'concluded',
        DocumentId: documentVersion.parent.Id,
        FileId: documentVersion.Id,
      },
    ];

    const actual = mapCyclesData(attestationCycles);

    expect(actual).toEqual(expected);
  });

  it('should set the status to expired when the attestation cycle is active, the expiresAt is in the past', () => {
    const documentVersion = buildDocumentFile({
      Title: 'The manifesto',
      Version: '0.3',
    });

    const attestationCycles: AttestationCyclePartsFragment[] = [
      buildAttestationCycle(
        withInitialValues({
          Status: 'active',
          CreatedAtTimestamp: '2025-09-11T15:04:07.691505+00:00',
        }),
        withDocument(documentVersion),
        withRecords([
          {
            AttestationStatus: 'attested',
            attestationRecordStatus: { Status: 'attested' },
            ExpiresAt: '2000-01-01T00:00:00.000+00:00',
            UserId: 'user-1',
          },
          {
            AttestationStatus: 'pending',
            attestationRecordStatus: { Status: 'overdue' },
            ExpiresAt: '2000-01-01T00:00:00.000+00:00',
            UserId: 'user-2',
          },
        ])
      ),
    ];

    const expected: Omit<
      AttestationRegisterCycleFields,
      'CycleStatusLabelled'
    >[] = [
      {
        Document: 'The manifesto',
        Version: '0.3',
        AttestationProgress: 50,
        CycleStartDate: '2025-09-11T15:04:07.691505+00:00',
        CycleStatus: 'overdue',
        DocumentId: documentVersion.parent.Id,
        FileId: documentVersion.Id,
      },
    ];

    const actual = mapCyclesData(attestationCycles);

    expect(actual).toEqual(expected);
  });

  it('should ignore NotRequired records when calculating progress calculation', () => {
    const documentVersion = buildDocumentFile({
      Title: 'The manifesto',
      Version: '0.3',
    });

    const attestationCycles: AttestationCyclePartsFragment[] = [
      buildAttestationCycle(
        withInitialValues({
          Status: 'active',
          CreatedAtTimestamp: '2025-09-11T15:04:07.691505+00:00',
        }),
        withDocument(documentVersion),
        withRecords([
          {
            AttestationStatus: 'attested',
            attestationRecordStatus: { Status: 'attested' },
            ExpiresAt: '2000-01-01T00:00:00.000+00:00',
            UserId: 'user-1',
          },
          {
            AttestationStatus: 'not_required',
            attestationRecordStatus: { Status: 'not_required' },
            ExpiresAt: '2000-01-01T00:00:00.000+00:00',
            UserId: 'user-2',
          },
          {
            AttestationStatus: 'pending',
            attestationRecordStatus: { Status: 'pending' },
            ExpiresAt: '2000-01-01T00:00:00.000+00:00',
            UserId: 'user-3',
          },
          {
            AttestationStatus: 'pending',
            attestationRecordStatus: { Status: 'pending' },
            ExpiresAt: '2000-01-01T00:00:00.000+00:00',
            UserId: 'user-4',
          },
        ])
      ),
    ];
    const actual = mapCyclesData(attestationCycles);

    expect(actual?.[0].AttestationProgress).toEqual(33);
  });
});
