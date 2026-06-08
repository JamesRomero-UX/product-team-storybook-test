import { VersionStatus } from '@risksmart-app/domain/src/types/consts/version-status';
import {
  buildDocument,
  buildDocumentFile,
  insertDocument,
  insertDocumentFile,
} from '@risksmart-app/test-data';
import { afterAll, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('Document File', () => {
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('documentFileById query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create parent document first
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

    // Create document file
    const { Meta, OrgKey, ...insertedDocumentFileProps } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
    });
    await insertDocumentFile({ Meta, OrgKey, ...insertedDocumentFileProps });

    const response =
      await trpcClient.frontend.documentFile.documentFileById.query({
        id: insertedDocumentFileProps.Id!,
      });

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        Id: insertedDocumentFileProps.Id,
        Version: insertedDocumentFileProps.Version,
        Status: insertedDocumentFileProps.Status,
        Type: insertedDocumentFileProps.Type,
        Content: insertedDocumentFileProps.Content,
        ParentDocumentId: documentProps.Id,
        changeRequests: [],
      })
    );
    // Verify parent document relationship
    expect(response[0]?.parent).toEqual(
      expect.objectContaining({
        Id: documentProps.Id,
        Title: documentProps.Title,
      })
    );
  });

  it('documentFileById query should return empty array for non-existent id', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response =
      await trpcClient.frontend.documentFile.documentFileById.query({
        id: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.length).toEqual(0);
  });

  it('documentFilesByDocumentId query should return correct data', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create parent document first
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

    // Create document file
    const { Meta, OrgKey, ...insertedDocumentFileProps } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
    });

    await insertDocumentFile({ Meta, OrgKey, ...insertedDocumentFileProps });

    // Create a second document file for the same document
    const {
      Meta: Meta2,
      OrgKey: OrgKey2,
      ...insertedDocumentFileProps2
    } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
    });

    await insertDocumentFile({
      Meta: Meta2,
      OrgKey: OrgKey2,
      ...insertedDocumentFileProps2,
    });

    const response =
      await trpcClient.frontend.documentFile.documentFilesByDocumentId.query({
        documentId: documentProps.Id!,
      });

    expect(response.length).toEqual(2);
    expect(response).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Id: insertedDocumentFileProps.Id,
          Version: insertedDocumentFileProps.Version,
          Status: insertedDocumentFileProps.Status,
          Type: insertedDocumentFileProps.Type,
          Content: insertedDocumentFileProps.Content,
          ParentDocumentId: documentProps.Id,
          changeRequests: [],
        }),
        expect.objectContaining({
          Id: insertedDocumentFileProps2.Id,
          Version: insertedDocumentFileProps2.Version,
          Status: insertedDocumentFileProps2.Status,
          Type: insertedDocumentFileProps2.Type,
          Content: insertedDocumentFileProps2.Content,
          ParentDocumentId: documentProps.Id,
          changeRequests: [],
        }),
      ])
    );
  });

  it('documentFilesByDocumentId query should return empty array for non-existent document id', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response =
      await trpcClient.frontend.documentFile.documentFilesByDocumentId.query({
        documentId: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.length).toEqual(0);
  });

  it('publicDocumentFiles query should return published document files', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create parent document first
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

    // Create published document file
    const { Meta, OrgKey, ...insertedDocumentFileProps } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        Status: VersionStatus.Published,
      },
    });
    await insertDocumentFile({ Meta, OrgKey, ...insertedDocumentFileProps });

    const response =
      await trpcClient.frontend.documentFile.publicDocumentFiles.query({
        userId,
      });

    expect(response.length).toBeGreaterThanOrEqual(1);
    const publishedFile = response.find(
      (file) => file.Id === insertedDocumentFileProps.Id
    );
    expect(publishedFile).toBeDefined();
    expect(publishedFile).toEqual(
      expect.objectContaining({
        Id: insertedDocumentFileProps.Id,
        Version: insertedDocumentFileProps.Version,
        Status: VersionStatus.Published,
        Type: insertedDocumentFileProps.Type,
        Content: insertedDocumentFileProps.Content,
        ParentDocumentId: documentProps.Id,
      })
    );
    // Verify parent document relationship
    expect(publishedFile?.parent).toEqual(
      expect.objectContaining({
        Id: documentProps.Id,
        Title: documentProps.Title,
      })
    );
  });

  it('publicDocumentFiles query should return empty array when no published files exist', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create parent document first
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

    // Create draft document file (not published)
    const { Meta, OrgKey, ...insertedDocumentFileProps } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        Status: VersionStatus.Draft,
      },
    });
    await insertDocumentFile({ Meta, OrgKey, ...insertedDocumentFileProps });

    const response =
      await trpcClient.frontend.documentFile.publicDocumentFiles.query({
        userId,
      });

    // Should not include the draft document file
    const draftFile = response.find(
      (file) => file.Id === insertedDocumentFileProps.Id
    );
    expect(draftFile).toBeUndefined();
  });

  it('latestDocumentFile query should return latest document file by parentDocumentId', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create parent document first
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

    // Create older document file
    const {
      Meta: meta1,
      OrgKey: orgKey1,
      ...olderFileProps
    } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        CreatedAtTimestamp: '2024-01-01T10:00:00Z',
        Status: VersionStatus.Published,
      },
    });
    await insertDocumentFile({
      Meta: meta1,
      OrgKey: orgKey1,
      ...olderFileProps,
    });

    // Create newer document file
    const {
      Meta: meta2,
      OrgKey: orgKey2,
      ...newerFileProps
    } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        CreatedAtTimestamp: '2024-01-15T10:00:00Z',
        Status: VersionStatus.Published,
      },
    });
    await insertDocumentFile({
      Meta: meta2,
      OrgKey: orgKey2,
      ...newerFileProps,
    });

    const response =
      await trpcClient.frontend.documentFile.latestDocumentFile.query({
        parentDocumentId: documentProps.Id!,
      });

    // Should return the newer file
    expect(response.length).toEqual(1);
    expect(response[0]?.Id).toEqual(newerFileProps.Id);
    expect(response[0]?.Version).toEqual(newerFileProps.Version);
    expect(response[0]?.Status).toEqual(VersionStatus.Published);
    expect(response[0]?.Type).toEqual(newerFileProps.Type);
    expect(response[0]?.Content).toEqual(newerFileProps.Content);

    // Verify parent document relationship
    expect(response[0]?.parent).toEqual(
      expect.objectContaining({
        Title: documentProps.Title,
      })
    );
  });

  it('latestDocumentFile query should filter by fileId', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create parent document first
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

    // Create first document file
    const {
      Meta: meta1,
      OrgKey: orgKey1,
      ...file1Props
    } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        Status: VersionStatus.Published,
      },
    });
    await insertDocumentFile({ Meta: meta1, OrgKey: orgKey1, ...file1Props });

    // Create second document file
    const {
      Meta: meta2,
      OrgKey: orgKey2,
      ...file2Props
    } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        Status: VersionStatus.Published,
      },
    });
    await insertDocumentFile({ Meta: meta2, OrgKey: orgKey2, ...file2Props });

    // Query with specific fileId
    const response =
      await trpcClient.frontend.documentFile.latestDocumentFile.query({
        parentDocumentId: documentProps.Id!,
        fileId: file1Props.Id!,
      });

    // Should return the specific file
    expect(response.length).toEqual(1);
    expect(response[0]?.Id).toEqual(file1Props.Id);
    expect(response[0]?.Version).toEqual(file1Props.Version);
    expect(response[0]?.Status).toEqual(VersionStatus.Published);
  });

  it('latestDocumentFile query should filter by status', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { orgKey, userId, trpcClient } = ctx;

    // Create parent document first
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

    // Create draft document file
    const {
      Meta: meta1,
      OrgKey: orgKey1,
      ...draftFileProps
    } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        Status: VersionStatus.Draft,
        CreatedAtTimestamp: '2024-01-10T10:00:00Z',
      },
    });
    await insertDocumentFile({
      Meta: meta1,
      OrgKey: orgKey1,
      ...draftFileProps,
    });

    // Create published document file (older)
    const {
      Meta: meta2,
      OrgKey: orgKey2,
      ...publishedFileProps
    } = buildDocumentFile({
      orgkey: orgKey,
      userId,
      parentDocumentId: documentProps.Id!,
      overrides: {
        Status: VersionStatus.Published,
        CreatedAtTimestamp: '2024-01-05T10:00:00Z',
      },
    });
    await insertDocumentFile({
      Meta: meta2,
      OrgKey: orgKey2,
      ...publishedFileProps,
    });

    // Query with Published status filter
    const response =
      await trpcClient.frontend.documentFile.latestDocumentFile.query({
        parentDocumentId: documentProps.Id!,
        status: VersionStatus.Published,
      });

    // Should return only the published file, not the newer draft
    expect(response.length).toEqual(1);
    expect(response[0]?.Id).toEqual(publishedFileProps.Id);
    expect(response[0]?.Status).toEqual(VersionStatus.Published);
  });

  it('latestDocumentFile query should return empty array for non-existent parentDocumentId', async () => {
    const ctx = await createTestContext();
    contexts.push(ctx);
    const { trpcClient } = ctx;

    const response =
      await trpcClient.frontend.documentFile.latestDocumentFile.query({
        parentDocumentId: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.length).toEqual(0);
  });
});
