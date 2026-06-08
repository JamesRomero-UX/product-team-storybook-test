import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import { insertDocument } from '../clients/documentClient';
import { insertInternalAuditReports } from '../clients/internalAuditReportClient';
import {
  getDocumentInternalAuditResults,
  insertChildDocumentInternalAuditResult,
  insertDocumentInternalAuditResult,
} from '../clients/internalAuditResultsClient';
import { buildDocument } from '../data/document';
import { buildInternalAuditReport } from '../data/internalAuditReport';
import { buildDocumentInternalAuditResult } from '../data/internalAuditResult';
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

describe('documentInternalAuditResult', () => {
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
      { ...standardEnhancedUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords document internalaudit results where they are not the Owner or contributor of the internalaudit',
      async ({ expectedRecords, ...user }) => {
        const internalaudit = buildInternalAuditReport();
        await insertInternalAuditReports({
          objects: [internalaudit],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentInternalAuditResult(
          buildDocumentInternalAuditResult({
            parents: {
              data: [
                {
                  ParentId: internalaudit.Id,
                  ParentType: ParentTypeEnum.InternalAuditReport,
                  ResultType: ParentTypeEnum.DocumentInternalAuditResult,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: document.Id,
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.DocumentInternalAuditResult,
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

        const internalaudits = await getDocumentInternalAuditResults(
          {
            Id: internalaudit.Id!,
          },
          {
            user,
          }
        );

        expect(internalaudits.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords document internal audit results where they are the owner of the internalaudit',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalaudit = buildInternalAuditReport({
          owners: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalaudit],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentInternalAuditResult(
          buildDocumentInternalAuditResult({
            parents: {
              data: [
                {
                  ParentId: internalaudit.Id,
                  ParentType: ParentTypeEnum.InternalAuditReport,
                  ResultType: ParentTypeEnum.DocumentInternalAuditResult,
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

        const internalaudits = await getDocumentInternalAuditResults(
          {
            Id: internalaudit.Id!,
          },
          {
            user,
          }
        );

        expect(internalaudits.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords document internalaudit results where they are the contributor of the internalaudit',
      async ({ expectedRecords, ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalaudit = buildInternalAuditReport({
          contributors: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalaudit],
        });
        const document = buildDocument();
        await insertDocument(document);

        await insertDocumentInternalAuditResult(
          buildDocumentInternalAuditResult({
            parents: {
              data: [
                {
                  ParentId: internalaudit.Id,
                  ParentType: ParentTypeEnum.InternalAuditReport,
                  ResultType: ParentTypeEnum.DocumentInternalAuditResult,
                  OrgKey: getDefaultOrgId(),
                  CreatedByUser: getDefaultUserId(),
                  CreatedAtTimestamp: new Date().toISOString(),
                  ModifiedByUser: getDefaultUserId(),
                  ModifiedAtTimestamp: new Date().toISOString(),
                },
                {
                  ParentId: document.Id,
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.DocumentInternalAuditResult,
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

        const internalaudits = await getDocumentInternalAuditResults(
          {
            Id: internalaudit.Id!,
          },
          {
            user,
          }
        );

        expect(internalaudits.length).toEqual(expectedRecords);
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document internalaudit results',
      async ({ ...user }) => {
        const internalaudit = buildInternalAuditReport();
        await insertInternalAuditReports({
          objects: [internalaudit],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentInternalAuditResult(
          {
            ...buildDocumentInternalAuditResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            InternalAuditReportId: internalaudit.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentInternalAuditResult?.Ids
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
          "field 'insertChildDocumentInternalAuditResult' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should NOT insert document internalaudit results for non admin user when they are not an owner or contributor of the internalaudit',
      async ({ expected, ...user }) => {
        const internalaudit = buildInternalAuditReport();
        await insertInternalAuditReports({
          objects: [internalaudit],
        });
        const document = buildDocument();
        await insertDocument(document);

        await expect(
          insertChildDocumentInternalAuditResult(
            {
              ...buildDocumentInternalAuditResult({
                parents: undefined,
                Id: undefined,
                ModifiedByUser: undefined,
              }),
              DocumentIds: [document.Id as string],
              InternalAuditReportId: internalaudit.Id as string,
            },
            {
              user,
            }
          )
        ).rejects.toThrow(expected);
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document internalaudit results when user is an owner of the internalaudit',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalaudit = buildInternalAuditReport({
          owners: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalaudit],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentInternalAuditResult(
          {
            ...buildDocumentInternalAuditResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            InternalAuditReportId: internalaudit.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentInternalAuditResult?.Ids
        ).toBeDefined();
      }
    );

    it.each([{ ...riskManagerUser1 }])(
      '$RoleKey should insert document internalaudit results when user is an contributor of the internalaudit',
      async ({ ...user }) => {
        const owner = buildOwner({ UserId: user.Id });
        const internalaudit = buildInternalAuditReport({
          contributors: {
            data: [owner],
          },
        });
        await insertInternalAuditReports({
          objects: [internalaudit],
        });
        const document = buildDocument();
        await insertDocument(document);

        const result = await insertChildDocumentInternalAuditResult(
          {
            ...buildDocumentInternalAuditResult({
              parents: undefined,
              Id: undefined,
              ModifiedByUser: undefined,
            }),
            DocumentIds: [document.Id as string],
            InternalAuditReportId: internalaudit.Id as string,
          },
          {
            user,
          }
        );
        expect(
          result.data?.insertChildDocumentInternalAuditResult?.Ids
        ).toBeDefined();
      }
    );
  });
});
