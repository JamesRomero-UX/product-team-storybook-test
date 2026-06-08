import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertDocument } from '../clients/documentClient';
import { buildAttestationConfig } from '../data/attestation';
import { buildDocument } from '../data/document';
import { buildOwner } from '../data/owner';
import {
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

describe('attestationConfig', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, success: true },
      { ...standardUser1, success: false },
      { ...readOnlyUser1, success: true },
      { ...standardEnhancedUser1, success: true },
      { ...internalAuditUser1, success: true },
      { ...publicUser1, success: false },
    ])(
      '$RoleKey to see attestation configs where they are not the Owner or contributor of the parent, expected result=$success',
      async ({ success, ...user }) => {
        const document = buildDocument();
        await insertDocument(document);
        await apiClient.insertAttestationConfig({
          Object: buildAttestationConfig({
            ParentId: document.Id,
          }),
        });

        try {
          const attestation = await apiClient.getAttestationConfigByParentId(
            { ParentId: document.Id! },
            {
              user,
            }
          );

          if (success) {
            expect(attestation).toBeDefined();
          } else {
            expect(attestation).toBeNull();
          }
        } catch {
          expect(success).toBeFalsy();
        }
      }
    );

    it.each([
      { ...riskManagerUser1, success: true },
      { ...standardUser1, success: true },
      { ...readOnlyUser1, success: true },
      { ...standardEnhancedUser1, success: true },
      { ...internalAuditUser1, success: true },
      { ...publicUser1, success: false },
    ])(
      '$RoleKey to see attestation configs where they are the Owner or contributor of the parent, expected result=$success',
      async ({ success, ...user }) => {
        const document = buildDocument({
          owners: { data: [buildOwner({ UserId: user.Id })] },
        });
        await insertDocument(document);
        await apiClient.insertAttestationConfig({
          Object: buildAttestationConfig({
            ParentId: document.Id,
          }),
        });

        try {
          const attestation = await apiClient.getAttestationConfigByParentId(
            { ParentId: document.Id! },
            {
              user,
            }
          );

          if (success) {
            expect(attestation).toBeDefined();
          } else {
            expect(attestation).toBeNull();
          }
        } catch {
          expect(success).toBeFalsy();
        }
      }
    );
  });

  describe('insert', () => {
    it.each([
      { ...riskManagerUser1, success: true },
      { ...standardUser1, success: true },
      { ...readOnlyUser1, success: false },
      { ...standardEnhancedUser1, success: true },
      { ...internalAuditUser1, success: true },
      { ...publicUser1, success: false },
    ])(
      '$RoleKey can insert attestationConfig where they are the Owner or contributor of the parent, expected result=$success',
      async ({ success, ...user }) => {
        const document = buildDocument({
          owners: { data: [buildOwner({ UserId: user.Id })] },
        });
        await insertDocument(document);
        const attestation = apiClient.insertAttestationConfig(
          {
            Object: {
              ParentId: document.Id,
              RequireGlobalAttestation: false,
              AttestationTimeLimit: '1 year',
            },
          },
          { user }
        );

        if (success) {
          await expect(attestation).resolves.toBeDefined();
        } else {
          await expect(attestation).rejects.toThrowError();
        }
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, success: true },
      { ...standardUser1, success: true },
      { ...readOnlyUser1, success: false },
      { ...standardEnhancedUser1, success: true },
      { ...internalAuditUser1, success: true },
      { ...publicUser1, success: false },
    ])(
      '$RoleKey can update attestationConfig where they are the Owner or contributor of the parent, expected result=$success',
      async ({ success, ...user }) => {
        const document = buildDocument({
          owners: { data: [buildOwner({ UserId: user.Id })] },
        });
        await insertDocument(document);
        const insertData = await apiClient.insertAttestationConfig({
          Object: buildAttestationConfig({
            ParentId: document.Id,
          }),
        });

        const updated = apiClient.updateAttestationConfig(
          {
            ParentId: insertData.insert_attestation_config_one!.ParentId,
            Data: { RequireGlobalAttestation: true },
          },
          { user }
        );

        if (success) {
          await expect(updated).resolves.toBeDefined();
        } else {
          await expect(updated).rejects.toThrowError();
        }
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, success: true },
      { ...standardUser1, success: true },
      { ...readOnlyUser1, success: false },
      { ...standardEnhancedUser1, success: true },
      { ...internalAuditUser1, success: true },
      { ...publicUser1, success: false },
    ])(
      '$RoleKey can delete attestationConfig where they are the Owner or contributor of the parent, expected result=$success',
      async ({ success, ...user }) => {
        const document = buildDocument({
          owners: { data: [buildOwner({ UserId: user.Id })] },
        });
        await insertDocument(document);
        const insertData = await apiClient.insertAttestationConfig({
          Object: buildAttestationConfig({
            ParentId: document.Id,
          }),
        });

        const attestation = apiClient.deleteAttestationConfig(
          {
            ParentId: insertData.insert_attestation_config_one!.ParentId,
          },
          { user }
        );

        if (success) {
          await expect(attestation).resolves.toBeDefined();
        } else {
          await expect(attestation).rejects.toThrowError();
        }
      }
    );
  });
});
