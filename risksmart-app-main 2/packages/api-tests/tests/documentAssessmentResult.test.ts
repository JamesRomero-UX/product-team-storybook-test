import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertAssessments } from '../clients/assessmentClient';
import {
  getDocumentAssessmentResults,
  insertChildDocumentAssessmentResult,
  insertDocumentAssessmentResult,
} from '../clients/assessmentResultsClient';
import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import { insertDocument } from '../clients/documentClient';
import { buildAssessment } from '../data/assessment';
import { buildDocumentAssessmentResult } from '../data/assessmentResult';
import { buildDocument } from '../data/document';
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

describe('documentAssessmentResult', () => {
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
    ])(
      '$RoleKey should see $expectedRecords document assessment results where they are not the Owner or contributor of the assessment',
      async ({ expectedRecords, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentAssessmentResult(
          buildDocumentAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: document.Id,
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
              ],
            },
          })
        );

        const assessments = await getDocumentAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
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
      '$RoleKey should see $expectedRecords document assessment results where they are the owner of the assessment',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentAssessmentResult(
          buildDocumentAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: document.Id,
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
              ],
            },
          })
        );

        const assessments = await getDocumentAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
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
      '$RoleKey should see $expectedRecords document assessment results where they are the contributor of the assessment',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentAssessmentResult(
          buildDocumentAssessmentResult({
            parents: {
              data: [
                {
                  ParentId: assessment.Id,
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: document.Id,
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.Document,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
              ],
            },
          })
        );

        const assessments = await getDocumentAssessmentResults(
          {
            ParentId: assessment.Id!,
          },
          {
            user,
          }
        );

        expect(assessments.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document assessment results',
      async ({ ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentAssessmentResult(
          {
            ...buildDocumentAssessmentResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            AssessmentId: assessment.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentAssessmentResult?.Ids
        ).toBeDefined();
      }
    );

    it.each([
      {
        ...standardUser1,
        expected: 'Access denied',
      },
      {
        ...readOnlyUser1,
        expected:
          "field 'insertChildDocumentAssessmentResult' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should NOT insert document assessment results for non admin user when they are not an owner or contributor of the assessment',
      async ({ expected, ...user }) => {
        const assessment = buildAssessment();
        await insertAssessments({
          objects: [assessment],
        });
        const document = buildDocument();
        await insertDocument(document);

        await expect(
          insertChildDocumentAssessmentResult(
            {
              ...buildDocumentAssessmentResult({
                parents: undefined,
                Id: undefined,
                ModifiedByUser: undefined,
              }),
              DocumentIds: [document.Id as string],
              AssessmentId: assessment.Id as string,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(expected);
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document assessment results when user is an owner of the assessment',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentAssessmentResult(
          {
            ...buildDocumentAssessmentResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            AssessmentId: assessment.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentAssessmentResult?.Ids
        ).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document assessment results when user is an contributor of the assessment',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const assessment = buildAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertAssessments({
          objects: [assessment],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentAssessmentResult(
          {
            ...buildDocumentAssessmentResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            AssessmentId: assessment.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentAssessmentResult?.Ids
        ).toBeDefined();
      }
    );
  });
});
