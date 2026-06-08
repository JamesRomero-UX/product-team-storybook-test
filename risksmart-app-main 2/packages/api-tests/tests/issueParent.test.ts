import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertDocument } from '../clients/documentClient';
import {
  deleteIssueParents,
  getIssueParents,
} from '../clients/issueParentClient';
import { buildContributor } from '../data/contributor';
import { buildDocument } from '../data/document';
import { buildIssue } from '../data/issue';
import { buildIssueParent } from '../data/issueParent';
import { buildOwner } from '../data/owner';
import { ParentTypeEnum } from '../generated/graphql';
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

describe('issueParent', () => {
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
      '$RoleKey should see $expectedRecords issue parents where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            issues: {
              data: [
                buildIssueParent({
                  issue: { data: buildIssue() },
                  ParentType: ParentTypeEnum.Document,
                }),
              ],
            },
          })
        );

        const issueParents = await getIssueParents({
          user,
        });
        expect(issueParents.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issue parents where they are the owner',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            owners: {
              data: [buildOwner({ UserId: user.Id })],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: { data: buildIssue() },
                  ParentType: ParentTypeEnum.Document,
                }),
              ],
            },
          })
        );

        const issueParents = await getIssueParents({
          user,
        });
        expect(issueParents.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords issue parents where they are a contributor',
      async ({ expectedRecords, ...user }) => {
        await insertDocument(
          buildDocument({
            contributors: {
              data: [buildContributor({ UserId: standardUser1.Id })],
            },
            issues: {
              data: [
                buildIssueParent({
                  issue: { data: buildIssue() },
                  ParentType: ParentTypeEnum.Document,
                }),
              ],
            },
          })
        );

        const issueParents = await getIssueParents({
          user,
        });
        expect(issueParents.length).toEqual(expectedRecords);
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
      '$RoleKey should fail to delete (permission granted only for backend actions)',
      async (user) => {
        const issue = buildIssue();
        await insertDocument(
          buildDocument({
            issues: {
              data: [
                buildIssueParent({
                  issue: { data: issue },
                  ParentType: ParentTypeEnum.Document,
                }),
              ],
            },
          })
        );

        await expect(
          deleteIssueParents(
            { issueId: issue.Id! },
            {
              user,
            }
          )
        ).rejects.toThrowError(
          "field 'delete_issue_parent' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
