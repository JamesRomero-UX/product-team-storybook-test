import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { insertComplianceMonitoringAssessments } from '../clients/complianceMonitoringAssessmentClient';
import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import { insertDocument } from '../clients/documentClient';
import {
  getDocumentSecondLineResults,
  insertChildDocumentSecondLineResult,
  insertDocumentSecondLineResult,
} from '../clients/secondLineResultsClient';
import { buildComplianceMonitoringAssessment } from '../data/complianceMonitoringAssessment';
import { buildDocument } from '../data/document';
import { buildOwner } from '../data/owner';
import { buildDocumentSecondLineResult } from '../data/secondLineResult';
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

describe('documentSecondLineResult', () => {
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
      '$RoleKey should see $expectedRecords document secondLine results where they are not the Owner or contributor of the secondLine',
      async ({ expectedRecords, ...user }) => {
        const secondLine = buildComplianceMonitoringAssessment();
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentSecondLineResult(
          buildDocumentSecondLineResult({
            parents: {
              data: [
                {
                  ParentId: secondLine.Id,
                  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                  ResultType: ParentTypeEnum.DocumentSecondLineResult,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: document.Id,
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.DocumentSecondLineResult,
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

        const secondLines = await getDocumentSecondLineResults(
          {
            Id: secondLine.Id!,
          },
          {
            user,
          }
        );

        expect(secondLines.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords document secondLine results where they are the owner of the secondLine',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentSecondLineResult(
          buildDocumentSecondLineResult({
            parents: {
              data: [
                {
                  ParentId: secondLine.Id,
                  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                  ResultType: ParentTypeEnum.DocumentSecondLineResult,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: document.Id,
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.DocumentSecondLineResult,
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

        const secondLines = await getDocumentSecondLineResults(
          {
            Id: secondLine.Id!,
          },
          {
            user,
          }
        );

        expect(secondLines.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords document secondLine results where they are the contributor of the secondLine',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentSecondLineResult(
          buildDocumentSecondLineResult({
            parents: {
              data: [
                {
                  ParentId: secondLine.Id,
                  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                  ResultType: ParentTypeEnum.DocumentSecondLineResult,
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

        const secondLines = await getDocumentSecondLineResults(
          {
            Id: secondLine.Id!,
          },
          {
            user,
          }
        );

        expect(secondLines.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document secondLine results',
      async ({ ...user }) => {
        const secondLine = buildComplianceMonitoringAssessment();
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentSecondLineResult(
          {
            ...buildDocumentSecondLineResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            ComplianceMonitoringAssessmentId: secondLine.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentSecondLineResult?.Ids
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
          "field 'insertChildDocumentSecondLineResult' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should NOT insert document secondLine results for non admin user when they are not an owner or contributor of the secondLine',
      async ({ expected, ...user }) => {
        const secondLine = buildComplianceMonitoringAssessment();
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const document = buildDocument();
        await insertDocument(document);

        await expect(
          insertChildDocumentSecondLineResult(
            {
              ...buildDocumentSecondLineResult({
                parents: undefined,
                Id: undefined,
                ModifiedByUser: undefined,
              }),
              DocumentIds: [document.Id as string],
              ComplianceMonitoringAssessmentId: secondLine.Id as string,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(expected);
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document secondLine results when user is an owner of the secondLine',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          owners: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentSecondLineResult(
          {
            ...buildDocumentSecondLineResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            ComplianceMonitoringAssessmentId: secondLine.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentSecondLineResult?.Ids
        ).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document secondLine results when user is an contributor of the secondLine',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const secondLine = buildComplianceMonitoringAssessment({
          contributors: {
            data: [owner],
          },
        });
        await insertComplianceMonitoringAssessments({
          objects: [secondLine],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentSecondLineResult(
          {
            ...buildDocumentSecondLineResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            ComplianceMonitoringAssessmentId: secondLine.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentSecondLineResult?.Ids
        ).toBeDefined();
      }
    );
  });
});
