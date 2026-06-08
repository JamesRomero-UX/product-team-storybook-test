import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertApproval } from '../clients/approvalClient';
import { insertDocument } from '../clients/documentClient';
import {
  deleteDocumentFile,
  getDocumentFileById,
  getDocumentFiles,
  insertDocumentVersion,
  updateDocumentFile,
  updateDocumentVersion,
} from '../clients/documentFileClient';
import { buildApprovalWorkflow } from '../data/approval';
import { buildContributor } from '../data/contributor';
import { buildDocument } from '../data/document';
import { buildDocumentFile } from '../data/documentFile';
import {
  buildInsertDocumentVersion,
  buildUpdateDocumentVersion,
} from '../data/documentVersion';
import { buildOwner } from '../data/owner';
import { VersionStatusEnum } from '../generated/graphql';
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

describe('documentFiles', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords document files where they are not the Owner or contributor and the status if draft',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [
                buildDocumentFile({
                  Status: VersionStatusEnum.Draft,
                }),
              ],
            },
          })
        );

        const documentFiles = await getDocumentFiles({
          user,
        });
        expect(documentFiles.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords document files where they are not the Owner or contributor and the status if published',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [
                buildDocumentFile({
                  Status: VersionStatusEnum.Published,
                }),
              ],
            },
          })
        );

        const documentFiles = await getDocumentFiles({
          user,
        });
        expect(documentFiles.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords document files where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            documentFiles: {
              data: [buildDocumentFile({})],
            },
          })
        );

        const documentFiles = await getDocumentFiles({
          user,
        });
        expect(documentFiles.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords document files where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            documentFiles: {
              data: [buildDocumentFile({})],
            },
          })
        );

        const documentFiles = await getDocumentFiles({
          user,
        });
        expect(documentFiles.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: uncomment once we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 1 },{ ...ownerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should delete $expectedRecords document files where they are not the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const result = await deleteDocumentFile(
          { Id: documentFile.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_document_file?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: uncomment once we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 1 },{ ...ownerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey delete $expectedRecords document files where they are the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const result = await deleteDocumentFile(
          { Id: documentFile.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_document_file?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      // TODO: uncomment once we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 1 },{ ...ownerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey delete $expectedRecords document files where they are a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const result = await deleteDocumentFile(
          { Id: documentFile.Id! },
          {
            user,
          }
        );
        expect(result.data?.delete_document_file?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('insertDocumentVersion', () => {
    it.each([riskManagerUser1])(
      '$RoleKey should insert document version where they are not the Owner or contributor of the parent document',
      async (user) => {
        const document = buildDocument({});
        await insertDocument(document);

        const result = await insertDocumentVersion(
          buildInsertDocumentVersion({
            ParentDocumentId: document.Id!,
          }),
          {
            user,
          }
        );
        expect(result.data?.insertDocumentVersion?.Id).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey should NOT insert document version where they are not the Owner or contributor of the parent document',
      async (user) => {
        const document = buildDocument({});
        await insertDocument(document);

        await expect(
          insertDocumentVersion(
            buildInsertDocumentVersion({
              ParentDocumentId: document.Id!,
            }),
            {
              user,
            }
          )
        ).rejects.toThrowError(
          'You do not have permission to perform this action'
        );
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should insert document version where they are the Owner of the parent document',
      async (user) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id! })],
          },
        });
        await insertDocument(document);

        const result = await insertDocumentVersion(
          buildInsertDocumentVersion({
            ParentDocumentId: document.Id!,
          }),
          {
            user,
          }
        );
        expect(result.data?.insertDocumentVersion?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should insert document version where they are the Contributor of the parent document',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id! })],
          },
        });
        await insertDocument(document);

        const result = await insertDocumentVersion(
          buildInsertDocumentVersion({
            ParentDocumentId: document.Id!,
          }),
          {
            user,
          }
        );
        expect(result.data?.insertDocumentVersion?.Id).toBeDefined();
      }
    );
  });

  describe('updateDocumentVersion', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey should update $expectedRecords document version where they are not the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const result = await updateDocumentVersion(
          buildUpdateDocumentVersion({
            Id: documentFile.Id!,
            LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
          }),
          {
            user,
          }
        );
        expect(result.data?.updateDocumentVersion?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey does NOT publish version straight away when there is an approval workflow for it',
      async ({ ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const workflow = buildApprovalWorkflow('publish-document-version', [
          [{ UserId: anotherUser.Id }],
        ]);

        await insertApproval(workflow);

        const result = await updateDocumentVersion(
          buildUpdateDocumentVersion({
            Id: documentFile.Id!,
            LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
            Status: VersionStatusEnum.Published,
          }),
          {
            confirmChangeRequest: true,
            user,
          }
        );
        expect(result.data?.updateDocumentVersion?.affected_rows).toEqual(1);
        const updatedDocumentFile = await getDocumentFileById({
          Id: documentFile.Id!,
        });
        expect(updatedDocumentFile?.Status).toEqual(VersionStatusEnum.Draft);
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey cannot modify a version with outstanding change requests',
      async ({ ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const workflow = buildApprovalWorkflow('publish-document-version', [
          [{ UserId: anotherUser.Id }],
        ]);

        await insertApproval(workflow);

        await updateDocumentVersion(
          buildUpdateDocumentVersion({
            Id: documentFile.Id!,
            LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
            Status: VersionStatusEnum.Published,
          }),
          {
            confirmChangeRequest: true,
            user,
          }
        );

        await expect(
          updateDocumentVersion(
            buildUpdateDocumentVersion({
              Id: documentFile.Id!,
              LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
              Status: VersionStatusEnum.Published,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(
          'You cannot edit this object while a change request is in progress'
        );
      }
    );

    it.each([
      { ...riskManagerUser1, status: VersionStatusEnum.Draft },
      { ...standardUser1, status: VersionStatusEnum.Draft },
      { ...standardEnhancedUser1, status: VersionStatusEnum.Draft },
      { ...internalAuditUser1, status: VersionStatusEnum.Draft },
      { ...riskManagerUser1, status: VersionStatusEnum.Published },
      { ...standardUser1, status: VersionStatusEnum.Published },
      { ...standardEnhancedUser1, status: VersionStatusEnum.Published },
      { ...internalAuditUser1, status: VersionStatusEnum.Published },
    ])(
      '$RoleKey is able to archive a version with status $status',
      async ({ status, ...user }) => {
        const documentFile = buildDocumentFile({ Status: status });
        await insertDocument(
          buildDocument({
            owners: {
              data: [buildOwner({ UserId: user.Id! })],
            },
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const result = await updateDocumentVersion(
          buildUpdateDocumentVersion({
            Id: documentFile.Id!,
            LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
            Status: VersionStatusEnum.Archived,
          }),
          {
            user,
          }
        );
        expect(result.data?.updateDocumentVersion?.affected_rows).toEqual(1);
        const updatedDocumentFile = await getDocumentFileById({
          Id: documentFile.Id!,
        });
        expect(updatedDocumentFile?.Status).toEqual(VersionStatusEnum.Archived);
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey should NOT update document version where they are not the Owner or contributor of the parent document',
      async (user) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        await expect(
          updateDocumentVersion(
            buildUpdateDocumentVersion({
              Id: documentFile.Id!,
              LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should update $expectedRecords document version where they are the Owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            owners: {
              data: [buildOwner({ UserId: user.Id! })],
            },
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const result = await updateDocumentVersion(
          buildUpdateDocumentVersion({
            Id: documentFile.Id!,
            LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
          }),
          {
            user,
          }
        );
        expect(result.data?.updateDocumentVersion?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should update $expectedRecords document version where they are the Contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            contributors: {
              data: [buildContributor({ UserId: user.Id! })],
            },
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        const result = await updateDocumentVersion(
          buildUpdateDocumentVersion({
            Id: documentFile.Id!,
            LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
          }),
          {
            user,
          }
        );
        expect(result.data?.updateDocumentVersion?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // TODO: uncomment once we have a single hasura role
      //readOnlyUser1,
    ])(
      '$RoleKey cannot update a document file directly (updates must be made via updateDocumentVersion api to sanitize html)',
      async (user) => {
        const documentFile = buildDocumentFile({});
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [documentFile],
            },
          })
        );

        await expect(
          updateDocumentFile(
            { Id: documentFile.Id!, Version: '123' },
            {
              user,
            }
          )
        ).rejects.toThrowError(
          "field 'update_document_file' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
