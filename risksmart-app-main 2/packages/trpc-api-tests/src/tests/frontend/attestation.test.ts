import { AttestationRecordStatus } from '@risksmart-app/domain/src/types/consts/attestation-record-status';
import {
  buildAttestationConfig,
  buildAttestationRecord,
  buildDocument,
  insertAttestationConfig,
  insertAttestationRecord,
  insertDocument,
} from '@risksmart-app/test-data';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('Attestation', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('status query should return correct data with config', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create a parent document (this will be the parent node for attestation)
    const {
      Meta: docMeta,
      OrgKey: docOrgKey,
      ...documentProps
    } = buildDocument(orgKey, userId);
    await insertDocument({
      Meta: docMeta,
      OrgKey: docOrgKey,
      ...documentProps,
    });

    // Create an attestation config for the document
    const attestationConfig = buildAttestationConfig({
      orgkey: orgKey,
      userId,
      parentId: documentProps.Id!,
      overrides: {
        PromptText: 'Please confirm you have reviewed this policy document',
      },
    });
    await insertAttestationConfig(attestationConfig);

    // Create an attestation record for the document and user
    const { OrgKey: recordOrgKey, ...attestationRecordProps } =
      buildAttestationRecord({
        orgkey: orgKey,
        userId,
        nodeId: documentProps.Id!,
        configId: attestationConfig.ParentId,
        overrides: {
          AttestationStatus: AttestationRecordStatus.Pending,
        },
      });
    await insertAttestationRecord({
      OrgKey: recordOrgKey,
      ...attestationRecordProps,
    });

    // Call the attestation.status endpoint
    const response = await trpcClient.frontend.attestation.status.query({
      parentId: documentProps.Id!,
      userId,
    });

    // Verify the response
    expect(response).toBeDefined();
    expect(response.length).toBe(1);
    expect(response[0]?.Id).toEqual(attestationRecordProps.Id);
    expect(response[0]?.AttestationStatus).toEqual(
      AttestationRecordStatus.Pending
    );
    expect(response[0]?.config).toBeDefined();
    expect(response[0]?.config?.PromptText).toEqual(
      'Please confirm you have reviewed this policy document'
    );
  });

  it('status query should return empty array for non-existent parent', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { userId, trpcClient } = ctx;

    const response = await trpcClient.frontend.attestation.status.query({
      parentId: '00000000-0000-0000-0000-000000000000',
      userId,
    });

    expect(response).toEqual([]);
  });

  it('status query should return latest record when multiple exist', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create a parent document
    const { OrgKey: docOrgKey, ...documentProps } = buildDocument(
      orgKey,
      userId
    );
    await insertDocument({
      OrgKey: docOrgKey,
      ...documentProps,
    });

    // Create an attestation config
    const attestationConfig = buildAttestationConfig({
      orgkey: orgKey,
      userId,
      parentId: documentProps.Id!,
    });
    await insertAttestationConfig(attestationConfig);

    // Create older attestation record
    const { OrgKey: oldRecordOrgKey, ...oldRecordProps } =
      buildAttestationRecord({
        orgkey: orgKey,
        userId,
        nodeId: documentProps.Id!,
        configId: attestationConfig.ParentId,
        overrides: {
          CreatedAtTimestamp: '2024-01-01T10:00:00Z',
          AttestationStatus: AttestationRecordStatus.Attested,
        },
      });
    await insertAttestationRecord({
      OrgKey: oldRecordOrgKey,
      ...oldRecordProps,
    });

    // Create newer attestation record
    const { OrgKey: newRecordOrgKey, ...newRecordProps } =
      buildAttestationRecord({
        orgkey: orgKey,
        userId,
        nodeId: documentProps.Id!,
        configId: attestationConfig.ParentId,
        overrides: {
          CreatedAtTimestamp: '2024-01-15T10:00:00Z',
          AttestationStatus: AttestationRecordStatus.Pending,
        },
      });
    await insertAttestationRecord({
      OrgKey: newRecordOrgKey,
      ...newRecordProps,
    });

    // Call the attestation.status endpoint
    const response = await trpcClient.frontend.attestation.status.query({
      parentId: documentProps.Id!,
      userId,
    });

    // Should return the newer record
    expect(response).toBeDefined();
    expect(response.length).toBe(1);
    expect(response[0]?.Id).toEqual(newRecordProps.Id);
    expect(response[0]?.AttestationStatus).toEqual(
      AttestationRecordStatus.Pending
    );
  });

  it('status query should filter by userId correctly', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create a second user in the same organization
    const secondUserContext = await createTestContext();
    contexts.push(secondUserContext);
    const otherUserId = secondUserContext.userId;

    // Create a parent document
    const { OrgKey: docOrgKey, ...documentProps } = buildDocument(
      orgKey,
      userId
    );
    await insertDocument({
      OrgKey: docOrgKey,
      ...documentProps,
    });

    // Create an attestation config
    const attestationConfig = buildAttestationConfig({
      orgkey: orgKey,
      userId,
      parentId: documentProps.Id!,
    });
    await insertAttestationConfig(attestationConfig);

    // Create attestation record for the test user
    const { OrgKey: recordOrgKey, ...attestationRecordProps } =
      buildAttestationRecord({
        orgkey: orgKey,
        userId,
        nodeId: documentProps.Id!,
        configId: attestationConfig.ParentId,
      });
    await insertAttestationRecord({
      OrgKey: recordOrgKey,
      ...attestationRecordProps,
    });

    // Create attestation record for another user
    const { OrgKey: otherRecordOrgKey, ...otherRecordProps } =
      buildAttestationRecord({
        orgkey: orgKey,
        userId: otherUserId,
        nodeId: documentProps.Id!,
        configId: attestationConfig.ParentId,
      });
    await insertAttestationRecord({
      OrgKey: otherRecordOrgKey,
      ...otherRecordProps,
    });

    // Query for the test user's record
    const response = await trpcClient.frontend.attestation.status.query({
      parentId: documentProps.Id!,
      userId,
    });

    // Should return only the test user's record
    expect(response).toBeDefined();
    expect(response.length).toBe(1);
    expect(response[0]?.Id).toEqual(attestationRecordProps.Id);
    expect(response[0]?.UserId).toEqual(userId);
  });

  it('status query should return record without config when ConfigId is null', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create a parent document
    const { OrgKey: docOrgKey, ...documentProps } = buildDocument(
      orgKey,
      userId
    );
    await insertDocument({
      OrgKey: docOrgKey,
      ...documentProps,
    });

    // Create an attestation record WITHOUT a config
    const { OrgKey: recordOrgKey, ...attestationRecordProps } =
      buildAttestationRecord({
        orgkey: orgKey,
        userId,
        nodeId: documentProps.Id!,
        configId: undefined, // No config
      });
    await insertAttestationRecord({
      OrgKey: recordOrgKey,
      ...attestationRecordProps,
    });

    // Call the attestation.status endpoint
    const response = await trpcClient.frontend.attestation.status.query({
      parentId: documentProps.Id!,
      userId,
    });

    // Verify the response has no config
    expect(response).toBeDefined();
    expect(response.length).toBe(1);
    expect(response[0]?.Id).toEqual(attestationRecordProps.Id);
    expect(response[0]?.config).toBeNull();
  });
});
