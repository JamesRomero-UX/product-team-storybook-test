import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildAssessment } from '../data/assessment';
import { buildContributor } from '../data/contributor';
import { buildControl } from '../data/control';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { buildControlTestResult, buildTestResult } from '../data/testResult';
import { buildUpdateTestResult } from '../data/updateTestResultInput';
import type { RiskInsertInput } from '../generated/graphql2';
import {
  anotherUser,
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

describe('testResult', () => {
  let parentRisk: RiskInsertInput;
  beforeEach(async () => {
    await setup(mockedDefaults);
    parentRisk = buildRisk({});
    await apiClient.insertRisk({ objects: parentRisk });
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
      '$RoleKey should see $expectedRecords test results where they are not the Owner or contributor of the control',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            testResults: {
              data: [buildTestResult()],
            },
          }),
        });

        const { test_result } = await apiClient.getTestResults(
          {},
          {
            user,
          }
        );
        expect(test_result.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords test results where they are the owner of the control',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            testResults: {
              data: [buildTestResult()],
            },
          }),
        });

        const { test_result } = await apiClient.getTestResults(
          {},
          {
            user,
          }
        );
        expect(test_result.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords test results where they are a contributor  of the control',
      async ({ expectedRecords, ...user }) => {
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
            testResults: {
              data: [buildTestResult()],
            },
          }),
        });

        const { test_result } = await apiClient.getTestResults(
          {},
          {
            user,
          }
        );
        expect(test_result.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([riskManagerUser1, publicUser1, standardUser1])(
      'cannot insert directly (backend only)',
      async (user) => {
        const control = buildControl();
        await apiClient.insertControl({ objects: control });
        await expect(
          apiClient.insertTestResults(
            { objects: buildTestResult({}) },
            {
              user,
            }
          )
        ).rejects.toThrow(
          `field 'insert_test_result' not found in type: 'mutation_root'`
        );
      }
    );

    it.each([{ ...riskManagerUser1, expectedRecords: 1 }])(
      '$RoleKey can insert $expectedRecords controls when they are not the owner/contributor of the parent control',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl();
        await apiClient.insertControl({ objects: control });
        const data = await apiClient.insertControlTestResult(
          buildControlTestResult({
            ControlIds: [control.Id!],
          }),
          {
            user,
          }
        );
        expect(data?.insertControlTestResult?.Ids.length).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert $expectedRecords controls when they ARE an owner of the parent control',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({
          owners: {
            data: [
              buildOwner({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertControl({ objects: control });
        const data = await apiClient.insertControlTestResult(
          buildControlTestResult({
            ControlIds: [control.Id!],
          }),
          {
            user,
          }
        );
        expect(data?.insertControlTestResult?.Ids.length).toEqual(
          expectedRecords
        );
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert $expectedRecords controls when they ARE a contributor of the parent control',
      async ({ expectedRecords, ...user }) => {
        const control = buildControl({
          contributors: {
            data: [
              buildContributor({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertControl({ objects: control });
        const data = await apiClient.insertControlTestResult(
          buildControlTestResult({
            ControlIds: [control.Id!],
          }),
          {
            user,
          }
        );
        expect(data?.insertControlTestResult?.Ids.length).toEqual(
          expectedRecords
        );
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert controls when they are not the owner/contributor of the parent control',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        await expect(
          apiClient.insertControlTestResult(
            buildControlTestResult({
              ControlIds: [control.Id!],
            }),
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert controls when they are not the owner/contributor of the parent control',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        await expect(
          apiClient.insertTestResults(
            {
              objects: buildTestResult({
                Id: undefined,
                ParentControlId: control.Id!,
                CreatedByUser: undefined,
                ModifiedByUser: undefined,
                OrgKey: undefined,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_test_result' not found in type: 'mutation_root'"
        );
      }
    );

    // Assessment Control Test Results
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey can insert test result when they are not the owner/contributor of the parent control',
      async ({ ...user }) => {
        const control = buildControl();
        await apiClient.insertControl({ objects: control });
        const assessment = buildAssessment();
        await apiClient.insertAssessment({ objects: [assessment] });
        const data = await apiClient.insertControlTestResult(
          buildControlTestResult({
            AssessmentId: assessment.Id!,
            ControlIds: [control.Id!],
          }),
          {
            user,
          }
        );
        expect(data?.insertControlTestResult?.Ids).toBeDefined();
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey can insert test results when they ARE an owner of the parent control',
      async ({ ...user }) => {
        const owner = buildOwner({
          UserId: user.Id,
        });
        const control = buildControl({
          owners: {
            data: [owner],
          },
        });
        await apiClient.insertControl({ objects: control });
        const assessment = buildAssessment({
          owners: {
            data: [owner],
          },
        });
        await apiClient.insertAssessment({ objects: [assessment] });
        const data = await apiClient.insertControlTestResult(
          buildControlTestResult({
            AssessmentId: assessment.Id!,
            ControlIds: [control.Id!],
          }),
          {
            user,
          }
        );
        expect(data?.insertControlTestResult?.Ids).toBeDefined();
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey can insert test results when they ARE a contributor of the parent control',
      async ({ ...user }) => {
        const control = buildControl({
          contributors: {
            data: [
              buildContributor({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertControl({ objects: control });
        const assessment = buildAssessment({
          owners: {
            data: [
              buildOwner({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertAssessment({ objects: [assessment] });
        const data = await apiClient.insertControlTestResult(
          buildControlTestResult({
            AssessmentId: assessment.Id!,
            ControlIds: [control.Id!],
          }),
          {
            user,
          }
        );
        expect(data?.insertControlTestResult?.Ids).toBeDefined();
      }
    );

    it.each([standardUser1, standardEnhancedUser1, internalAuditUser1])(
      '$RoleKey cannot insert controls when they are not the owner/contributor of the parent control',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const assessment = buildAssessment();
        await apiClient.insertAssessment({ objects: [assessment] });
        await expect(
          apiClient.insertControlTestResult(
            buildControlTestResult({
              AssessmentId: assessment.Id!,
              ControlIds: [control.Id!],
            }),
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert controls when they are not the owner/contributor of the parent control',
      async (user) => {
        const control = buildControl({});
        await apiClient.insertControl({ objects: control });
        const assessment = buildAssessment();
        await apiClient.insertAssessment({ objects: [assessment] });
        await expect(
          apiClient.insertControlTestResult(
            buildControlTestResult({
              AssessmentId: assessment.Id!,
              ControlIds: [control.Id!],
            }),
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insertControlTestResult' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 0 },
      { ...standardEnhancedUser1, deletedRecords: 0 },
      { ...internalAuditUser1, deletedRecords: 0 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a test result where they are NOT the owner or contributor, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: anotherUser.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        const { delete_test_result } = await apiClient.deleteTestResult(
          { Id: testResult.Id! },
          {
            user,
          }
        );
        expect(delete_test_result?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a test result where they are the owner of the parent control, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        const { delete_test_result } = await apiClient.deleteTestResult(
          { Id: testResult.Id! },
          {
            user,
          }
        );
        expect(delete_test_result?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, deletedRecords: 1 },
      { ...standardUser1, deletedRecords: 1 },
      { ...standardEnhancedUser1, deletedRecords: 1 },
      { ...internalAuditUser1, deletedRecords: 1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1, deletedRecords: 0 },
    ])(
      'When $RoleKey deletes a test result where they are a contributor of the parent control, it should delete $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });

        const { delete_test_result } = await apiClient.deleteTestResult(
          { Id: testResult.Id! },
          {
            user,
          }
        );
        expect(delete_test_result?.affected_rows).toEqual(deletedRecords);
      }
    );
  });

  describe('update', () => {
    it.each([riskManagerUser1, publicUser1, standardUser1])(
      'cannot update directly (backend only)',
      async (user) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: anotherUser.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        await expect(
          apiClient.updateTestResult(
            {
              Id: testResult.Id!,
              Title: 'New Title',
            },
            {
              user,
            }
          )
        ).rejects.toThrowError(
          `field 'update_test_result' not found in type: 'mutation_root'`
        );
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      'When $RoleKey updates a test result where they are NOT the owner or contributor, it should delete successfully',
      async ({ ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: anotherUser.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        const { test_result } = await apiClient.getTestResults(
          {},
          { user: riskManagerUser1 }
        );

        const { updateTestResultApi } = await apiClient.updateTestResultApi(
          {
            object: buildUpdateTestResult({
              Id: testResult.Id!,
              Title: 'New Title',
              ParentControlId: test_result[0].ParentControlId,
              OriginalTimestamp: test_result[0].ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        expect(updateTestResultApi?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1])(
      'When $RoleKey updates a record with a non matching timestamp, the update fails',
      async ({ ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: anotherUser.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        const { test_result } = await apiClient.getTestResults(
          {},
          { user: riskManagerUser1 }
        );
        await expect(
          apiClient.updateTestResultApi(
            {
              object: buildUpdateTestResult({
                Id: testResult.Id!,
                Title: 'New Title',
                ParentControlId: test_result[0].ParentControlId,
                OriginalTimestamp: '2011-01-01T00:00:00+00:00',
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          'Item has been modified since last viewed. Please refresh page and try again'
        );
      }
    );

    it.each([
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1 },
    ])(
      'When $RoleKey updates a test result where they are NOT the owner or contributor, it should not updated',
      async ({ ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: anotherUser.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        const { test_result } = await apiClient.getTestResults(
          {},
          { user: riskManagerUser1 }
        );
        await expect(
          apiClient.updateTestResultApi(
            {
              object: buildUpdateTestResult({
                Id: testResult.Id!,
                Title: 'New Title',
                ParentControlId: test_result[0].ParentControlId,
                OriginalTimestamp: test_result[0].ModifiedAtTimestamp,
              }),
            },
            {
              user,
            }
          )
        ).rejects.toThrow('You do not have permission to perform this action');
      }
    );

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1 },
    ])(
      'When $RoleKey updates a test result where they are the owner of the parent control, it should update successfully',
      async ({ ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        const { test_result } = await apiClient.getTestResults(
          {},
          { user: riskManagerUser1 }
        );
        const { updateTestResultApi } = await apiClient.updateTestResultApi(
          {
            object: buildUpdateTestResult({
              Id: testResult.Id!,
              Title: 'New Title',
              ParentControlId: test_result[0].ParentControlId,
              OriginalTimestamp: test_result[0].ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        expect(updateTestResultApi?.Id).toBeDefined();
      }
    );

    it('All fields can be updated', async () => {
      const testResult = buildTestResult();
      await apiClient.insertControl({
        objects: buildControl({
          owners: {
            data: [buildOwner({ UserId: riskManagerUser1.Id })],
          },
          testResults: {
            data: [testResult],
          },
        }),
      });
      const { test_result } = await apiClient.getTestResults(
        {},
        { user: riskManagerUser1 }
      );
      const updateRequest = buildUpdateTestResult({
        Id: testResult.Id!,
        Title: 'New Title',
        ParentControlId: test_result[0].ParentControlId,
        OriginalTimestamp: test_result[0].ModifiedAtTimestamp,
        Submitter: standardUser1.Id,
        DesignEffectiveness: 3,
        OverallEffectiveness: 4,
        PerformanceEffectiveness: 2,
        TestDate: '2012-01-01T00:00:00+00:00',
      });
      await apiClient.updateTestResultApi(
        {
          object: updateRequest,
        },
        {
          user: riskManagerUser1,
        }
      );
      const { test_result: updated } = await apiClient.getTestResults(
        {},
        { user: riskManagerUser1 }
      );

      expect(updated[0].Title).toEqual(updateRequest?.Title);
      expect(updated[0].Description).toEqual(updateRequest.Description);
      expect(updated[0].DesignEffectiveness).toEqual(
        updateRequest.DesignEffectiveness
      );
      expect(updated[0].OverallEffectiveness).toEqual(
        updateRequest.OverallEffectiveness
      );
      expect(updated[0].PerformanceEffectiveness).toEqual(
        updateRequest.PerformanceEffectiveness
      );
      expect(updated[0].Submitter).toEqual(updateRequest.Submitter);
      expect(updated[0].TestDate).toEqual(updateRequest.TestDate);
    });

    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
      // TODO: reintroduce one we have one set of hasura permissions across multiple roles
      //{ ...readOnlyUser1 },
    ])(
      'When $RoleKey updates a test result where they are a contributor of the parent control, it should update successfully',
      async ({ ...user }) => {
        const testResult = buildTestResult();
        await apiClient.insertControl({
          objects: buildControl({
            contributors: {
              data: [buildContributor({ UserId: user.Id })],
            },
            testResults: {
              data: [testResult],
            },
          }),
        });
        const { test_result } = await apiClient.getTestResults(
          {},
          { user: riskManagerUser1 }
        );
        const { updateTestResultApi } = await apiClient.updateTestResultApi(
          {
            object: buildUpdateTestResult({
              Id: testResult.Id!,
              Title: 'New Title',
              ParentControlId: test_result[0].ParentControlId,
              OriginalTimestamp: test_result[0].ModifiedAtTimestamp,
            }),
          },
          {
            user,
          }
        );
        expect(updateTestResultApi?.Id).toBeDefined();
      }
    );
  });
});
