import { randomUUID } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertApproval } from '../clients/approvalClient';
import { insertUserGroup } from '../clients/userGroupClient';
import {
  buildApprovalWorkflow,
  changeRequestRequiredError,
} from '../data/approval';
import { buildContributor } from '../data/contributor';
import { buildDepartmentType } from '../data/departmentType';
import { buildOwner } from '../data/owner';
import {
  buildInsertChildRisk,
  buildRisk,
  buildUpdateChildRisk,
} from '../data/risk';
import { buildScheduleInput } from '../data/schedule';
import { buildTagType } from '../data/tagType';
import { buildUserGroup } from '../data/userGroup';
import {
  RiskStatusTypeEnum,
  RiskTreatmentTypeEnum,
  TestFrequencyEnum,
  UnitOfTimeEnum,
} from '../generated/graphql';
import type { UpdateChildRiskMutationVariables } from '../generated/graphql2';
import {
  anotherUser,
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

describe('risk', () => {
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
      '$RoleKey should see $expectedRecords risks where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        const { risk: risks } = await apiClient.getAllRisks(
          {},
          {
            user,
          }
        );
        expect(risks.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risks where they are the owner',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { risk: risks } = await apiClient.getAllRisks(
          {},
          {
            user,
          }
        );
        expect(risks.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords risks where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: standardUser1.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { risk: risks } = await apiClient.getAllRisks(
          {},
          {
            user,
          }
        );
        expect(risks.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      "$RoleKey - require approval when there is a 'delete-risk' workflow in place for any user",
      async (user) => {
        const risk = buildRisk({
          Tier: 1,
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });

        await apiClient.insertRisk({ objects: risk });

        const workflow = buildApprovalWorkflow('delete-risk', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await expect(
          apiClient.deleteRisk(
            {
              Id: risk.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(changeRequestRequiredError);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      "$RoleKey - dont delete a risk straight away when there is a 'delete-risk' workflow and you have confirmed the change request",
      async (user) => {
        const risk = buildRisk({
          Tier: 1,
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });

        await apiClient.insertRisk({ objects: risk });

        const workflow = buildApprovalWorkflow('delete-risk', [
          [{ UserId: riskManagerUser1.Id }],
        ]);

        await insertApproval(workflow);

        await apiClient.deleteRisk(
          {
            Id: risk.Id!,
          },
          {
            user,
            confirmChangeRequest: true,
          }
        );

        const riskCheck = await apiClient.getRiskById({
          id: risk.Id!,
        });
        expect(riskCheck?.risk[0].Id === risk.Id).toBeTruthy();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])('$RoleKey - child risk has parent cleared on deletion', async (user) => {
      const risk = buildRisk({
        Tier: 1,
        owners: {
          data: [buildOwner({ UserId: user.Id })],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      const childRisk = buildRisk({
        Tier: 2,
        ParentRiskId: risk.Id,
      });
      await apiClient.insertRisk({ objects: childRisk });

      await apiClient.deleteRisk(
        {
          Id: risk.Id!,
        },
        {
          user,
        }
      );
      const { risk: risks } = await apiClient.getAllRisks();
      const savedChildRisk = risks.find((r) => r.Id === childRisk.Id);

      expect(savedChildRisk!.ParentRiskId).toEqual(null);
    });

    it.each([standardUser1])(
      'When $RoleKey deletes a risk where they are not the owner or contributor, it should error',
      async (user) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.deleteRisk(
            {
              Id: risk.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      // TODO: add when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a risk where they are not the owner or contributor, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });

        const { deleteRiskById } = await apiClient.deleteRisk(
          {
            Id: risk.Id!,
          },
          {
            user,
          }
        );
        expect(deleteRiskById?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      // TODO: add when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a risk where they are the owner, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { deleteRiskById } = await apiClient.deleteRisk(
          {
            Id: risk.Id!,
          },
          {
            user,
          }
        );
        expect(deleteRiskById?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([standardUser1])(
      'When $RoleKey deletes a risk where they the contributor, it should error',
      async (user) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await expect(
          apiClient.deleteRisk(
            {
              Id: risk.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      // TODO: add when we have a single hasura role
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes an risk where they are a contributor, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const { deleteRiskById } = await apiClient.deleteRisk(
          {
            Id: risk.Id!,
          },
          {
            user,
          }
        );
        expect(deleteRiskById?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  describe('insert risk', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert a tier 1 risk',
      async ({ ...user }) => {
        const { insertChildRisk } = await apiClient.insertChildRisk(
          { object: buildInsertChildRisk({}) },
          {
            user,
          }
        );
        expect(insertChildRisk?.Id).toBeDefined();
      }
    );

    it('All fields are saved', async () => {
      const riskToInsert = buildInsertChildRisk({
        Treatment: RiskTreatmentTypeEnum.Tolerate,
        Description: 'My Description',
        Title: 'My Title',
        Status: RiskStatusTypeEnum.Monitored,
        schedule: buildScheduleInput({
          Frequency: TestFrequencyEnum.Monthly,
          StartDate: new Date('2024/01/02').toISOString(),
          TimeToCompleteUnit: UnitOfTimeEnum.Week,
          TimeToCompleteValue: 1,
        }),
      });
      const { insertChildRisk } = await apiClient.insertChildRisk(
        { object: riskToInsert },
        {
          user: riskManagerUser1,
        }
      );
      expect(insertChildRisk?.Id).toBeDefined();
      const { risk: insertedRisk } = await apiClient.getRiskById({
        id: insertChildRisk!.Id,
      });
      expect(insertedRisk[0].Treatment).toEqual(riskToInsert.Treatment);
      expect(insertedRisk[0].Description).toEqual(riskToInsert.Description);
      expect(insertedRisk[0].Title).toEqual(riskToInsert.Title);
      expect(insertedRisk[0].Status).toEqual(riskToInsert.Status);
      expect(insertedRisk[0].schedule?.Frequency).toEqual(
        riskToInsert.schedule.Frequency
      );
      expect(insertedRisk[0].schedule?.StartDate).toEqual(
        '2024-01-02T00:00:00+00:00'
      );
      expect(insertedRisk[0].schedule?.TimeToCompleteUnit).toEqual(
        riskToInsert.schedule.TimeToCompleteUnit
      );
      expect(insertedRisk[0].schedule?.TimeToCompleteValue).toEqual(
        riskToInsert.schedule.TimeToCompleteValue
      );
    });

    it('Sets schedule state when all schedule details present', async () => {
      const riskToInsert = buildInsertChildRisk({
        Treatment: RiskTreatmentTypeEnum.Tolerate,
        Description: 'My Description',
        Title: 'My Title',
        Status: RiskStatusTypeEnum.Monitored,
        schedule: buildScheduleInput({
          Frequency: TestFrequencyEnum.Monthly,
          StartDate: new Date('2024/01/02').toISOString(),
          TimeToCompleteUnit: UnitOfTimeEnum.Week,
          TimeToCompleteValue: 1,
        }),
      });
      const { insertChildRisk } = await apiClient.insertChildRisk(
        { object: riskToInsert },
        {
          user: riskManagerUser1,
        }
      );
      expect(insertChildRisk?.Id).toBeDefined();
      const { risk: insertedRisk } = await apiClient.getRiskById({
        id: insertChildRisk!.Id,
      });

      expect(insertedRisk[0].schedule?.Frequency).toEqual(
        riskToInsert.schedule.Frequency
      );
      expect(insertedRisk[0].schedule?.StartDate).toEqual(
        '2024-01-02T00:00:00+00:00'
      );
      expect(insertedRisk[0].schedule?.TimeToCompleteUnit).toEqual(
        riskToInsert.schedule.TimeToCompleteUnit
      );
      expect(insertedRisk[0].schedule?.TimeToCompleteValue).toEqual(
        riskToInsert.schedule.TimeToCompleteValue
      );
      expect(insertedRisk[0].scheduleState?.LatestDate).toEqual(null);
      expect(insertedRisk[0].scheduleState?.DueDate).toEqual(
        '2024-01-02T00:00:00+00:00'
      );
      expect(insertedRisk[0].scheduleState?.OverdueDate).toEqual(
        '2024-01-09T00:00:00+00:00'
      );
    });

    it.each([readOnlyUser1])('$RoleKey cannot insert risks', async (user) => {
      await expect(
        apiClient.insertChildRisk(
          { object: buildInsertChildRisk({}) },
          {
            user,
          }
        )
      ).rejects.toThrow('Access denied');
    });

    it.each([standardUser1, riskManagerUser1])(
      '$RoleKey can insert risk if they are the owner of the parent risk',
      async (user) => {
        const parentRisk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: parentRisk });

        const { insertChildRisk } = await apiClient.insertChildRisk(
          {
            object: buildInsertChildRisk({
              ParentRiskId: parentRisk.Id,
              Tier: 2,
            }),
          },
          {
            user,
          }
        );
        expect(insertChildRisk?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert risk if they are a contributor of the parent risk',
      async (user) => {
        const parentRisk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: parentRisk });

        const { insertChildRisk } = await apiClient.insertChildRisk(
          {
            object: buildInsertChildRisk({
              ParentRiskId: parentRisk.Id,
              Tier: 2,
            }),
          },
          {
            user,
          }
        );

        expect(insertChildRisk?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert risk with tags, departments, owners, contributors, contributor groups and owner groups if they are a contributor of the parent risk',
      async (user) => {
        const parentRisk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: parentRisk });

        const tagType = buildTagType();
        await apiClient.insertTagTypes({ objects: [tagType] });

        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });

        const userGroup = buildUserGroup();
        await insertUserGroup(userGroup);

        const { insertChildRisk } = await apiClient.insertChildRisk(
          {
            object: buildInsertChildRisk({
              ParentRiskId: parentRisk.Id,
              Tier: 2,
              DepartmentTypeIds: [departmentType.DepartmentTypeId!],
              TagTypeIds: [tagType.TagTypeId!],
              ContributorUserIds: [anotherUser.Id!],
              OwnerUserIds: [anotherUser.Id!],
              OwnerGroupIds: [userGroup.Id!],
              ContributorGroupIds: [userGroup.Id!],
            }),
          },
          {
            user,
          }
        );

        expect(insertChildRisk?.Id).toBeDefined();
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey can insert risk with tags, departments, owners, contributors, contributor groups and owner groups if they are a owner of the parent risk',
      async (user) => {
        const parentRisk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: parentRisk });

        const tagType = buildTagType();
        await apiClient.insertTagTypes({ objects: [tagType] });

        const departmentType = buildDepartmentType();
        await apiClient.insertDepartmentTypes({
          objects: [departmentType],
        });

        const userGroup = buildUserGroup();
        await insertUserGroup(userGroup);

        const { insertChildRisk } = await apiClient.insertChildRisk(
          {
            object: buildInsertChildRisk({
              ParentRiskId: parentRisk.Id,
              Tier: 2,
              DepartmentTypeIds: [departmentType.DepartmentTypeId!],
              TagTypeIds: [tagType.TagTypeId!],
              ContributorUserIds: [anotherUser.Id!],
              OwnerUserIds: [anotherUser.Id!],
              OwnerGroupIds: [userGroup.Id!],
              ContributorGroupIds: [userGroup.Id!],
            }),
          },
          {
            user,
          }
        );

        expect(insertChildRisk?.Id).toBeDefined();
      }
    );

    it.each([standardEnhancedUser1])(
      '$RoleKey can NOT insert Tier 1 risks',
      async (user) => {
        await expect(
          apiClient.insertChildRisk(
            {
              object: buildInsertChildRisk({
                Tier: 1,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey can insert Tier 2 and 3 risks without being an owner or contributor of the parent risk',
      async (user) => {
        const parentRisk = buildRisk({
          Tier: 1,
        });
        await apiClient.insertRisk({ objects: parentRisk });

        const { insertChildRisk: tierTwoInsertData } =
          await apiClient.insertChildRisk(
            {
              object: buildInsertChildRisk({
                ParentRiskId: parentRisk.Id,
                Tier: 2,
              }),
            },
            {
              user,
            }
          );
        expect(tierTwoInsertData?.Id).toBeDefined();
        const tier2Id = tierTwoInsertData?.Id;
        const { insertChildRisk: tierThreeInsertData } =
          await apiClient.insertChildRisk(
            {
              object: buildInsertChildRisk({
                ParentRiskId: tier2Id,
                Tier: 3,
              }),
            },
            {
              user,
            }
          );
        expect(tierThreeInsertData?.Id).toBeDefined();
      }
    );
  });

  it.each([standardEnhancedUser1, internalAuditUser1])(
    '$RoleKey can insert Tier 2 and 3 risks with tags,departments,contributors and owners without being an owner or contributor of the parent risk',
    async (user) => {
      const userGroup = buildUserGroup();
      await apiClient.insertUserGroups({ objects: userGroup });

      const tagType = buildTagType();
      await apiClient.insertTagTypes({ objects: [tagType] });

      const departmentType = buildDepartmentType();
      await apiClient.insertDepartmentTypes({
        objects: [departmentType],
      });

      const parentRisk = buildRisk({
        Tier: 1,
      });
      await apiClient.insertRisk({ objects: parentRisk });

      const { insertChildRisk: tierTwoInsertData } =
        await apiClient.insertChildRisk(
          {
            object: buildInsertChildRisk({
              ParentRiskId: parentRisk.Id,
              Tier: 2,
              TagTypeIds: [tagType.TagTypeId!],
              DepartmentTypeIds: [departmentType.DepartmentTypeId!],
              OwnerUserIds: [riskManagerUser1.Id!],
              ContributorUserIds: [riskManagerUser1.Id!],
              ContributorGroupIds: [userGroup.Id!],
              OwnerGroupIds: [userGroup.Id!],
            }),
          },
          {
            user,
          }
        );
      expect(tierTwoInsertData?.Id).toBeDefined();
      const tier2Id = tierTwoInsertData?.Id;
      const { insertChildRisk: tierThreeInsertData } =
        await apiClient.insertChildRisk(
          {
            object: buildInsertChildRisk({
              ParentRiskId: tier2Id,
              TagTypeIds: [tagType.TagTypeId!],
              DepartmentTypeIds: [departmentType.DepartmentTypeId!],
              OwnerUserIds: [riskManagerUser1.Id!],
              ContributorUserIds: [riskManagerUser1.Id!],
              ContributorGroupIds: [userGroup.Id!],
              OwnerGroupIds: [userGroup.Id!],
              Tier: 3,
            }),
          },
          {
            user,
          }
        );
      expect(tierThreeInsertData?.Id).toBeDefined();
    }
  );

  describe('apiClient.updateChildRisk', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey - child risk has parent cleared when tier changed',
      async (user) => {
        const risk = buildRisk({
          Tier: 1,
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const newParent = buildRisk({
          Id: randomUUID(),
          Tier: 1,
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: newParent });

        const childRisk = buildRisk({
          Tier: 2,
          ParentRiskId: risk.Id,
        });
        await apiClient.insertRisk({ objects: childRisk });

        await apiClient.updateChildRisk(
          {
            object: buildUpdateChildRisk({
              Id: risk.Id!,
              Title: 'Updated',
              Tier: 2,
              ParentRiskId: newParent.Id!,
              Description: 'Description updated',
            }),
          },
          {
            user,
          }
        );

        const { risk: risks } = await apiClient.getAllRisks();
        const savedChildRisk = risks.find((r) => r.Id === childRisk.Id);

        expect(savedChildRisk!.ParentRiskId).toEqual(null);
      }
    );

    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey - child risk has DOES NOT have parent cleared when tier NOT changed',
      async (user) => {
        const risk = buildRisk({
          Tier: 1,
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const childRisk = buildRisk({
          Tier: 2,
          ParentRiskId: risk.Id,
        });
        await apiClient.insertRisk({ objects: childRisk });

        await apiClient.updateChildRisk(
          {
            object: buildUpdateChildRisk({
              Id: risk.Id!,
              Title: 'Updated',
              Tier: risk.Tier!,
              ParentRiskId: null,
              Description: 'Description updated',
            }),
          },
          {
            user,
          }
        );

        const { risk: risks } = await apiClient.getAllRisks();
        const savedChildRisk = risks.find((r) => r.Id === childRisk.Id);

        expect(savedChildRisk!.ParentRiskId).toEqual(risk.Id);
      }
    );

    it.each([
      { ...riskManagerUser1, canUpdate: true },
      { ...standardUser1, canUpdate: false },
      { ...standardEnhancedUser1, canUpdate: false },
      { ...internalAuditUser1, canUpdate: false },
    ])(
      '$RoleKey can/cannot ($canUpdate) update risk when NOT owner or contributor',
      async ({ canUpdate, ...user }) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        const updatedTitle = 'updated title';

        if (canUpdate) {
          await expect(
            apiClient.updateChildRisk(
              {
                object: buildUpdateChildRisk({
                  Tier: risk.Tier ?? 2,
                  Title: updatedTitle,
                  Id: risk.Id!,
                  ParentRiskId: risk.ParentRiskId,
                  Description: 'Description updated',
                }),
              },
              {
                user,
              }
            )
          ).resolves.not.toThrow();
        } else {
          await expect(
            apiClient.updateChildRisk(
              {
                object: buildUpdateChildRisk({
                  Tier: risk.Tier ?? 2,
                  Title: updatedTitle,
                  Id: risk.Id!,
                  ParentRiskId: risk.ParentRiskId,
                  Description: 'Description updated',
                }),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey can update risk if they are the owner',
      async ({ ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const updatedTitle = 'updated title';

        await expect(
          apiClient.updateChildRisk(
            {
              object: buildUpdateChildRisk({
                Tier: 1,
                Title: updatedTitle,
                Id: risk.Id!,
                ParentRiskId: null,
                Description: 'Description updated',
              }),
            },
            {
              user,
            }
          )
        ).resolves.not.toThrow();
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])('$RoleKey - All fields are updated', async ({ ...user }) => {
      const risk = buildRisk({
        owners: {
          data: [buildOwner({ UserId: user.Id })],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      const updates: UpdateChildRiskMutationVariables = {
        object: buildUpdateChildRisk({
          Treatment: RiskTreatmentTypeEnum.Tolerate,
          Description: 'My Description',
          Title: 'My Title',
          Status: RiskStatusTypeEnum.Monitored,
          Id: risk.Id!,
          Tier: 1,
          schedule: buildScheduleInput({
            Frequency: TestFrequencyEnum.Monthly,
          }),
        }),
      };
      await expect(
        apiClient.updateChildRisk(updates, { user })
      ).resolves.not.toThrow();

      const { risk: insertedRisk } = await apiClient.getRiskById({
        id: risk.Id!,
      });
      expect(insertedRisk[0].Treatment).toEqual(updates?.object?.Treatment);
      expect(insertedRisk[0].Description).toEqual(updates?.object?.Description);
      expect(insertedRisk[0].Title).toEqual(updates?.object?.Title);
      expect(insertedRisk[0].Status).toEqual(updates?.object?.Status);
      expect(insertedRisk[0].schedule?.Frequency).toEqual(
        updates?.object?.schedule.Frequency
      );
    });

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey - can update risk which updates the schedule stated',
      async ({ ...user }) => {
        const riskToInsert = buildInsertChildRisk({
          Treatment: RiskTreatmentTypeEnum.Tolerate,
          Description: 'My Description',
          Title: 'My Title',
          Status: RiskStatusTypeEnum.Monitored,
          OwnerUserIds: [user.Id!],
          schedule: buildScheduleInput({
            Frequency: TestFrequencyEnum.Monthly,
            StartDate: null,
            TimeToCompleteValue: null,
            TimeToCompleteUnit: null,
          }),
        });
        const { insertChildRisk } = await apiClient.insertChildRisk(
          { object: riskToInsert },
          {
            user: riskManagerUser1,
          }
        );

        const { risk: insertedRiskInitial } = await apiClient.getRiskById({
          id: insertChildRisk!.Id,
        });
        expect(insertedRiskInitial[0].Treatment).toEqual(
          riskToInsert?.Treatment
        );
        expect(insertedRiskInitial[0].Description).toEqual(
          riskToInsert?.Description
        );
        expect(insertedRiskInitial[0].Title).toEqual(riskToInsert?.Title);
        expect(insertedRiskInitial[0].Status).toEqual(riskToInsert?.Status);
        expect(insertedRiskInitial[0].schedule?.Frequency).toEqual(
          riskToInsert?.schedule.Frequency
        );
        expect(insertedRiskInitial[0].schedule?.StartDate).toEqual(null);
        expect(insertedRiskInitial[0].schedule?.TimeToCompleteUnit).toEqual(
          null
        );
        expect(insertedRiskInitial[0].schedule?.TimeToCompleteValue).toEqual(
          null
        );
        expect(insertedRiskInitial[0].scheduleState?.LatestDate).toEqual(null);
        expect(insertedRiskInitial[0].scheduleState?.DueDate).toEqual(null);
        expect(insertedRiskInitial[0].scheduleState?.OverdueDate).toEqual(null);

        const updates: UpdateChildRiskMutationVariables = {
          object: buildUpdateChildRisk({
            Id: insertChildRisk!.Id,
            schedule: buildScheduleInput({
              Frequency: TestFrequencyEnum.Monthly,
              StartDate: new Date('2024/01/02').toISOString(),
              TimeToCompleteUnit: UnitOfTimeEnum.Week,
              TimeToCompleteValue: 1,
            }),
          }),
        };
        await expect(
          apiClient.updateChildRisk(updates, { user })
        ).resolves.not.toThrow();

        const { risk: updatedRisk } = await apiClient.getRiskById({
          id: insertChildRisk!.Id,
        });
        expect(updatedRisk[0].schedule?.Frequency).toEqual(
          TestFrequencyEnum.Monthly
        );
        expect(updatedRisk[0].schedule?.StartDate).toEqual(
          '2024-01-02T00:00:00+00:00'
        );
        expect(updatedRisk[0].schedule?.TimeToCompleteUnit).toEqual(
          UnitOfTimeEnum.Week
        );
        expect(updatedRisk[0].schedule?.TimeToCompleteValue).toEqual(1);
        expect(updatedRisk[0].scheduleState?.LatestDate).toEqual(null);
        expect(updatedRisk[0].scheduleState?.DueDate).toEqual(
          '2024-01-02T00:00:00+00:00'
        );
        expect(updatedRisk[0].scheduleState?.OverdueDate).toEqual(
          '2024-01-09T00:00:00+00:00'
        );
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey can update risk if they are the owner of the parent risk',
      async ({ ...user }) => {
        const parentRisk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: parentRisk });

        const risk = buildRisk({
          ParentRiskId: parentRisk.Id,
          Tier: 2,
        });
        await apiClient.insertRisk({ objects: risk });

        const updatedTitle = 'updated title';

        await expect(
          apiClient.updateChildRisk(
            {
              object: buildUpdateChildRisk({
                Tier: risk.Tier!,
                Title: updatedTitle,
                Id: risk.Id!,
                ParentRiskId: parentRisk.Id!,
                Description: 'Description updated',
              }),
            },
            {
              user,
            }
          )
        ).resolves.not.toThrow();
      }
    );

    /**
     * TODO: need to support this in the future. Might need an hasura action of
     * validation api
     */
    it.skip.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot set risk to tier 1 (remove parent) if they are only the owner of the removed parent risk',
      async (user) => {
        const parentRisk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: parentRisk });

        const risk = buildRisk({
          ParentRiskId: parentRisk.Id,
          Tier: 2,
          Id: '5159c418-ef1d-4371-b8b2-75850b1fad67',
        });
        await apiClient.insertRisk({ objects: risk });

        const updatedTitle = 'updated title';
        await expect(
          apiClient.updateChildRisk(
            {
              object: buildUpdateChildRisk({
                Tier: 1,
                Title: updatedTitle,
                Id: risk.Id!,
                ParentRiskId: null,
                Description: 'Description updated',
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey can set risk to tier 1 (remove parent) if they are the direct owner of the risk',
      async (user) => {
        const parentRisk = buildRisk({});
        await apiClient.insertRisk({ objects: parentRisk });

        const risk = buildRisk({
          ParentRiskId: parentRisk.Id,
          Tier: 2,
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        const updatedTitle = 'updated title';
        await expect(
          apiClient.updateChildRisk(
            {
              object: buildUpdateChildRisk({
                Tier: 1,
                Title: updatedTitle,
                Id: risk.Id!,
                ParentRiskId: null,
                Description: 'Description updated',
              }),
            },
            {
              user,
            }
          )
        ).resolves.not.toThrow();
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      // TODO: add when we have a single hasura role
      //{ ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords risk if they are the contributor',
      async ({ expectedRecords, ...user }) => {
        const parentRisk = buildRisk({});
        await apiClient.insertRisk({ objects: parentRisk });

        const risk = buildRisk({
          ParentRiskId: parentRisk.Id,
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const updatedTitle = 'updated title';
        if (expectedRecords === 0) {
          await expect(
            apiClient.updateChildRisk(
              {
                object: buildUpdateChildRisk({
                  Tier: 2,
                  Title: updatedTitle,
                  Id: risk.Id!,
                  ParentRiskId: parentRisk.Id,
                  Description: 'Description updated',
                }),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          await expect(
            apiClient.updateChildRisk(
              {
                object: buildUpdateChildRisk({
                  Tier: 2,
                  Title: updatedTitle,
                  Id: risk.Id!,
                  ParentRiskId: parentRisk.Id,
                  Description: 'Description updated',
                }),
              },
              {
                user,
              }
            )
          ).resolves.not.toThrow();
        }
      }
    );
  });
});
