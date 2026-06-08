import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { insertQuestionnaireTemplate } from '../clients/questionnaireTemplateClient';
import {
  deleteRelationFiles,
  getRelationFiles,
} from '../clients/relationFileClient';
import { buildAction } from '../data/action';
import { buildContributor } from '../data/contributor';
import { buildFile } from '../data/file';
import { buildOwner } from '../data/owner';
import { buildQuestionnaireTemplate } from '../data/questionnaireTemplate';
import { buildQuestionnaireTemplateVersion } from '../data/questionnaireTemplateVersion';
import { buildRelationFile } from '../data/relationFile';
import { buildThirdParty } from '../data/thirdParty';
import { buildThirdPartyResponse } from '../data/thirdPartyResponse';
import type { FileInsertInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
  thirdPartyRespondent1,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('relationFile', () => {
  let file: FileInsertInput;

  beforeEach(async () => {
    await setup(mockedDefaults);
    file = buildFile();
    await apiClient.insertFiles({ objects: file });
  }, 10000);

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
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords relation files where they are not the Owner or contributor of the action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            files: {
              data: [
                buildRelationFile({
                  FileId: file.Id,
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const relationFiles = await getRelationFiles({
          user,
        });
        expect(relationFiles.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords relation files where they are the Owner of the action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            files: {
              data: [
                buildRelationFile({
                  FileId: file.Id,
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const relationFiles = await getRelationFiles({
          user,
        });
        expect(relationFiles.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords relation files where they are the contributor of the action',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertActions({
          objects: buildAction({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            files: {
              data: [
                buildRelationFile({
                  FileId: file.Id,
                  ParentType: ParentTypeEnum.Action,
                }),
              ],
            },
          }),
        });

        const relationFiles = await getRelationFiles({
          user,
        });
        expect(relationFiles.length).toEqual(expectedRecords);
      }
    );

    it('ThirdPartyRespondent can see relation files where they have been invited', async () => {
      const version = buildQuestionnaireTemplateVersion();
      const thirdParty = buildThirdParty();
      const response = buildThirdPartyResponse({
        QuestionnaireTemplateVersionId: version.Id,
        ParentId: thirdParty.Id,
        invitees: {
          data: [
            {
              ThirdPartyId: thirdParty.Id,
              QuestionnaireTemplateVersionId: version.Id,
              UserEmail: 'supplier1@user.com',
              UserId: thirdPartyRespondent1.Id,
              OrgKey: getDefaultOrgId(),
              CreatedByUser: 'SYSTEM',
              ModifiedByUser: 'SYSTEM',
              CreatedAtTimestamp: '2021-09-01T00:00:00.000Z',
              ModifiedAtTimestamp: '2021-09-01T00:00:00.000Z',
            },
          ],
        },
        files: {
          data: [
            buildRelationFile({
              FileId: file.Id,
              ParentType: ParentTypeEnum.ThirdPartyResponse,
            }),
          ],
        },
      });

      await insertQuestionnaireTemplate(
        buildQuestionnaireTemplate({
          versions: {
            data: [version],
          },
        })
      );
      await apiClient.insertThirdParty({
        objects: thirdParty,
      });
      await apiClient.insertThirdPartyResponse({
        objects: response,
      });

      const relationFiles = await getRelationFiles({
        user: thirdPartyRespondent1,
      });
      expect(relationFiles.length).toEqual(1);
    });
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
      // TODO: reintroduce once we have one set of hasura permissions across multiple roles
      // { ...readOnlyUser1, expectedRecords: 1 },{ ...ownerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey delete $expectedRecords relation files where they are not the Owner or contributor of the action',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({
          files: {
            data: [
              buildRelationFile({
                FileId: file.Id,
                ParentType: ParentTypeEnum.Action,
              }),
            ],
          },
        });
        await apiClient.insertActions({
          objects: action,
        });

        const { data } = await deleteRelationFiles(
          { ParentId: action.Id! },
          {
            user,
          }
        );
        expect(data?.delete_relation_file?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
      // TODO: reintroduce once we have one set of hasura permissions across multiple roles
      // { ...readOnlyUser1, expectedRecords: 1 },{ ...ownerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey delete $expectedRecords relation files where they are the Owner of the action',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
          files: {
            data: [
              buildRelationFile({
                FileId: file.Id,
                ParentType: ParentTypeEnum.Action,
              }),
            ],
          },
        });
        await apiClient.insertActions({
          objects: action,
        });

        const { data } = await deleteRelationFiles(
          { ParentId: action.Id! },
          {
            user,
          }
        );
        expect(data?.delete_relation_file?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
      // TODO: reintroduce once we have one set of hasura permissions across multiple roles
      // { ...readOnlyUser1, expectedRecords: 1 },{ ...ownerUser1, expectedRecords: 1 },
    ])(
      '$RoleKey delete $expectedRecords relation files where they are the contributor of the action',
      async ({ expectedRecords, ...user }) => {
        const action = buildAction({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
          files: {
            data: [
              buildRelationFile({
                FileId: file.Id,
                ParentType: ParentTypeEnum.Action,
              }),
            ],
          },
        });
        await apiClient.insertActions({
          objects: action,
        });

        const { data } = await deleteRelationFiles(
          { ParentId: action.Id! },
          {
            user,
          }
        );
        expect(data?.delete_relation_file?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );

    it('ThirdPartyRespondent can delete relation files where they have been invited', async () => {
      const version = buildQuestionnaireTemplateVersion();
      const thirdParty = buildThirdParty();
      const response = buildThirdPartyResponse({
        QuestionnaireTemplateVersionId: version.Id,
        ParentId: thirdParty.Id,
        invitees: {
          data: [
            {
              ThirdPartyId: thirdParty.Id,
              QuestionnaireTemplateVersionId: version.Id,
              UserEmail: 'supplier1@user.com',
              UserId: thirdPartyRespondent1.Id,
              OrgKey: getDefaultOrgId(),
              CreatedByUser: 'SYSTEM',
              ModifiedByUser: 'SYSTEM',
              CreatedAtTimestamp: '2021-09-01T00:00:00.000Z',
              ModifiedAtTimestamp: '2021-09-01T00:00:00.000Z',
            },
          ],
        },
        files: {
          data: [
            buildRelationFile({
              FileId: file.Id,
              ParentType: ParentTypeEnum.ThirdPartyResponse,
            }),
          ],
        },
      });

      await insertQuestionnaireTemplate(
        buildQuestionnaireTemplate({
          versions: {
            data: [version],
          },
        })
      );
      await apiClient.insertThirdParty({
        objects: thirdParty,
      });
      await apiClient.insertThirdPartyResponse({
        objects: response,
      });

      const { data } = await deleteRelationFiles(
        { ParentId: response.Id! },
        {
          user: thirdPartyRespondent1,
        }
      );
      expect(data?.delete_relation_file?.affected_rows).toEqual(1);
    });
  });
});
