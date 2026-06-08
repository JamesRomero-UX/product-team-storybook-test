import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertDocument } from '../clients/documentClient';
import { buildAction } from '../data/action';
import { buildActionUpdate } from '../data/actionUpdate';
import { buildContributor } from '../data/contributor';
import { buildDocument } from '../data/document';
import { buildDocumentFile } from '../data/documentFile';
import { buildFile } from '../data/file';
import { buildOwner } from '../data/owner';
import { buildRelationFile } from '../data/relationFile';
import { ParentTypeEnum, VersionStatusEnum } from '../generated/graphql';
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

describe('file', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  }, 10000);
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords files where they are not the Owner/contributor of the parent document, and the version is published',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [
                buildDocumentFile({
                  Status: VersionStatusEnum.Published,
                  file: {
                    data: buildFile(),
                  },
                }),
              ],
            },
          })
        );

        const files = await apiClient.getAllFiles(
          {},
          {
            user,
          }
        );
        expect(files.file.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...publicUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords files where they are not the Owner/contributor of the parent document, and the version is not published',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            documentFiles: {
              data: [
                buildDocumentFile({
                  Status: VersionStatusEnum.Draft,
                  file: {
                    data: buildFile(),
                  },
                }),
              ],
            },
          })
        );

        const files = await apiClient.getAllFiles(
          {},
          {
            user,
          }
        );
        expect(files.file.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords files where they are not the Owner or contributor of the parent action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            files: {
              data: [
                buildRelationFile({
                  file: {
                    data: buildFile(),
                  },
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const files = await apiClient.getAllFiles(
          {},
          {
            user,
          }
        );
        expect(files.file.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords files where they are the Owner of the parent action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            files: {
              data: [
                buildRelationFile({
                  file: {
                    data: buildFile(),
                  },
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const files = await apiClient.getAllFiles(
          {},
          {
            user,
          }
        );
        expect(files.file.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords files of an action update where they are the Owner of the parent action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            updates: {
              data: [
                buildActionUpdate({
                  files: {
                    data: [
                      buildRelationFile({
                        file: {
                          data: buildFile(),
                        },
                        ParentType: ParentTypeEnum.Action,
                      }),
                    ],
                  },
                }),
              ],
            },
          }),
        });

        const files = await apiClient.getAllFiles(
          {},
          {
            user,
          }
        );
        expect(files.file.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords files where they are the contributor of the parent action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            files: {
              data: [
                buildRelationFile({
                  file: {
                    data: buildFile(),
                  },
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const files = await apiClient.getAllFiles(
          {},
          {
            user,
          }
        );
        expect(files.file.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      // TODO: reintroduce once we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a file where they are not a contributor or owner of the parent action, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const file = buildFile();
        await apiClient.insertActions({
          objects: buildAction({
            files: {
              data: [
                buildRelationFile({
                  file: {
                    data: file,
                  },
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const data = await apiClient.deleteFile(
          {
            Id: file.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_file?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      // TODO: reintroduce once we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a file where they are the owner of the parent action, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const file = buildFile();
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [
                buildOwner({
                  UserId: user.Id,
                }),
              ],
            },
            files: {
              data: [
                buildRelationFile({
                  file: {
                    data: file,
                  },
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const data = await apiClient.deleteFile(
          {
            Id: file.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_file?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      // TODO: reintroduce once we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a file where they are a contributor of the parent action, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const file = buildFile();
        await apiClient.insertActions({
          objects: buildAction({
            contributors: {
              data: [
                buildContributor({
                  UserId: user.Id,
                }),
              ],
            },
            files: {
              data: [
                buildRelationFile({
                  file: {
                    data: file,
                  },
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });
        const data = await apiClient.deleteFile(
          {
            Id: file.Id!,
          },
          {
            user,
          }
        );
        expect(data?.delete_file?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  // TODO insert permissions
});
