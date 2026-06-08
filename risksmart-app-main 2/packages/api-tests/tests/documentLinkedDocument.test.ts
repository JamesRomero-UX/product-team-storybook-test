import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertDocument } from '../clients/documentClient';
import {
  deleteDocumentLinkedDocument,
  getDocumentLinkedDocument,
  insertDocumentLinkedDocument,
} from '../clients/documentLinkedDocumentClient';
import { buildContributor } from '../data/contributor';
import { buildDocument } from '../data/document';
import { buildDocumentLinkedDocument } from '../data/documentLinkedDocument';
import { buildOwner } from '../data/owner';
import {
  internalAuditUser1,
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

describe('documentLinkedDocument', () => {
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
    ])(
      '$RoleKey should see $expectedRecords linked documents where they are not the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            linkedDocuments: {
              data: [
                buildDocumentLinkedDocument({
                  child: {
                    data: buildDocument({}),
                  },
                }),
              ],
            },
          })
        );

        const documents = await getDocumentLinkedDocument({
          user,
        });
        expect(documents.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords linked documents where they are the owner  of the parent document',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            linkedDocuments: {
              data: [
                buildDocumentLinkedDocument({
                  child: {
                    data: buildDocument({}),
                  },
                }),
              ],
            },
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          })
        );

        const documents = await getDocumentLinkedDocument({
          user,
        });
        expect(documents.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords linked documents where they are a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            linkedDocuments: {
              data: [
                buildDocumentLinkedDocument({
                  child: {
                    data: buildDocument({}),
                  },
                }),
              ],
            },
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
          })
        );

        const documents = await getDocumentLinkedDocument({
          user,
        });
        expect(documents.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      // TODO enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords linked documents where they are not the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          linkedDocuments: {
            data: [
              buildDocumentLinkedDocument({
                child: {
                  data: buildDocument({}),
                },
              }),
            ],
          },
        });
        await insertDocument(document);

        const results = await deleteDocumentLinkedDocument(
          { DocumentId: document.Id! },
          {
            user,
          }
        );
        expect(results?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      // TODO enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords linked documents where they are the owner  of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          linkedDocuments: {
            data: [
              buildDocumentLinkedDocument({
                child: {
                  data: buildDocument({}),
                },
              }),
            ],
          },
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);

        const results = await deleteDocumentLinkedDocument(
          { DocumentId: document.Id! },
          {
            user,
          }
        );
        expect(results?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      // TODO enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords linked documents where they are a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          linkedDocuments: {
            data: [
              buildDocumentLinkedDocument({
                child: {
                  data: buildDocument({}),
                },
              }),
            ],
          },
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await insertDocument(document);

        const results = await deleteDocumentLinkedDocument(
          { DocumentId: document.Id! },
          {
            user,
          }
        );
        expect(results?.affected_rows).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords linked documents where they are not the Owner or contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({});
        await insertDocument(document);
        const documentToLink = buildDocument({});
        await insertDocument(documentToLink);

        const results = await insertDocumentLinkedDocument(
          buildDocumentLinkedDocument({
            DocumentId: document.Id!,
            LinkedDocumentId: documentToLink.Id!,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
            OrgKey: undefined,
          }),
          {
            user,
          }
        );
        expect(results?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      standardUser1,
      // TODO enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should not insert linked documents where they are not the Owner or contributor of the parent document',
      async (user) => {
        const document = buildDocument({});
        await insertDocument(document);
        const documentToLink = buildDocument({});
        await insertDocument(documentToLink);

        await expect(
          insertDocumentLinkedDocument(
            buildDocumentLinkedDocument({
              DocumentId: document.Id!,
              LinkedDocumentId: documentToLink.Id!,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
              OrgKey: undefined,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(
          'check constraint of an insert/update permission has failed'
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      // TODO enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should insert $expectedRecords linked documents where they are the owner of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertDocument(document);
        const documentToLink = buildDocument({});
        await insertDocument(documentToLink);

        const results = await insertDocumentLinkedDocument(
          buildDocumentLinkedDocument({
            DocumentId: document.Id!,
            LinkedDocumentId: documentToLink.Id!,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
            OrgKey: undefined,
          }),
          {
            user,
          }
        );
        expect(results?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords linked documents where they are a contributor of the parent document',
      async ({ expectedRecords, ...user }) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await insertDocument(document);
        const documentToLink = buildDocument({});
        await insertDocument(documentToLink);

        const results = await insertDocumentLinkedDocument(
          buildDocumentLinkedDocument({
            DocumentId: document.Id!,
            LinkedDocumentId: documentToLink.Id!,
            CreatedByUser: undefined,
            ModifiedByUser: undefined,
            OrgKey: undefined,
          }),
          {
            user,
          }
        );
        expect(results?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([
      standardUser1,
      // TODO enable when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should not insert linked documents where they are a contributor of the parent document',
      async (user) => {
        const document = buildDocument({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await insertDocument(document);
        const documentToLink = buildDocument({});
        await insertDocument(documentToLink);

        await expect(
          insertDocumentLinkedDocument(
            buildDocumentLinkedDocument({
              DocumentId: document.Id!,
              LinkedDocumentId: documentToLink.Id!,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
              OrgKey: undefined,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(
          'check constraint of an insert/update permission has failed'
        );
      }
    );
  });
});
