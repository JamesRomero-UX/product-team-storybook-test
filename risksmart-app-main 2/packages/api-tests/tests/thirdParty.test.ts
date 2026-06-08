import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertUserGroup } from '../clients/userGroupClient';
import { buildContributor } from '../data/contributor';
import { buildDepartmentType } from '../data/departmentType';
import { buildOwner } from '../data/owner';
import { buildTagType } from '../data/tagType';
import {
  buildInsertThirdPartyApi,
  buildThirdParty,
  buildUpdateThirdPartyApi,
} from '../data/thirdParty';
import { buildUserGroup } from '../data/userGroup';
import type { InsertThirdPartyInput } from '../generated/graphql';
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

describe('Third Party', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('insertThirdPartyAPI', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ])('$RoleKey cannot insert third party records directly', async (user) => {
      await expect(
        apiClient.insertThirdParty(
          {
            objects: buildThirdParty(),
          },
          { user }
        )
      ).rejects.toThrow(
        `field 'insert_third_party' not found in type: 'mutation_root'`
      );
    });

    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey should insert $expectedRecords third party objects with owners, owner groups, contributors, contributor groups, tags, departments',
      async ({ expectedRecords, ...user }) => {
        const userGroupOwners = buildUserGroup({
          Name: 'Group1',
        });
        await insertUserGroup(userGroupOwners);
        const userGroupContributors = buildUserGroup({
          Name: 'Group2',
        });
        await insertUserGroup(userGroupContributors);
        const tagType = buildTagType();
        await apiClient.insertTagTypes({ objects: [tagType] });
        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });
        const input: InsertThirdPartyInput = buildInsertThirdPartyApi({
          Postcode: 'AB12 3CD',
          PrimaryContactName: 'John Doe',
          Criticality: 2,
          Address: '123 Test Street',
          CityTown: 'Test City',
          Country: 'United Kingdom',
          Description: 'Test description',
          Title: 'Test title',
          Status: 'active',
          Type: 'supplier',
          CompanyDomain: 'test.com',
          CompaniesHouseNumber: '123',
          CustomAttributeData: {
            '1721833318624_select': null,
            '1721833318625_text': 'Test text',
            '1721833318626_textarea': 'Test textarea',
            '1721833318627_date': '2023-10-01',
            '1721833318628_link': 'https://example.com',
          },
          OwnerUserIds: [standardUser1.Id!],
          OwnerGroupIds: [userGroupOwners.Id!],
          ContributorUserIds: [standardEnhancedUser1.Id!],
          ContributorGroupIds: [userGroupContributors.Id!],
          TagTypeIds: [tagType.TagTypeId!],
          DepartmentTypeIds: [departmentType.DepartmentTypeId!],
        });

        const response = await apiClient.insertThirdPartyApi(
          {
            object: input,
          },
          { user }
        );
        const thirdParties = await apiClient.getThirdParty({
          where: {
            Id: {
              _eq: response.insertThirdPartyApi?.Id,
            },
          },
        });
        expect(thirdParties.third_party.length).toBe(expectedRecords);

        const thirdParty = thirdParties.third_party[0];

        expect(thirdParty.Title).toEqual(input.Title);
        expect(thirdParty.Description).toEqual(input.Description);
        expect(thirdParty.CustomAttributeData).toEqual(
          input.CustomAttributeData
        );
        expect(thirdParty.Address).toEqual(input.Address);
        expect(thirdParty.CityTown).toEqual(input.CityTown);
        expect(thirdParty.CompaniesHouseNumber).toEqual(
          input.CompaniesHouseNumber
        );
        expect(thirdParty.CompanyDomain).toEqual(input.CompanyDomain);
        expect(thirdParty.CompanyName).toEqual(input.CompanyName);
        expect(thirdParty.Country).toEqual(input.Country);
        expect(thirdParty.Criticality).toEqual(input.Criticality);

        expect(thirdParty.Postcode).toEqual(input.Postcode);
        expect(thirdParty.PrimaryContactName).toEqual(input.PrimaryContactName);
        expect(thirdParty.Type).toEqual(input.Type);
        expect(thirdParty.Status).toEqual(input.Status);
        expect(thirdParty.owners.map((c) => c.UserId)).toStrictEqual([
          standardUser1.Id,
        ]);
        expect(thirdParty.ownerGroups.map((c) => c.UserGroupId)).toStrictEqual([
          userGroupOwners.Id,
        ]);
        expect(thirdParty.contributors.map((c) => c.UserId)).toStrictEqual([
          standardEnhancedUser1.Id,
        ]);
        expect(
          thirdParty.contributorGroups.map((c) => c.UserGroupId)
        ).toStrictEqual([userGroupContributors.Id]);
        expect(thirdParty.tags.map((c) => c.TagTypeId)).toStrictEqual([
          tagType.TagTypeId,
        ]);
        expect(
          thirdParty.departments.map((c) => c.DepartmentTypeId)
        ).toStrictEqual([departmentType.DepartmentTypeId]);
      }
    );
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
      '$RoleKey should see $expectedRecords third party objects when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertThirdParty({
          objects: buildThirdParty(),
        });
        const thirdParties = await apiClient.getThirdParty(
          { where: {} },
          { user }
        );
        expect(thirdParties.third_party.length).toBe(expectedRecords);
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
      '$RoleKey should see $expectedRecords third party objects when they are an owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertThirdParty({
          objects: buildThirdParty({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          }),
        });
        const thirdParties = await apiClient.getThirdParty(
          { where: {} },
          { user }
        );

        expect(thirdParties.third_party.length).toBe(expectedRecords);
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
      '$RoleKey should see $expectedRecords third party objects when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertThirdParty({
          objects: buildThirdParty({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
          }),
        });
        const thirdParties = await apiClient.getThirdParty(
          { where: {} },
          { user }
        );

        expect(thirdParties.third_party.length).toBe(expectedRecords);
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
    ])('$RoleKey cannot update third party records directly', async (user) => {
      const thirdParty = buildThirdParty();
      await apiClient.insertThirdParty({
        objects: thirdParty,
      });
      await expect(
        apiClient.updateThirdParty(
          {
            where: { Id: { _eq: thirdParty.Id } },
            set: { Title: 'foobar' },
          },
          { user }
        )
      ).rejects.toThrow(
        `field 'update_third_party' not found in type: 'mutation_root'`
      );
    });
  });

  describe('updateThirdPartyApi', () => {
    it.each([riskManagerUser1])(
      '$RoleKey should update third party objects when they are not an owner or contributor',
      async (user) => {
        const thirdParty = buildThirdParty();
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        const response = await apiClient.updateThirdPartyApi(
          {
            object: buildUpdateThirdPartyApi({
              Title: 'foobar',
              Id: thirdParty.Id!,
            }),
          },
          { user }
        );
        expect(response?.updateThirdPartyApi?.Id).toEqual(thirdParty.Id);
      }
    );

    it.each([
      standardUser1,
      readOnlyUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ])(
      '$RoleKey should not update third party objects when they are not an owner or contributor',
      async (user) => {
        const thirdParty = buildThirdParty();
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await expect(
          apiClient.updateThirdPartyApi(
            {
              object: buildUpdateThirdPartyApi({
                Title: 'foobar',
                Id: thirdParty.Id!,
              }),
            },
            { user }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should update third party objects when they are an owner',
      async (user) => {
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        const response = await apiClient.updateThirdPartyApi(
          {
            object: buildUpdateThirdPartyApi({
              Title: 'foobar',
              Id: thirdParty.Id!,
            }),
          },
          { user }
        );
        expect(response?.updateThirdPartyApi?.Id).toEqual(thirdParty.Id!);
      }
    );

    it.each([thirdPartyRespondent1, readOnlyUser1])(
      '$RoleKey should not update third party objects when they are an owner',
      async (user) => {
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await expect(
          apiClient.updateThirdPartyApi(
            {
              object: buildUpdateThirdPartyApi({
                Title: 'foobar',
                Id: thirdParty.Id!,
              }),
            },
            { user }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey should update third party objects when they are a contributor',
      async (user) => {
        const userGroupOwners = buildUserGroup({
          Name: 'Group1',
        });
        await insertUserGroup(userGroupOwners);
        const userGroupContributors = buildUserGroup({
          Name: 'Group2',
        });
        await insertUserGroup(userGroupContributors);
        const tagType = buildTagType();
        await apiClient.insertTagTypes({ objects: [tagType] });
        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });
        const unsavedThirdParty = buildThirdParty({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertThirdParty({
          objects: unsavedThirdParty,
        });
        const input = buildUpdateThirdPartyApi({
          Postcode: 'AB12 3CD',
          PrimaryContactName: 'John Doe',
          Criticality: 2,
          Address: '123 Test Street',
          CityTown: 'Test City',
          Country: 'United Kingdom',
          Description: 'Test description',
          Title: 'Test title',
          Status: 'active',
          Type: 'supplier',
          CompanyDomain: 'test.com',
          CompaniesHouseNumber: '123',
          CustomAttributeData: {
            '1721833318624_select': null,
            '1721833318625_text': 'Test text',
            '1721833318626_textarea': 'Test textarea',
            '1721833318627_date': '2023-10-01',
            '1721833318628_link': 'https://example.com',
          },
          Id: unsavedThirdParty.Id!,
          OwnerUserIds: [standardUser1.Id!],
          OwnerGroupIds: [userGroupOwners.Id!],
          ContributorUserIds: [standardEnhancedUser1.Id!],
          ContributorGroupIds: [userGroupContributors.Id!],
          TagTypeIds: [tagType.TagTypeId!],
          DepartmentTypeIds: [departmentType.DepartmentTypeId!],
        });
        const response = await apiClient.updateThirdPartyApi(
          {
            object: input,
          },
          { user }
        );
        expect(response?.updateThirdPartyApi?.Id).toEqual(
          unsavedThirdParty.Id!
        );

        const thirdParties = await apiClient.getThirdParty({
          where: {
            Id: {
              _eq: response.updateThirdPartyApi!.Id,
            },
          },
        });
        expect(thirdParties.third_party.length).toBe(1);

        const thirdParty = thirdParties.third_party[0];

        expect(thirdParty.Title).toEqual(input.Title);
        expect(thirdParty.Description).toEqual(input.Description);
        expect(thirdParty.CustomAttributeData).toEqual(
          input.CustomAttributeData
        );
        expect(thirdParty.Address).toEqual(input.Address);
        expect(thirdParty.CityTown).toEqual(input.CityTown);
        expect(thirdParty.CompaniesHouseNumber).toEqual(
          input.CompaniesHouseNumber
        );
        expect(thirdParty.CompanyDomain).toEqual(input.CompanyDomain);
        expect(thirdParty.CompanyName).toEqual(input.CompanyName);
        expect(thirdParty.Country).toEqual(input.Country);
        expect(thirdParty.Criticality).toEqual(input.Criticality);

        expect(thirdParty.Postcode).toEqual(input.Postcode);
        expect(thirdParty.PrimaryContactName).toEqual(input.PrimaryContactName);
        expect(thirdParty.Type).toEqual(input.Type);
        expect(thirdParty.Status).toEqual(input.Status);
        expect(thirdParty.owners.map((c) => c.UserId)).toStrictEqual([
          standardUser1.Id,
        ]);

        expect(thirdParty.ownerGroups.map((c) => c.UserGroupId)).toStrictEqual([
          userGroupOwners.Id,
        ]);
        expect(thirdParty.contributors.map((c) => c.UserId)).toStrictEqual([
          standardEnhancedUser1.Id,
        ]);
        expect(
          thirdParty.contributorGroups.map((c) => c.UserGroupId)
        ).toStrictEqual([userGroupContributors.Id]);
        expect(thirdParty.tags.map((c) => c.TagTypeId)).toStrictEqual([
          tagType.TagTypeId,
        ]);
        expect(
          thirdParty.departments.map((c) => c.DepartmentTypeId)
        ).toStrictEqual([departmentType.DepartmentTypeId]);
      }
    );

    it.each([thirdPartyRespondent1, readOnlyUser1])(
      '$RoleKey should not update third party objects when they are a contributor',
      async (user) => {
        const thirdParty = buildThirdParty({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        await expect(
          apiClient.updateThirdPartyApi(
            {
              object: buildUpdateThirdPartyApi({
                Title: 'foobar',
                Id: thirdParty.Id!,
              }),
            },
            { user }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
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
      '$RoleKey should delete $expectedRecords third party objects when they are not an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const thirdParty = buildThirdParty();
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        const response = await apiClient.deleteThirdParty(
          {
            where: { Id: { _eq: thirdParty.Id } },
          },
          { user }
        );
        expect(response?.delete_third_party?.affected_rows).toEqual(
          expectedRecords
        );
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
      '$RoleKey should delete $expectedRecords third party objects when they are an owner',
      async ({ expectedRecords, ...user }) => {
        const thirdParty = buildThirdParty({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        const response = await apiClient.deleteThirdParty(
          {
            where: { Id: { _eq: thirdParty.Id } },
          },
          { user }
        );
        expect(response?.delete_third_party?.affected_rows).toEqual(
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
      '$RoleKey should delete $expectedRecords third party objects when they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const thirdParty = buildThirdParty({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertThirdParty({
          objects: thirdParty,
        });
        const response = await apiClient.deleteThirdParty(
          {
            where: { Id: { _eq: thirdParty.Id } },
          },
          { user }
        );
        expect(response?.delete_third_party?.affected_rows).toEqual(
          expectedRecords
        );
      }
    );
  });
});
