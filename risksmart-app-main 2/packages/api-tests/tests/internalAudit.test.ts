import { randomUUID } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  getInternalAuditIds,
  getInternalAudits,
} from '../clients/internalAuditClient';
import { buildContributor } from '../data/contributor';
import { buildDepartmentType } from '../data/departmentType';
import { buildInternalAudit } from '../data/internalAudit';
import { buildOwner } from '../data/owner';
import { buildInsertInternalAuditInput } from '../data/restApiInternalAudit';
import { buildTagType } from '../data/tagType';
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

describe('internalAudit', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords internal audits where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertInternalAudits({
          objects: [
            buildInternalAudit({
              owners: {
                data: [buildOwner({ UserId: user.Id })],
              },
            }),
          ],
        });

        const data = await getInternalAuditIds({
          user,
        });
        expect(data.data.internal_audit_entity.length).toEqual(expectedRecords);
      }
    );

    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
      },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords internal audits where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertInternalAudits({
          objects: [
            buildInternalAudit({
              contributors: {
                data: [buildContributor({ UserId: user.Id })],
              },
            }),
          ],
        });

        const data = await getInternalAuditIds({
          user,
        });
        expect(data.data.internal_audit_entity.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords internal audits with all columns where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertInternalAudits({
          objects: [
            buildInternalAudit({
              owners: {
                data: [buildOwner({ UserId: user.Id })],
              },
            }),
          ],
        });

        const data = await getInternalAudits({
          user,
        });
        expect(data.data.internal_audit_entity.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([internalAuditUser1, riskManagerUser1])(
      '$RoleKey should be able to insert an audit record without being set as owner or contributor',

      async ({ ...user }) => {
        const tagType = buildTagType();
        await apiClient.insertTagTypes({ objects: [tagType] });
        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });
        const input = buildInsertInternalAuditInput({
          Title: 'New IA',
          Description: 'Desc',
          BusinessArea: 'Tech',
          TagTypeIds: [tagType.TagTypeId!],
          OwnerUserIds: [],
          ContributorUserIds: [],
          DepartmentTypeIds: [departmentType.DepartmentTypeId!],
        });

        await expect(
          apiClient.insertRestAPIInternalAudit(
            {
              Input: input,
            },
            { user }
          )
        ).resolves.not.toThrow();
      }
    );

    it.each([internalAuditUser1, riskManagerUser1])(
      '$RoleKey should be able to insert internal audit records with tags and departments when set as an owner',

      async ({ ...user }) => {
        const tagType = buildTagType();
        await apiClient.insertTagTypes({ objects: [tagType] });
        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });
        const input = buildInsertInternalAuditInput({
          Title: 'New IA',
          Description: 'Desc',
          BusinessArea: 'Tech',
          OwnerUserIds: [user.Id!],
          TagTypeIds: [tagType.TagTypeId!],
          DepartmentTypeIds: [departmentType.DepartmentTypeId!],
        });

        await apiClient.insertRestAPIInternalAudit(
          {
            Input: input,
          },
          { user }
        );
        const data = await getInternalAuditIds({
          user,
        });
        expect(data.data.internal_audit_entity.length).toEqual(1);
      }
    );

    it.each([internalAuditUser1, riskManagerUser1])(
      '$RoleKey should be able to insert internal audit records with tags and departments when set as a contributor',

      async ({ ...user }) => {
        const tagType = buildTagType();
        await apiClient.insertTagTypes({ objects: [tagType] });
        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });
        const input = buildInsertInternalAuditInput({
          Title: 'New IA',
          Description: 'Desc',
          BusinessArea: 'Tech',
          ContributorUserIds: [user.Id!],
          TagTypeIds: [tagType.TagTypeId!],
          DepartmentTypeIds: [departmentType.DepartmentTypeId!],
        });

        await apiClient.insertRestAPIInternalAudit(
          {
            Input: input,
          },
          { user }
        );
        const data = await getInternalAuditIds({
          user,
        });
        expect(data.data.internal_audit_entity.length).toEqual(1);
      }
    );

    it.each([standardUser1, standardEnhancedUser1])(
      '$RoleKey should NOT be able to insert internal audits',
      async (user) => {
        const input = buildInsertInternalAuditInput({
          Title: 'New IA',
          Description: 'Desc',
          BusinessArea: 'Tech',
          ContributorUserIds: [user.Id!],
        });

        await expect(
          apiClient.insertRestAPIInternalAudit(
            {
              Input: input,
            },
            { user }
          )
        ).rejects.toThrow(
          "field 'insertInternalAudit' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'updateInternalAudit' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'updateInternalAudit' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        exception:
          "field 'updateInternalAudit' not found in type: 'mutation_root'",
      },
      { ...riskManagerUser1, exception: null },
      { ...internalAuditUser1, exception: null },
    ])(
      '$RoleKey should update $expectedRecords internal audits where they are the owner',
      async ({ exception, ...user }) => {
        const internalAudit = buildInternalAudit({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertInternalAudits({
          objects: [internalAudit],
        });

        const internalAuditFromDb = (
          await apiClient.getInternalAuditById({
            Id: internalAudit.Id!,
          })
        ).internal_audit_entity[0];

        const payload = {
          Input: {
            Id: internalAudit.Id!,
            Title: 'updated',
            Description: 'updated 2',
            BusinessArea: 'Updated BA',
            BusinessAreaId: randomUUID(),
            ContributorGroupIds:
              internalAudit.contributorGroups?.data.map(
                (c) => c.UserGroupId!
              ) ?? [],
            ContributorUserIds:
              internalAudit.contributors?.data.map((c) => c.UserId!) ?? [],
            DepartmentTypeIds:
              internalAudit.departments?.data.map((c) => c.DepartmentTypeId!) ??
              [],
            OriginalTimestamp: internalAuditFromDb.ModifiedAtTimestamp,
            OwnerGroupIds:
              internalAudit.ownerGroups?.data.map((c) => c.UserGroupId!) ?? [],
            OwnerUserIds:
              internalAudit.owners?.data.map((c) => c.UserId!) ?? [],
            TagTypeIds: internalAudit.tags?.data.map((c) => c.TagTypeId!) ?? [],
          },
        };

        if (exception) {
          await expect(
            apiClient.updateRestAPIInternalAudit(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await apiClient.updateRestAPIInternalAudit(payload, {
            user,
          });
          expect(result?.updateInternalAudit?.Id).toEqual(internalAudit.Id!);
          const updatedInternalAuditFromDb = (
            await apiClient.getInternalAuditById({
              Id: internalAudit.Id!,
            })
          ).internal_audit_entity[0];
          expect(updatedInternalAuditFromDb.Title).toEqual(payload.Input.Title);
          expect(updatedInternalAuditFromDb.businessArea?.Title).toEqual(
            payload.Input.BusinessArea
          );
          expect(updatedInternalAuditFromDb.Description).toEqual(
            payload.Input.Description
          );
        }
      }
    );

    it.each([
      {
        ...standardUser1,
        exception:
          "field 'updateInternalAudit' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        exception:
          "field 'updateInternalAudit' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        exception:
          "field 'updateInternalAudit' not found in type: 'mutation_root'",
      },
      { ...riskManagerUser1, exception: null },
      { ...internalAuditUser1, exception: null },
    ])(
      '$RoleKey should update $expectedRecords internal audits where they are a contributor',
      async ({ exception, ...user }) => {
        const internalAudit = buildInternalAudit({
          contributors: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertInternalAudits({
          objects: [internalAudit],
        });

        const internalAuditFromDb = (
          await apiClient.getInternalAuditById({
            Id: internalAudit.Id!,
          })
        ).internal_audit_entity[0];

        const payload = {
          Input: {
            Id: internalAudit.Id!,
            Title: 'updated',
            Description: 'updated 2',
            BusinessArea: 'Updated BA',
            BusinessAreaId: randomUUID(),
            ContributorGroupIds:
              internalAudit.contributorGroups?.data.map(
                (c) => c.UserGroupId!
              ) ?? [],
            ContributorUserIds:
              internalAudit.contributors?.data.map((c) => c.UserId!) ?? [],
            DepartmentTypeIds:
              internalAudit.departments?.data.map((c) => c.DepartmentTypeId!) ??
              [],
            OriginalTimestamp: internalAuditFromDb.ModifiedAtTimestamp,
            OwnerGroupIds:
              internalAudit.ownerGroups?.data.map((c) => c.UserGroupId!) ?? [],
            OwnerUserIds:
              internalAudit.owners?.data.map((c) => c.UserId!) ?? [],
            TagTypeIds: internalAudit.tags?.data.map((c) => c.TagTypeId!) ?? [],
          },
        };

        if (exception) {
          await expect(
            apiClient.updateRestAPIInternalAudit(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await apiClient.updateRestAPIInternalAudit(payload, {
            user,
          });
          expect(result?.updateInternalAudit?.Id).toEqual(internalAudit.Id!);
          const updatedInternalAuditFromDb = (
            await apiClient.getInternalAuditById({
              Id: internalAudit.Id!,
            })
          ).internal_audit_entity[0];
          expect(updatedInternalAuditFromDb.Title).toEqual(payload.Input.Title);
          expect(updatedInternalAuditFromDb.businessArea?.Title).toEqual(
            payload.Input.BusinessArea
          );
          expect(updatedInternalAuditFromDb.Description).toEqual(
            payload.Input.Description
          );
        }
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_entity' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_entity' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_entity' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords internal audits where they are the owner',
      async ({ expectedRecords, exception, ...user }) => {
        const internalAudit = buildInternalAudit({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });

        await apiClient.insertInternalAudits({
          objects: [buildInternalAudit(internalAudit)],
        });

        const payload = {
          Id: internalAudit.Id!,
        };

        if (exception) {
          await expect(
            apiClient.deleteInternalAudit(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await apiClient.deleteInternalAudit(payload, {
            user,
          });
          expect(result?.delete_internal_audit_entity?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
      {
        ...standardUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_entity' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_entity' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_internal_audit_entity' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords internal audits where they are a contributor',
      async ({ expectedRecords, exception, ...user }) => {
        const internalAudit = buildInternalAudit({
          contributors: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertInternalAudits({
          objects: [internalAudit],
        });

        const payload = {
          Id: internalAudit.Id!,
        };

        if (exception) {
          await expect(
            apiClient.deleteInternalAudit(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await apiClient.deleteInternalAudit(payload, {
            user,
          });
          expect(result?.delete_internal_audit_entity?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );
  });
});
