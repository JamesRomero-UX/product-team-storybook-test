import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getAllDocuments } from '../clients/documentClient';
import { buildAttestationConfig } from '../data/attestation';
import { buildAttestationGroup } from '../data/attestationGroup';
import { buildContributor } from '../data/contributor';
import {
  buildDocument,
  buildInertChildDocument,
  buildUpdateChildDocument,
} from '../data/document';
import { buildDocumentFile } from '../data/documentFile';
import { buildOwner } from '../data/owner';
import { buildUserGroup } from '../data/userGroup';
import type {
  AuthUserInsertInput,
  DocumentInsertInput,
} from '../generated/graphql';
import { VersionStatusEnum } from '../generated/graphql';
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

describe('document', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    const testExpectedDocuments = async (
      document: Partial<DocumentInsertInput>,
      user: AuthUserInsertInput,
      expectedRecords: number
    ) => {
      await apiClient.insertDocument({
        objects: buildDocument({
          ...document,
        }),
      });

      const documents = await getAllDocuments({
        user,
      });

      expect(documents.length).toEqual(expectedRecords);
    };

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords documents where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await testExpectedDocuments({}, user, expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords documents where they are not the Owner or contributor, and the document has a published version',
      async ({ expectedRecords, ...user }) => {
        await testExpectedDocuments(
          {
            documentFiles: {
              data: [
                buildDocumentFile({
                  Status: VersionStatusEnum.Published,
                }),
              ],
            },
          },
          user,
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords documents where they are not the Owner or contributor, and the document has NOT published versions',
      async ({ expectedRecords, ...user }) => {
        await testExpectedDocuments(
          {
            documentFiles: {
              data: [
                buildDocumentFile({
                  Status: VersionStatusEnum.Draft,
                }),
              ],
            },
          },
          user,
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords documents where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await testExpectedDocuments(
          {
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          },
          user,
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords documents where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await testExpectedDocuments(
          {
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
          },
          user,
          expectedRecords
        );
      }
    );
  });

  describe('delete', () => {
    it.each([riskManagerUser1, standardUser1, readOnlyUser1])(
      'When $RoleKey cannot delete a document directly (backend only api)',
      async (user) => {
        const document = buildDocument({});
        await apiClient.insertDocument({ objects: document });

        await expect(
          apiClient.deleteDocument(
            {
              Id: document.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'delete_document' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('deleteDocumentById', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can delete an document that is not owned',
      async (user) => {
        const document = buildDocument({});
        await apiClient.insertDocument({ objects: document });

        const { deleteDocumentById } = await apiClient.deleteDocumentById(
          {
            id: document.Id!,
          },
          {
            user,
          }
        );
        expect(deleteDocumentById?.affected_rows).toEqual(1);
      }
    );

    it('Can delete a document that has attestation configuration with an associated group', async () => {
      const userGroup = buildUserGroup({});
      await apiClient.insertUserGroups({ objects: userGroup });

      const document = buildDocument({
        attestationConfig: {
          data: buildAttestationConfig({
            ParentId: undefined,
            groups: {
              data: [buildAttestationGroup({ GroupId: userGroup.Id })],
            },
          }),
        },
      });
      await apiClient.insertDocument({ objects: document });

      const { deleteDocumentById } = await apiClient.deleteDocumentById(
        {
          id: document.Id!,
        },
        {
          user: riskManagerUser1,
        }
      );
      expect(deleteDocumentById?.affected_rows).toEqual(1);
    });

    it.each([standardUser1, readOnlyUser1])(
      '$RoleKey cannot delete an document that is not owned',
      async (user) => {
        const document = buildDocument({});
        await apiClient.insertDocument({ objects: document });

        await expect(
          apiClient.deleteDocumentById(
            {
              id: document.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([riskManagerUser1, standardUser1])(
      'When $RoleKey deletes an document where they are the owner, it should delete $deletedRecords records',
      async (user) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertDocument({ objects: document });

        const { deleteDocumentById } = await apiClient.deleteDocumentById(
          {
            id: document.Id!,
          },
          {
            user,
          }
        );
        expect(deleteDocumentById?.affected_rows).toEqual(1);
      }
    );

    it.each([riskManagerUser1])(
      'When $RoleKey deletes an document where they are a contributor, it should delete the records',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertDocument({ objects: document });

        const { deleteDocumentById } = await apiClient.deleteDocumentById(
          {
            id: document.Id!,
          },
          {
            user,
          }
        );
        expect(deleteDocumentById?.affected_rows).toEqual(1);
      }
    );
    it.each([standardUser1, readOnlyUser1])(
      'When $RoleKey deletes an document where they are a contributor, it should fail',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertDocument({ objects: document });

        await expect(
          apiClient.deleteDocumentById(
            {
              id: document.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );
  });

  describe('insert', () => {
    it.each([riskManagerUser1, standardUser1, readOnlyUser1])(
      '$RoleKey cannot insert documents directly (backend only)',
      async (user) => {
        await expect(
          apiClient.insertDocument(
            {
              objects: buildDocument({
                OrgKey: undefined,
                Id: undefined,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrowError(
          "field 'insert_document' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('insert child', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert documents',
      async (user) => {
        const { insertChildDocument } = await apiClient.insertChildDocument(
          {
            object: buildInertChildDocument({}),
          },
          {
            user,
          }
        );
        expect(insertChildDocument?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])('$RoleKey cannot insert documents', async (user) => {
      await expect(
        apiClient.insertChildDocument(
          {
            object: buildInertChildDocument({}),
          },
          {
            user,
          }
        )
      ).rejects.toThrow('Access denied');
    });
  });

  describe('update', () => {
    it.each([riskManagerUser1, standardUser1, readOnlyUser1])(
      '$RoleKey can update update document directly (backend only)',
      async (user) => {
        const document = buildDocument({});
        await apiClient.insertDocument({ objects: document });
        const updatedTitle = 'updated title';
        await expect(
          apiClient.updateDocument(
            {
              Title: updatedTitle,
              Id: document.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'update_document' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update child', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can update a document when NOT owner or contributor',
      async (user) => {
        const document = buildDocument({});
        await apiClient.insertDocument({ objects: document });
        const { document: saveDocuments } = await apiClient.getAllDocuments();
        const savedDocument = saveDocuments.find((d) => d.Id === document.Id);
        const updatedTitle = 'updated title';
        const { updateChildDocument } = await apiClient.updateChildDocument(
          {
            object: buildUpdateChildDocument({
              Title: updatedTitle,
              Id: document.Id!,
              OriginalTimestamp: savedDocument?.ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        expect(updateChildDocument?.Id).toBeDefined();
      }
    );

    it('cannot update a document if OriginalTimestamp does not match current timestamp', async (user) => {
      const document = buildDocument({});
      await apiClient.insertDocument({ objects: document });

      const updatedTitle = 'updated title';

      await expect(
        apiClient.updateChildDocument(
          {
            object: buildUpdateChildDocument({
              Title: updatedTitle,
              Id: document.Id!,
            }),
          },
          {
            user,
          }
        )
      ).rejects.toThrow(
        'Item has been modified since last viewed. Please refresh page and try again'
      );
    });

    it.each([standardUser1, readOnlyUser1])(
      '$RoleKey cannot update a document when NOT owner or contributor',
      async (user) => {
        const document = buildDocument({});
        await apiClient.insertDocument({ objects: document });
        const updatedTitle = 'updated title';
        const { document: saveDocuments } = await apiClient.getAllDocuments();
        const savedDocument = saveDocuments.find((d) => d.Id === document.Id);
        await expect(
          apiClient.updateChildDocument(
            {
              object: buildUpdateChildDocument({
                Title: updatedTitle,
                Id: document.Id!,
                OriginalTimestamp: savedDocument?.ModifiedAtTimestamp,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([riskManagerUser1, standardUser1])(
      '$RoleKey can update document if they are the owner',
      async (user) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertDocument({ objects: document });
        const updatedTitle = 'updated title';
        const { document: saveDocuments } = await apiClient.getAllDocuments();
        const savedDocument = saveDocuments.find((d) => d.Id === document.Id);
        const { updateChildDocument } = await apiClient.updateChildDocument(
          {
            object: buildUpdateChildDocument({
              Title: updatedTitle,
              Id: document.Id!,
              OriginalTimestamp: savedDocument?.ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        expect(updateChildDocument?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey can update a document if they are the contributor',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertDocument({ objects: document });
        const updatedTitle = 'updated title';
        const { document: saveDocuments } = await apiClient.getAllDocuments();
        const savedDocument = saveDocuments.find((d) => d.Id === document.Id);
        const { updateChildDocument } = await apiClient.updateChildDocument(
          {
            object: buildUpdateChildDocument({
              Title: updatedTitle,
              Id: document.Id!,
              OriginalTimestamp: savedDocument?.ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        expect(updateChildDocument?.Id).toBeDefined();
      }
    );
    it.each([standardUser1, readOnlyUser1])(
      '$RoleKey cannot update a document if they are the contributor',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertDocument({ objects: document });
        const updatedTitle = 'updated title';
        await expect(
          apiClient.updateChildDocument(
            {
              object: buildUpdateChildDocument({
                Title: updatedTitle,
                Id: document.Id!,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );
  });
});
