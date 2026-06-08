import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteQuestionnaireTemplate,
  getQuestionnaireTemplates,
  insertQuestionnaireTemplate,
} from '../clients/questionnaireTemplateClient';
import { buildContributor } from '../data/contributor';
import { buildDepartmentType } from '../data/departmentType';
import { buildOwner } from '../data/owner';
import {
  buildInsertQuestionnaireTemplate,
  buildQuestionnaireTemplate,
  buildUpdateQuestionnaireTemplate,
} from '../data/questionnaireTemplate';
import { buildTagType } from '../data/tagType';
import { buildUserGroup } from '../data/userGroup';
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

describe('Questionnaire Template', () => {
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
      '$RoleKey should see $expectedRecords questionnaire template objects when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await insertQuestionnaireTemplate(buildQuestionnaireTemplate());
        const thirdParties = await getQuestionnaireTemplates({ user });
        expect(thirdParties.length).toBe(expectedRecords);
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
      '$RoleKey should see $expectedRecords questionnaire template objects when they are an owner',
      async ({ expectedRecords, ...user }) => {
        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          })
        );
        const thirdParties = await getQuestionnaireTemplates({ user });

        expect(thirdParties.length).toBe(expectedRecords);
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
      '$RoleKey should see $expectedRecords questionnaire template objects when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertQuestionnaireTemplate(
          buildQuestionnaireTemplate({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
          })
        );
        const thirdParties = await getQuestionnaireTemplates({ user });

        expect(thirdParties.length).toBe(expectedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ])(
      '$RoleKey cannot update questionnaire templates directly',
      async (user) => {
        const thirdParty = buildQuestionnaireTemplate();
        await insertQuestionnaireTemplate(thirdParty);
        await expect(
          apiClient.updateQuestionnaireTemplate(
            {
              where: { Id: { _eq: thirdParty.Id } },
              set: { Title: 'foobar' },
            },
            { user }
          )
        ).rejects.toThrow(
          `field 'update_questionnaire_template' not found in type: 'mutation_root`
        );
      }
    );
  });

  describe('updateQuestionnaireTemplateApi', () => {
    it.each([
      { ...riskManagerUser1, allowed: true },
      { ...standardUser1, allowed: false },
      { ...readOnlyUser1, allowed: false },
      { ...standardEnhancedUser1, allowed: false },
      { ...internalAuditUser1, allowed: false },
      { ...thirdPartyRespondent1, allowed: false },
    ])(
      '$RoleKey allowed=$allowed to update questionnaire template objects when they are not an owner or contributor',
      async ({ allowed, ...user }) => {
        const group1 = buildUserGroup({
          Name: 'A',
        });
        const group2 = buildUserGroup({
          Name: 'B',
        });
        await apiClient.insertUserGroups({
          objects: [group1, group2],
        });
        const tagType = buildTagType();
        await apiClient.insertTagTypes({
          objects: [tagType],
        });
        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });

        const questionnaireTemplate = buildQuestionnaireTemplate();
        await insertQuestionnaireTemplate(questionnaireTemplate);

        const input = buildUpdateQuestionnaireTemplate({
          Title: 'Test title',
          Description: 'Test description',
          CustomAttributeData: { key: 'value' },
          OwnerUserIds: [riskManagerUser1.Id!],
          ContributorUserIds: [standardUser1.Id!],
          OwnerGroupIds: [group1.Id!],
          ContributorGroupIds: [group2.Id!],
          TagTypeIds: [tagType.TagTypeId!],
          DepartmentTypeIds: [departmentType.DepartmentTypeId!],
          Id: questionnaireTemplate.Id!,
        });

        const update = apiClient.updateQuestionnaireTemplateApi(
          {
            object: input,
          },
          { user }
        );
        if (allowed) {
          const response = await update;
          expect(response.updateQuestionnaireTemplateApi?.Id).toBeDefined();

          const { questionnaire_template } =
            await apiClient.getQuestionnaireTemplate(
              { where: { Id: { _eq: questionnaireTemplate?.Id } } },
              { user }
            );
          const template = questionnaire_template[0];
          expect(template.CustomAttributeData).toEqual(
            input.CustomAttributeData
          );
          expect(template.Description).toEqual(input.Description);
          expect(template.Title).toEqual(input.Title);
          expect(template.ownerGroups.map((og) => og.UserGroupId)).toEqual(
            input.OwnerGroupIds
          );
          expect(
            template.contributorGroups.map((cg) => cg.UserGroupId)
          ).toEqual(input.ContributorGroupIds);
          expect(template.tags.map((cg) => cg.TagTypeId)).toEqual(
            input.TagTypeIds
          );
          expect(template.departments.map((d) => d.DepartmentTypeId)).toEqual(
            input.DepartmentTypeIds
          );
        } else {
          await expect(update).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, allowed: true },
      { ...standardUser1, allowed: true },
      { ...readOnlyUser1, allowed: false },
      { ...standardEnhancedUser1, allowed: true },
      { ...internalAuditUser1, allowed: true },
      { ...thirdPartyRespondent1, allowed: false },
    ])(
      '$RoleKey allowed=$allowed to update questionnaire template objects when they are an owner',
      async ({ allowed, ...user }) => {
        const questionnaireTemplate = buildQuestionnaireTemplate({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertQuestionnaireTemplate(questionnaireTemplate);
        const update = apiClient.updateQuestionnaireTemplateApi(
          {
            object: buildUpdateQuestionnaireTemplate({
              Title: 'foobar',
              Id: questionnaireTemplate.Id!,
            }),
          },
          { user }
        );
        if (allowed) {
          const response = await update;
          expect(response.updateQuestionnaireTemplateApi?.Id).toBeDefined();
        } else {
          await expect(update).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, allowed: true },
      { ...standardUser1, allowed: true },
      { ...readOnlyUser1, allowed: false },
      { ...standardEnhancedUser1, allowed: true },
      { ...internalAuditUser1, allowed: true },
      { ...thirdPartyRespondent1, allowed: false },
    ])(
      '$RoleKey allowed=$allowed to update questionnaire template objects when they are a contributor',
      async ({ allowed, ...user }) => {
        const questionnaireTemplate = buildQuestionnaireTemplate({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertQuestionnaireTemplate(questionnaireTemplate);

        const update = apiClient.updateQuestionnaireTemplateApi(
          {
            object: buildUpdateQuestionnaireTemplate({
              Title: 'foobar',
              Id: questionnaireTemplate.Id!,
            }),
          },
          { user }
        );
        if (allowed) {
          const response = await update;
          expect(response.updateQuestionnaireTemplateApi?.Id).toBeDefined();
        } else {
          await expect(update).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        }
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
      '$RoleKey should delete $expectedRecords questionnaire template objects when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const thirdParty = buildQuestionnaireTemplate();
        await insertQuestionnaireTemplate(thirdParty);
        const response = await deleteQuestionnaireTemplate(
          {
            where: { Id: { _eq: thirdParty.Id } },
          },
          { user }
        );
        expect(
          response.data?.delete_questionnaire_template?.affected_rows
        ).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...thirdPartyRespondent1, expectedRecords: 0 },
    ])(
      '$RoleKey should delete $expectedRecords questionnaire template objects when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const thirdParty = buildQuestionnaireTemplate({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertQuestionnaireTemplate(thirdParty);
        const response = await deleteQuestionnaireTemplate(
          {
            where: { Id: { _eq: thirdParty.Id } },
          },
          { user }
        );
        expect(
          response.data?.delete_questionnaire_template?.affected_rows
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
      '$RoleKey should delete $expectedRecords questionnaire template objects when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const thirdParty = buildQuestionnaireTemplate({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await insertQuestionnaireTemplate(thirdParty);
        const response = await deleteQuestionnaireTemplate(
          {
            where: { Id: { _eq: thirdParty.Id } },
          },
          { user }
        );
        expect(
          response.data?.delete_questionnaire_template?.affected_rows
        ).toEqual(expectedRecords);
      }
    );
  });

  describe('insertQuestionnaireTemplateApi', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert a questionnaire template',
      async (user) => {
        const group1 = buildUserGroup({
          Name: 'A',
        });
        const group2 = buildUserGroup({
          Name: 'B',
        });
        await apiClient.insertUserGroups({
          objects: [group1, group2],
        });
        const tagType = buildTagType();
        await apiClient.insertTagTypes({
          objects: [tagType],
        });
        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });

        const input = buildInsertQuestionnaireTemplate({
          Title: 'Test title',
          Description: 'Test description',
          CustomAttributeData: { key: 'value' },
          OwnerUserIds: [riskManagerUser1.Id!],
          ContributorUserIds: [standardUser1.Id!],
          OwnerGroupIds: [group1.Id!],
          ContributorGroupIds: [group2.Id!],
          TagTypeIds: [tagType.TagTypeId!],
          DepartmentTypeIds: [departmentType.DepartmentTypeId!],
        });
        const { insertQuestionnaireTemplateApi } =
          await apiClient.insertQuestionnaireTemplateApi(
            {
              object: input,
            },
            { user }
          );
        expect(insertQuestionnaireTemplateApi?.Id).toBeDefined();

        const { questionnaire_template } =
          await apiClient.getQuestionnaireTemplate(
            { where: { Id: { _eq: insertQuestionnaireTemplateApi?.Id } } },
            { user }
          );
        const template = questionnaire_template[0];
        expect(template.CustomAttributeData).toEqual(input.CustomAttributeData);
        expect(template.Description).toEqual(input.Description);
        expect(template.Title).toEqual(input.Title);
        expect(template.ownerGroups.map((og) => og.UserGroupId)).toEqual(
          input.OwnerGroupIds
        );
        expect(template.contributorGroups.map((cg) => cg.UserGroupId)).toEqual(
          input.ContributorGroupIds
        );
        expect(template.tags.map((cg) => cg.TagTypeId)).toEqual(
          input.TagTypeIds
        );
        expect(template.departments.map((d) => d.DepartmentTypeId)).toEqual(
          input.DepartmentTypeIds
        );
      }
    );

    it.each([
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ])('$RoleKey cannot insert a questionnaire template', async (user) => {
      await expect(
        apiClient.insertQuestionnaireTemplateApi(
          {
            object: buildInsertQuestionnaireTemplate(),
          },
          { user }
        )
      ).rejects.toThrow('Access denied');
    });
  });

  describe('insert', () => {
    it('should not be able to insert a questionnaire template directly', async () => {
      const questionnaireTemplate = buildQuestionnaireTemplate();
      await expect(
        apiClient.insertQuestionnaireTemplate(
          { objects: questionnaireTemplate },
          { user: riskManagerUser1 }
        )
      ).rejects.toThrow(
        `field 'insert_questionnaire_template' not found in type: 'mutation_root`
      );
    });
  });
});
