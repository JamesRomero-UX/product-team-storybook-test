import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertQuestionnaireTemplate } from '../clients/questionnaireTemplateClient';
import { buildContributor } from '../data/contributor';
import { buildOwner } from '../data/owner';
import { buildQuestionnaireTemplate } from '../data/questionnaireTemplate';
import { buildQuestionnaireTemplateVersion } from '../data/questionnaireTemplateVersion';
import { buildThirdParty } from '../data/thirdParty';
import { buildThirdPartyResponse } from '../data/thirdPartyResponse';
import { ThirdPartyResponseStatusEnum } from '../generated/graphql2';
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

describe('Third Party Response', () => {
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
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords response when they are not an owner or contributor of the parent',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty();

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
          objects: buildThirdPartyResponse({
            QuestionnaireTemplateVersionId: version.Id,
            ParentId: thirdParty.Id,
          }),
        });

        const responses = await apiClient.getThirdPartyResponse(
          { where: {} },
          { user }
        );
        expect(responses.third_party_response.length).toBe(expectedRecords);
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
      '$RoleKey should see $expectedRecords response when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
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
          objects: buildThirdPartyResponse({
            QuestionnaireTemplateVersionId: version.Id,
            ParentId: thirdParty.Id,
          }),
        });

        const responses = await apiClient.getThirdPartyResponse(
          { where: {} },
          { user }
        );
        expect(responses.third_party_response.length).toBe(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords response when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
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
          objects: buildThirdPartyResponse({
            QuestionnaireTemplateVersionId: version.Id,
            ParentId: thirdParty.Id,
          }),
        });

        const responses = await apiClient.getThirdPartyResponse(
          { where: {} },
          { user }
        );
        expect(responses.third_party_response.length).toBe(expectedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords response when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty();
        const response = buildThirdPartyResponse({
          QuestionnaireTemplateVersionId: version.Id,
          ParentId: thirdParty.Id,
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

        const returnData = await apiClient.updateThirdPartyResponse(
          {
            where: { Id: { _eq: response.Id } },
            set: { Status: ThirdPartyResponseStatusEnum.InProgress },
          },
          { user }
        );

        expect(returnData.update_third_party_response?.affected_rows).toBe(
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
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should update $expectedRecords response when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        const response = buildThirdPartyResponse({
          QuestionnaireTemplateVersionId: version.Id,
          ParentId: thirdParty.Id,
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

        const returnData = await apiClient.updateThirdPartyResponse(
          {
            where: { Id: { _eq: response.Id } },
            set: { Status: ThirdPartyResponseStatusEnum.InProgress },
          },
          { user }
        );

        expect(returnData.update_third_party_response?.affected_rows).toBe(
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
      { ...thirdPartyRespondent1, expectedRecords: 1 },
    ])(
      '$RoleKey should update $expectedRecords response when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        const response = buildThirdPartyResponse({
          QuestionnaireTemplateVersionId: version.Id,
          ParentId: thirdParty.Id,
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

        const returnData = await apiClient.updateThirdPartyResponse(
          {
            where: { Id: { _eq: response.Id } },
            set: { Status: ThirdPartyResponseStatusEnum.InProgress },
          },
          { user }
        );

        expect(returnData.update_third_party_response?.affected_rows).toBe(
          expectedRecords
        );
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords response when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty();
        const response = buildThirdPartyResponse({
          QuestionnaireTemplateVersionId: version.Id,
          ParentId: thirdParty.Id,
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

        const returnData = await apiClient.deleteThirdPartyResponse(
          {
            where: { Id: { _eq: response.Id } },
          },
          { user }
        );

        expect(returnData.delete_third_party_response?.affected_rows).toBe(
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
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords response when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        const response = buildThirdPartyResponse({
          QuestionnaireTemplateVersionId: version.Id,
          ParentId: thirdParty.Id,
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

        const returnData = await apiClient.deleteThirdPartyResponse(
          {
            where: { Id: { _eq: response.Id } },
          },
          { user }
        );

        expect(returnData.delete_third_party_response?.affected_rows).toBe(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords response when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const thirdParty = buildThirdParty({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        const response = buildThirdPartyResponse({
          QuestionnaireTemplateVersionId: version.Id,
          ParentId: thirdParty.Id,
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

        const returnData = await apiClient.deleteThirdPartyResponse(
          {
            where: { Id: { _eq: response.Id } },
          },
          { user }
        );

        expect(returnData.delete_third_party_response?.affected_rows).toBe(
          expectedRecords
        );
      }
    );
  });
});
