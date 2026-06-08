import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  deleteAssessment,
  insertAssessment,
} from '../clients/assessmentClient';
import {
  buildAssessment,
  buildInsertAssessmentApi,
  buildUpdateAssessmentApi,
} from '../data/assessment';
import { buildContributor } from '../data/contributor';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
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

describe('assessment', () => {
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
      '$RoleKey should see $expectedRecords assessments where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await insertAssessment(buildAssessment());

        const { assessment: assessments } = await apiClient.getAllAssessments(
          {},
          {
            user,
          }
        );
        expect(assessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords assessments where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await insertAssessment(
          buildAssessment({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
          })
        );

        const { assessment: assessments } = await apiClient.getAllAssessments(
          {},
          {
            user,
          }
        );
        expect(assessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords assessments where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertAssessment(
          buildAssessment({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
          })
        );

        const { assessment: assessments } = await apiClient.getAllAssessments(
          {},
          {
            user,
          }
        );
        expect(assessments.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])('$RoleKey Cannot insert assessment directly', async (user) => {
      const risk = buildRisk({
        owners: {
          data: [buildOwner({ UserId: user.Id })],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      await expect(() =>
        apiClient.insertAssessment(
          {
            objects: [
              buildAssessment({
                OriginatingItemId: risk.Id,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
                OrgKey: undefined,
              }),
            ],
          },
          { user }
        )
      ).rejects.toThrow(
        "field 'insert_assessment' not found in type: 'mutation_root'"
      );
    });
  });

  describe('insertAssessmentApi', () => {
    it.each([
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should be able to insert $expectedRecords assessments where they are an owner',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });

        await apiClient.insertAssessmentApi(
          {
            object: buildInsertAssessmentApi({
              OriginatingItemId: risk.Id,
            }),
          },
          { user }
        );

        const { assessment: assessments } = await apiClient.getAllAssessments(
          {},
          {
            user,
          }
        );
        expect(assessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should be able to insert $expectedRecords assessments where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        await apiClient.insertAssessmentApi(
          {
            object: buildInsertAssessmentApi({
              OriginatingItemId: risk.Id,
            }),
          },
          { user }
        );
        const { assessment: assessments } = await apiClient.getAllAssessments(
          {},
          {
            user,
          }
        );
        expect(assessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should not be able to insert $expectedRecords assessments where they are NOT an owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        await expect(
          apiClient.insertAssessmentApi(
            {
              object: buildInsertAssessmentApi({
                OriginatingItemId: risk.Id,
              }),
            },
            { user }
          )
        ).rejects.toThrow();
        const { assessment: assessments } = await apiClient.getAllAssessments(
          {},
          {
            user,
          }
        );

        expect(assessments.length).toEqual(expectedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      readOnlyUser1,
    ])('$RoleKey cannot update assessments directly', async (user) => {
      const assessment = buildAssessment();
      await insertAssessment(assessment);
      const payload = {
        Id: assessment.Id!,
        Summary: 'updated',
      };

      await expect(
        apiClient.updateAssessment(payload, {
          user,
        })
      ).rejects.toThrow(
        "field 'update_assessment' not found in type: 'mutation_root'"
      );
    });
  });

  describe('updateAssessmentApi', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
    ])(
      '$RoleKey should update $expectedRecords assessments where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessment(assessment);
        const payload = {
          Id: assessment.Id!,
          Summary: 'updated',
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateAssessmentApi(
              {
                object: buildUpdateAssessmentApi(payload),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          const { updateAssessmentApi } = await apiClient.updateAssessmentApi(
            {
              object: buildUpdateAssessmentApi(payload),
            },
            {
              user,
            }
          );
          expect(updateAssessmentApi?.affected_rows).toEqual(expectedRecords);
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
    ])(
      '$RoleKey should update $expectedRecords assessments where they are the owner',
      async ({ expectedRecords, ...user }) => {
        const assessment = buildAssessment({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertAssessment(assessment);

        const payload = {
          Id: assessment.Id!,
          Summary: 'updated',
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateAssessmentApi(
              {
                object: buildUpdateAssessmentApi(payload),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          const { updateAssessmentApi } = await apiClient.updateAssessmentApi(
            {
              object: buildUpdateAssessmentApi(payload),
            },
            {
              user,
            }
          );
          expect(updateAssessmentApi?.affected_rows).toEqual(expectedRecords);
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
      },
    ])(
      '$RoleKey should update $expectedRecords assessments where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        const assessment = buildAssessment({
          contributors: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertAssessment(assessment);

        const payload = {
          Id: assessment.Id!,
          Summary: 'updated',
        };

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateAssessmentApi(
              {
                object: buildUpdateAssessmentApi(payload),
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            'You do not have permission to perform this action'
          );
        } else {
          const { updateAssessmentApi } = await apiClient.updateAssessmentApi(
            {
              object: buildUpdateAssessmentApi(payload),
            },
            {
              user,
            }
          );
          expect(updateAssessmentApi?.affected_rows).toEqual(expectedRecords);
        }
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...standardUser1, expectedRecords: 0, exception: null },
      { ...standardEnhancedUser1, expectedRecords: 0, exception: null },
      { ...internalAuditUser1, expectedRecords: 0, exception: null },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_assessment' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords assessments where they are not the Owner or contributor',
      async ({ expectedRecords, exception, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessment(assessment);

        const payload = {
          Id: assessment.Id!,
        };

        if (exception) {
          await expect(
            deleteAssessment(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteAssessment(payload, {
            user,
          });
          expect(result.data?.delete_assessment?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...standardUser1, expectedRecords: 1, exception: null },
      { ...standardEnhancedUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_assessment' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords assessments where they are the owner',
      async ({ expectedRecords, exception, ...user }) => {
        const assessment = buildAssessment({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertAssessment(buildAssessment(assessment));

        const payload = {
          Id: assessment.Id!,
        };

        if (exception) {
          await expect(
            deleteAssessment(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteAssessment(payload, {
            user,
          });
          expect(result.data?.delete_assessment?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1, exception: null },
      { ...standardUser1, expectedRecords: 1, exception: null },
      { ...standardEnhancedUser1, expectedRecords: 1, exception: null },
      { ...internalAuditUser1, expectedRecords: 1, exception: null },
      {
        ...readOnlyUser1,
        expectedRecords: 0,
        exception:
          "field 'delete_assessment' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords assessments where they are a contributor',
      async ({ expectedRecords, exception, ...user }) => {
        const assessment = buildAssessment({
          contributors: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await insertAssessment(assessment);

        const payload = {
          Id: assessment.Id!,
        };

        if (exception) {
          await expect(
            deleteAssessment(payload, {
              user,
            })
          ).rejects.toThrow(exception);
        } else {
          const result = await deleteAssessment(payload, {
            user,
          });
          expect(result.data?.delete_assessment?.affected_rows).toEqual(
            expectedRecords
          );
        }
      }
    );
  });
});
