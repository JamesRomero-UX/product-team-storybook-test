import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  getIssueAssessments,
  insertChildIssueAssessment,
  insertIssueAssessment,
  updateChildIssueAssessment,
  updateIssueAssessment,
} from '../clients/issueAssessmentClient';
import { getIssueParents } from '../clients/issueParentClient';
import {
  buildInsertChildIssueAssessment,
  buildUpdateChildIssueAssessment,
} from '../data/childIssueAssessment';
import { buildContributor } from '../data/contributor';
import { buildControl } from '../data/control';
import { buildDocument } from '../data/document';
import { buildIssue } from '../data/issue';
import { buildIssueAssessment } from '../data/issueAssessment';
import { buildIssueParent } from '../data/issueParent';
import { buildOwner } from '../data/owner';
import { buildTag } from '../data/tag';
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

describe('issue assessments', () => {
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
    ])(
      '$RoleKey should see $expectedRecords issue assessments where they are the Owner of the parent issue',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        await insertIssueAssessment(
          buildIssueAssessment({
            ParentIssueId: issue.Id,
          })
        );
        const issueAssessments = await getIssueAssessments({
          user,
        });
        expect(issueAssessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issue assessments where they are the Contributor of the parent issue',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        await insertIssueAssessment(
          buildIssueAssessment({
            ParentIssueId: issue.Id,
          })
        );
        const issueAssessments = await getIssueAssessments({
          user,
        });
        expect(issueAssessments.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issue assessments where they are not the Owner or contributor of the parent issue',
      async ({ expectedRecords, ...user }) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await insertIssueAssessment(
          buildIssueAssessment({
            ParentIssueId: issue.Id,
          })
        );
        const issueAssessments = await getIssueAssessments({
          user,
        });
        expect(issueAssessments.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insertChildIssueAssessment', () => {
    it.each([riskManagerUser1])(
      '$RoleKey can insert issue assessments when they are not the owner/contributor of the parent issue',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const { data } = await insertChildIssueAssessment(
          buildInsertChildIssueAssessment({
            ParentIssueId: issue.Id!,
          }),

          {
            user,
          }
        );
        expect(data?.insertChildIssueAssessment?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1])(
      '$RoleKey can insert issue assessments on issue with existing tags (issue assessment & issue share same tags)',
      async (user) => {
        const tagType = buildTagType();
        await apiClient.insertTagTypes({
          objects: [tagType],
        });
        const issue = buildIssue({
          tags: {
            data: [
              buildTag({
                TagTypeId: tagType.TagTypeId,
              }),
            ],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const { data } = await insertChildIssueAssessment(
          buildInsertChildIssueAssessment({
            ParentIssueId: issue.Id!,
            TagTypeIds: [tagType.TagTypeId!],
          }),

          {
            user,
          }
        );
        expect(data?.insertChildIssueAssessment?.Id).toBeDefined();
      }
    );

    it.each([standardUser1])(
      '$RoleKey cannot insert issue assessments when they are not the owner/contributor of the parent issue',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await expect(
          insertChildIssueAssessment(
            buildInsertChildIssueAssessment({
              ParentIssueId: issue.Id!,
            }),

            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([readOnlyUser1])(
      '$RoleKey cannot insert issue assessments when they are not the owner/contributor of the parent issue',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await expect(
          insertChildIssueAssessment(
            buildInsertChildIssueAssessment({
              ParentIssueId: issue.Id!,
            }),

            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insertChildIssueAssessment' not found in type: 'mutation_root'"
        );
      }
    );

    it.each([riskManagerUser1, standardUser1, internalAuditUser1])(
      '$RoleKey can insert issue assessments when they are the owner of parent issue',
      async (user) => {
        const issue = buildIssue({
          owners: {
            data: [
              buildOwner({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const { data } = await insertChildIssueAssessment(
          buildInsertChildIssueAssessment({
            ParentIssueId: issue.Id!,
          }),

          {
            user,
          }
        );
        expect(data?.insertChildIssueAssessment?.Id).toBeDefined();
      }
    );

    it.each([riskManagerUser1, standardUser1, internalAuditUser1])(
      '$RoleKey can insert $expectedRecords issue assessments when they are the contributor of parent issue',
      async (user) => {
        const issue = buildIssue({
          contributors: {
            data: [
              buildContributor({
                UserId: user.Id,
              }),
            ],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const { data } = await insertChildIssueAssessment(
          buildInsertChildIssueAssessment({
            ParentIssueId: issue.Id!,
          }),

          {
            user,
          }
        );
        expect(data?.insertChildIssueAssessment?.Id).toBeDefined();
      }
    );
  });

  describe('insert', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
    ])(
      '$RoleKey cannot insert using default hasura api (extra security checks used in action based api)',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        await expect(
          insertIssueAssessment(
            buildIssueAssessment({
              ParentIssueId: issue.Id,
              OrgKey: undefined,
              Id: undefined,
              CreatedByUser: undefined,
              ModifiedByUser: undefined,
            }),

            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_issue_assessment' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('updateChildIssueAssessment', () => {
    it('Does not update if issue assessment timestamp does not match that of request', async () => {
      const issue = buildIssue({});
      await apiClient.insertIssues({ objects: issue });
      const issueAssessment = buildIssueAssessment({
        ParentIssueId: issue.Id,
      });
      await insertIssueAssessment(issueAssessment);

      const targetCloseDate = '2014-01-01';
      await expect(
        updateChildIssueAssessment(
          buildUpdateChildIssueAssessment({
            OriginalTimestamp: '2010-01-01',
            TargetCloseDate: targetCloseDate,
            Id: issueAssessment.Id!,
          }),
          {
            user: riskManagerUser1,
          }
        )
      ).rejects.toThrow(
        'Item has been modified since last viewed. Please refresh page and try again'
      );
    });

    it.each([riskManagerUser1])(
      '$RoleKey can update issue assessment when NOT owner or contributor',
      async (user) => {
        const issue = buildIssue({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const issueAssessment = buildIssueAssessment({
          ParentIssueId: issue.Id,
        });
        await insertIssueAssessment(issueAssessment);

        const issueAssessments = (await getIssueAssessments()).filter(
          (c) => c.ParentIssueId === issue.Id
        );
        const issueAssessmentModifiedAtTimestamp =
          issueAssessments[0].ModifiedAtTimestamp;

        const targetCloseDate = '2014-01-01';
        const { data } = await updateChildIssueAssessment(
          buildUpdateChildIssueAssessment({
            OriginalTimestamp: issueAssessmentModifiedAtTimestamp,
            TargetCloseDate: targetCloseDate,
            Id: issueAssessment.Id!,
          }),
          {
            user,
          }
        );
        expect(data?.updateChildIssueAssessment?.Id).toBeDefined();
      }
    );

    it.each([
      standardUser1,
      // TODO: reintroduce once we have a single hasura role
      // { ...readOnlyUser1, expectedRecords: 0 },
    ])(
      '$RoleKey CANNOT update issue assessment when NOT owner or contributor',
      async (user) => {
        const issue = buildIssue({});
        await apiClient.insertIssues({ objects: issue });
        const issueAssessment = buildIssueAssessment({
          ParentIssueId: issue.Id,
        });
        await insertIssueAssessment(issueAssessment);

        const issueAssessments = (await getIssueAssessments()).filter(
          (c) => c.ParentIssueId === issue.Id
        );
        const issueAssessmentModifiedAtTimestamp =
          issueAssessments[0].ModifiedAtTimestamp;

        const targetCloseDate = '2014-01-01';
        await expect(
          updateChildIssueAssessment(
            buildUpdateChildIssueAssessment({
              OriginalTimestamp: issueAssessmentModifiedAtTimestamp,
              TargetCloseDate: targetCloseDate,
              Id: issueAssessment.Id!,
            }),
            {
              user,
            }
          )
        ).rejects.toThrow('Access denied');
      }
    );

    it.each([riskManagerUser1, standardUser1])(
      '$RoleKey can update an issue assessment if they are the owner of the parent issue',
      async (user) => {
        const issue = buildIssue({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const assessment = buildIssueAssessment({
          ParentIssueId: issue.Id,
        });
        await insertIssueAssessment(assessment);

        const issueAssessments = (await getIssueAssessments()).filter(
          (c) => c.ParentIssueId === issue.Id
        );
        const issueAssessmentModifiedAtTimestamp =
          issueAssessments[0].ModifiedAtTimestamp;

        const targetCloseDate = '2014-01-01';
        const { data } = await updateChildIssueAssessment(
          buildUpdateChildIssueAssessment({
            OriginalTimestamp: issueAssessmentModifiedAtTimestamp,
            TargetCloseDate: targetCloseDate,
            Id: assessment.Id!,
          }),
          {
            user,
          }
        );

        expect(data?.updateChildIssueAssessment?.Id).toBeDefined();
      }
    );

    it('Associated documents not removed on issue assessment update', async () => {
      const parentDocument = buildDocument();
      const issue = buildIssue({
        parents: {
          data: [
            buildIssueParent({
              document: {
                data: parentDocument,
              },
            }),
          ],
        },
        owners: {
          data: [buildOwner({ UserId: riskManagerUser1.Id })],
        },
      });
      await apiClient.insertIssues({ objects: issue });

      const assessment = buildIssueAssessment({
        ParentIssueId: issue.Id,
      });
      await insertIssueAssessment(assessment);

      const issueAssessments = (await getIssueAssessments()).filter(
        (c) => c.ParentIssueId === issue.Id
      );
      const issueAssessmentModifiedAtTimestamp =
        issueAssessments[0].ModifiedAtTimestamp;

      const targetCloseDate = '2014-01-01';
      await updateChildIssueAssessment(
        buildUpdateChildIssueAssessment({
          OriginalTimestamp: issueAssessmentModifiedAtTimestamp,
          TargetCloseDate: targetCloseDate,
          PoliciesBreachedIds: [parentDocument.Id!],
          Id: assessment.Id!,
        }),
        {
          user: riskManagerUser1,
        }
      );
      const parents = (await getIssueParents()).filter(
        (c) => c.IssueId === issue.Id
      );

      expect(parents.map((p) => p.ParentId)).toEqual([parentDocument.Id!]);
    });

    it('Standard user can remove associated controls that they do not have access to', async () => {
      const control = buildControl();
      const issue = buildIssue({
        parents: {
          data: [
            buildIssueParent({
              control: {
                data: control,
              },
            }),
          ],
        },
        owners: {
          data: [buildOwner({ UserId: standardUser1.Id })],
        },
      });
      await apiClient.insertIssues({ objects: issue });

      const assessment = buildIssueAssessment({
        ParentIssueId: issue.Id,
      });
      await insertIssueAssessment(assessment);

      const issueAssessments = (await getIssueAssessments()).filter(
        (c) => c.ParentIssueId === issue.Id
      );
      const issueAssessmentModifiedAtTimestamp =
        issueAssessments[0].ModifiedAtTimestamp;

      const targetCloseDate = '2014-01-01';
      await updateChildIssueAssessment(
        buildUpdateChildIssueAssessment({
          AssociatedControlIds: [],
          OriginalTimestamp: issueAssessmentModifiedAtTimestamp,
          TargetCloseDate: targetCloseDate,
          Id: assessment.Id!,
        }),
        {
          user: standardUser1,
        }
      );
      const parents = (await getIssueParents()).filter(
        (c) => c.IssueId === issue.Id
      );

      expect(parents.map((p) => p.ParentId)).toEqual([]);
    });

    it.each([riskManagerUser1, standardUser1])(
      '$RoleKey can update an issue assessment if they are the contributor',
      async (user) => {
        const issue = buildIssue({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const assessment = buildIssueAssessment({
          ParentIssueId: issue.Id,
        });
        await insertIssueAssessment(assessment);

        const issueAssessments = (await getIssueAssessments()).filter(
          (c) => c.ParentIssueId === issue.Id
        );
        const issueAssessmentModifiedAtTimestamp =
          issueAssessments[0].ModifiedAtTimestamp;

        const targetCloseDate = '2014-01-01';
        const { data } = await updateChildIssueAssessment(
          buildUpdateChildIssueAssessment({
            OriginalTimestamp: issueAssessmentModifiedAtTimestamp,
            TargetCloseDate: targetCloseDate,
            Id: assessment.Id!,
          }),
          {
            user,
          }
        );
        expect(data?.updateChildIssueAssessment?.Id).toBeDefined();
      }
    );
  });

  describe('update', () => {
    it.each([
      riskManagerUser1,
      standardUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      // TODO: reintroduce once we have a single hasura role
      // readOnlyUser1
    ])(
      '$RoleKey cannot update issue assessment using default hasura api (extra security checks in action based api)',
      async (user) => {
        const issue = buildIssue({
          contributors: {
            data: [buildContributor({ UserId: user.Id })],
          },
        });
        await apiClient.insertIssues({ objects: issue });
        const issueAssessment = buildIssueAssessment({
          ParentIssueId: issue.Id,
        });
        await insertIssueAssessment(issueAssessment);

        const targetCloseDate = '2014-01-01';
        await expect(
          updateIssueAssessment(
            {
              TargetCloseDate: targetCloseDate,
              Id: issueAssessment.Id!,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'update_issue_assessment' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
