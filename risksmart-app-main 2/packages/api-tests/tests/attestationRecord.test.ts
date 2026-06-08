import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  attestRecord,
  getAttestationRecords,
  insertAttestationRecords,
} from '../clients/attestationsRecordClient';
import { insertDocument } from '../clients/documentClient';
import { buildAttestationRecord } from '../data/attestation';
import { buildDocument } from '../data/document';
import { AttestationRecordStatusEnum } from '../generated/graphql';
import {
  anotherUser,
  internalAuditUser1,
  publicUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('attestationRecords', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      riskManagerUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can see all attestation records from every user',
      async (user) => {
        const document = buildDocument();
        await insertDocument(document);

        await insertAttestationRecords([
          buildAttestationRecord({
            NodeId: document.Id,
            UserId: anotherUser.Id,
          }),
          buildAttestationRecord({
            NodeId: document.Id,
            UserId: user.Id,
          }),
        ]);

        const records = await getAttestationRecords({ user });

        expect(records.length).toBe(2);
      }
    );

    it.each([standardUser1, publicUser1])(
      '$RoleKey can only see their own attestation records',
      async (user) => {
        const document = buildDocument();
        await insertDocument(document);

        await insertAttestationRecords([
          buildAttestationRecord({
            NodeId: document.Id,
            UserId: anotherUser.Id,
          }),
          buildAttestationRecord({
            NodeId: document.Id,
            UserId: user.Id,
          }),
        ]);

        const records = await getAttestationRecords({ user });

        expect(records.length).toBe(1);
        expect(records[0].UserId).toBe(user.Id);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      readOnlyUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can return policy attestation records for dashboard widgets',
      async (user) => {
        const document = buildDocument();
        await insertDocument(document);

        await insertAttestationRecords([
          buildAttestationRecord({
            NodeId: document.Id,
            UserId: user.Id,
          }),
        ]);

        const records = await apiClient.getPolicyAttestationRecords(
          {
            where: {},
          },
          { user }
        );

        expect(records.attestation_record.length).toBe(1);
        expect(records.attestation_record[0].UserId).toBe(user.Id);
      }
    );
  });

  describe('attestRecord', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      publicUser1,
    ])('$RoleKey can attest their own attestation records', async (user) => {
      const document = buildDocument();
      await insertDocument(document);

      await insertAttestationRecords([
        buildAttestationRecord({
          NodeId: document.Id,
          UserId: anotherUser.Id,
        }),
        buildAttestationRecord({
          NodeId: document.Id,
          UserId: user.Id,
        }),
      ]);

      // verify the record is unattested
      const beforeRecords = await getAttestationRecords({ user });
      const unattestedRecord = beforeRecords.find(
        (r) => r.NodeId === document.Id && r.UserId === user.Id
      );

      if (!unattestedRecord) {
        throw new Error('Attestation record not found for the user');
      }

      expect(unattestedRecord?.AttestationStatus).toBe(
        AttestationRecordStatusEnum.Pending
      );

      await attestRecord(unattestedRecord.Id, { user });

      // check if the record is attested
      const records = await getAttestationRecords({ user });
      const attestedRecord = records.find(
        (r) => r.NodeId === document.Id && r.UserId === user.Id
      );
      expect(attestedRecord?.AttestationStatus).toBe(
        AttestationRecordStatusEnum.Attested
      );
    });

    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      publicUser1,
    ])(
      "$RoleKey cannot attest other people's attestation records",
      async (user) => {
        const document = buildDocument();
        await insertDocument(document);

        await insertAttestationRecords([
          buildAttestationRecord({
            NodeId: document.Id,
            UserId: anotherUser.Id,
          }),
          buildAttestationRecord({
            NodeId: document.Id,
            UserId: user.Id,
          }),
        ]);

        // verify the records that aren't the users' are unattested
        const beforeRecords = await getAttestationRecords();
        const unattestedRecord = beforeRecords.find(
          (r) => r.NodeId === document.Id && r.UserId !== user.Id
        );

        if (!unattestedRecord) {
          throw new Error('Attestation record not found for the other user');
        }

        expect(unattestedRecord.AttestationStatus).toBe(
          AttestationRecordStatusEnum.Pending
        );

        await expect(
          attestRecord(unattestedRecord.Id, { user })
        ).rejects.toThrow();

        // check if the record is still unattested
        const records = await getAttestationRecords();
        const attestedRecord = records.find(
          (r) => r.NodeId === document.Id && r.UserId !== user.Id
        );
        expect(attestedRecord?.AttestationStatus).not.toBe(
          AttestationRecordStatusEnum.Attested
        );
      }
    );
  });
});
