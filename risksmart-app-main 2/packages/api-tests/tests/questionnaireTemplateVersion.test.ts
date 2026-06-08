import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertQuestionnaireTemplate } from '../clients/questionnaireTemplateClient';
import {
  deleteQuestionnaireTemplateVersion,
  updateQuestionnaireTemplateVersion,
} from '../clients/questionnaireTemplateVersionClient';
import { buildContributor } from '../data/contributor';
import { buildOwner } from '../data/owner';
import { buildQuestionnaireTemplate } from '../data/questionnaireTemplate';
import { buildQuestionnaireTemplateVersion } from '../data/questionnaireTemplateVersion';
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

describe('Questionnaire Template Version', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords versions when they are not an owner or contributor of the parent',
      async ({ expectedRecords, ...user }) => {
        const input = buildQuestionnaireTemplate({
          versions: {
            data: [buildQuestionnaireTemplateVersion()],
          },
        });
        await insertQuestionnaireTemplate(input);
        const { questionnaire_template: versions } =
          await apiClient.getQuestionnaireTemplate(
            {
              where: {
                Id: { _eq: input.Id },
              },
            },
            { user }
          );
        expect(versions.length).toBe(expectedRecords);
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
      '$RoleKey should see $expectedRecords versions when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const input = buildQuestionnaireTemplate({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
          versions: {
            data: [buildQuestionnaireTemplateVersion()],
          },
        });
        await insertQuestionnaireTemplate(input);
        const { questionnaire_template: versions } =
          await apiClient.getQuestionnaireTemplate({ where: {} }, { user });

        expect(versions.length).toBe(expectedRecords);
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
      '$RoleKey should see $expectedRecords versions when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const input = buildQuestionnaireTemplate({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
          versions: {
            data: [buildQuestionnaireTemplateVersion()],
          },
        });
        await insertQuestionnaireTemplate(input);
        const { questionnaire_template: versions } =
          await apiClient.getQuestionnaireTemplate(
            {
              where: {
                Id: { _eq: input.Id },
              },
            },
            { user }
          );

        expect(versions.length).toBe(expectedRecords);
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
      '$RoleKey should update $expectedRecords versions when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const template = buildQuestionnaireTemplate({
          versions: {
            data: [version],
          },
        });
        await insertQuestionnaireTemplate(template);
        const response = await updateQuestionnaireTemplateVersion(
          {
            where: { Id: { _eq: version.Id } },
            set: { Schema: { foo: 'bar' } },
          },
          { user }
        );
        expect(
          response.data?.update_questionnaire_template_version?.affected_rows
        ).toEqual(expectedRecords);
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
      '$RoleKey should update $expectedRecords versions when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const template = buildQuestionnaireTemplate({
          versions: {
            data: [version],
          },
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertQuestionnaireTemplate(template);
        const response = await updateQuestionnaireTemplateVersion(
          {
            where: { Id: { _eq: version.Id } },
            set: { Schema: { foo: 'bar' } },
          },
          { user }
        );
        expect(
          response.data?.update_questionnaire_template_version?.affected_rows
        ).toEqual(expectedRecords);
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
      '$RoleKey should update $expectedRecords versions when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        const template = buildQuestionnaireTemplate({
          versions: {
            data: [version],
          },
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertQuestionnaireTemplate(template);
        const response = await updateQuestionnaireTemplateVersion(
          {
            where: { Id: { _eq: version.Id } },
            set: { Schema: { foo: 'bar' } },
          },
          { user }
        );
        expect(
          response.data?.update_questionnaire_template_version?.affected_rows
        ).toEqual(expectedRecords);
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
      '$RoleKey should delete $expectedRecords versions when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
          })
        );
        const response = await deleteQuestionnaireTemplateVersion(
          { where: { Id: { _eq: version.Id } } },
          { user }
        );
        expect(
          response.data?.delete_questionnaire_template_version?.affected_rows
        ).toEqual(expectedRecords);
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
      '$RoleKey should delete $expectedRecords versions when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          })
        );
        const response = await deleteQuestionnaireTemplateVersion(
          { where: { Id: { _eq: version.Id } } },
          { user }
        );
        expect(
          response.data?.delete_questionnaire_template_version?.affected_rows
        ).toEqual(expectedRecords);
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
      '$RoleKey should delete $expectedRecords versions when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const version = buildQuestionnaireTemplateVersion();
        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            versions: {
              data: [version],
            },
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
          })
        );
        const response = await deleteQuestionnaireTemplateVersion(
          { where: { Id: { _eq: version.Id } } },
          { user }
        );
        expect(
          response.data?.delete_questionnaire_template_version?.affected_rows
        ).toEqual(expectedRecords);
      }
    );
  });
});
