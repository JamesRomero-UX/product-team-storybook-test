import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { IssueAssessmentInsertInput } from '../../generated/graphql';
import {
  IssueAssessmentStatusEnum,
  ParentTypeEnum,
} from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockPastDate, mockTitle, mockUser } from '../services/mockData';
import {
  CustomAttributeData,
  dateTimeString,
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

type InsertType = IssueAssessmentInsertInput;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const issueAssessmentVariants = [
  ParentTypeEnum.IssueAssessment,
  ParentTypeEnum.IssueAssessmentBreachLog,
  ParentTypeEnum.IssueAssessmentSarLog,
  ParentTypeEnum.IssueAssessmentPciBreachLog,
  ParentTypeEnum.IssueAssessmentGdprBreachLog,
  ParentTypeEnum.IssueAssessmentConsumerDuty,
  ParentTypeEnum.IssueAssessmentCustomerTrust,
  ParentTypeEnum.IssueAssessmentRiskEvent,
];

type IssueAssessmentVariant = (typeof issueAssessmentVariants)[number];

const schema = z.object({
  id: thirdPartyIdSchema,
  parentIssueId: thirdPartyIdSchema,
  issueType: z
    .enum([
      'near-miss',
      'material-impact',
      'internal-audit-finding',
      'compliance-finding',
      'control-test-finding',
    ])
    .nullable(),
  severity: z.number().int().min(1).max(5).nullable(),
  targetCloseDate: dateTimeString.nullable(),
  actualCloseDate: dateTimeString.nullable(),
  status: z.nativeEnum(IssueAssessmentStatusEnum).nullable(),
  certifiedIndividual: nullableThirdPartyIdSchema,
  regulatoryBreach: z.boolean().nullable(),
  regulationsBreached: z.string().nullable(),
  reportable: z.boolean().nullable(),
  rationale: z.string().nullable(),
  issueCausedByThirdParty: z.boolean().nullable(),
  thirdPartyResponsible: z.string().nullable(),
  issueCausedBySystemIssue: z.boolean().nullable(),
  systemResponsible: z.string().nullable(),
  policyBreach: z.boolean().nullable(),
  policiesBreached: z.string().nullable(),
  policyOwner: nullableThirdPartyIdSchema,
  policyOwnerCommentary: z.string().nullable(),
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

const mapToInsert =
  (issueAssessmentVariant: IssueAssessmentVariant) =>
  (c: CsvType, orgKey: string): InsertType => {
    return {
      Id: c.id,
      ParentIssueId: c.parentIssueId,
      IssueType: c.issueType,
      Type: issueAssessmentVariant,
      Severity: c.severity,
      TargetCloseDate: c.targetCloseDate,
      ActualCloseDate: c.actualCloseDate,
      Status: c.status,
      CertifiedIndividual: c.certifiedIndividual,
      RegulationsBreached: c.regulationsBreached,
      RegulatoryBreach: c.regulatoryBreach,
      Reportable: c.reportable,
      IssueCausedBySystemIssue: c.issueCausedBySystemIssue,
      IssueCausedByThirdParty: c.issueCausedByThirdParty,
      PoliciesBreached: c.policiesBreached,
      PolicyBreach: c.policyBreach,
      PolicyOwnerCommentary: c.policyOwnerCommentary,
      PolicyOwner: c.policyOwner,
      ThirdPartyResponsible: c.thirdPartyResponsible,
      Rationale: c.rationale,
      SystemResponsible: c.systemResponsible,
      Meta: null,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      ModifiedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      ModifiedByUser: 'SYSTEM',
      CustomAttributeData: c.CustomAttributeData,
    };
  };

const generateMockData =
  (issueAssessmentVariant: IssueAssessmentVariant) => (): CsvType[] => {
    if (issueAssessmentVariant !== ParentTypeEnum.IssueAssessment) {
      return []; // No mock data for non-IssueAssessment variants
    }
    const records: CsvType[] = [];
    for (let i = 0; i < generateConfig.issueCount; i++) {
      records.push({
        id: (i + 1).toString(),
        parentIssueId: (i + 1).toString(),
        issueType: faker.helpers.arrayElement([
          'near-miss',
          'material-impact',
          'internal-audit-finding',
          'compliance-finding',
          'control-test-finding',
        ]),
        severity: faker.number.int({ min: 1, max: 5 }),
        targetCloseDate: mockPastDate(),
        actualCloseDate: mockPastDate(),
        status: faker.helpers.enumValue(IssueAssessmentStatusEnum),
        certifiedIndividual: mockUser(),
        regulatoryBreach: faker.datatype.boolean(),
        regulationsBreached: mockTitle(),
        reportable: faker.datatype.boolean(),
        rationale: mockTitle(),
        issueCausedByThirdParty: faker.datatype.boolean(),
        thirdPartyResponsible: mockTitle(),
        issueCausedBySystemIssue: faker.datatype.boolean(),
        systemResponsible: mockTitle(),
        policyBreach: faker.datatype.boolean(),
        policiesBreached: mockTitle(),
        policyOwner: mockUser(),
        policyOwnerCommentary: mockTitle(),
      });
    }

    return records;
  };

const getSheet = <T extends IssueAssessmentVariant>(
  issueAssessmentVariant: IssueAssessmentVariant
): Sheet<`${T}.csv`, CsvType, InsertType> => {
  const sheet: Sheet<`${T}.csv`, CsvType, InsertType> = {
    name: `${issueAssessmentVariant as T}.csv`,
    schema,
    objectType: ParentTypeEnum.IssueAssessment,
    customAttributeType: issueAssessmentVariant,
    fields: [
      {
        key: 'id',
        type: 'string',
        isPrimaryKey: true,
      },
      {
        key: 'parentIssueId',
        type: 'string',
        foreignKey: ParentTypeEnum.Issue,
      },
      {
        key: 'issueType',
        fieldConfigFieldId: 'IssueType',
        type: 'string',
      },
      {
        key: 'severity',
        fieldConfigFieldId: 'Severity',
        type: 'number',
      },
      {
        key: 'targetCloseDate',
        fieldConfigFieldId: 'TargetCloseDate',
        type: 'date',
      },
      {
        key: 'actualCloseDate',
        fieldConfigFieldId: 'ActualCloseDate',
        type: 'date',
      },
      {
        key: 'status',
        fieldConfigFieldId: 'Status',
        type: 'string',
      },
      {
        key: 'certifiedIndividual',
        fieldConfigFieldId: 'CertifiedIndividual',
        type: 'string',
        foreignKey: ParentTypePlus.User,
      },
      {
        key: 'regulatoryBreach',
        fieldConfigFieldId: 'RegulatoryBreach',
        type: 'boolean',
      },
      {
        key: 'regulationsBreached',
        fieldConfigFieldId: 'RegulationsBreached',
        type: 'string',
      },
      {
        key: 'reportable',
        fieldConfigFieldId: 'Reportable',
        type: 'boolean',
      },
      {
        key: 'rationale',
        fieldConfigFieldId: 'Rationale',
        type: 'string',
      },
      {
        key: 'issueCausedByThirdParty',
        fieldConfigFieldId: 'IssueCausedByThirdParty',
        type: 'boolean',
      },
      {
        key: 'thirdPartyResponsible',
        fieldConfigFieldId: 'ThirdPartyResponsible',
        type: 'string',
      },
      {
        key: 'issueCausedBySystemIssue',
        fieldConfigFieldId: 'IssueCausedBySystemIssue',
        type: 'boolean',
      },
      {
        key: 'systemResponsible',
        fieldConfigFieldId: 'SystemResponsible',
        type: 'string',
      },
      {
        key: 'policyBreach',
        fieldConfigFieldId: 'PolicyBreach',
        type: 'boolean',
      },
      {
        key: 'policiesBreached',
        fieldConfigFieldId: 'PoliciesBreached',
        type: 'string',
      },
      {
        key: 'policyOwner',
        fieldConfigFieldId: 'PolicyOwner',
        type: 'string',
        foreignKey: ParentTypePlus.User,
      },
      {
        key: 'policyOwnerCommentary',
        fieldConfigFieldId: 'PolicyOwnerCommentary',
        type: 'string',
      },
    ],
    generateMockData: generateMockData(issueAssessmentVariant),
    mapToInsert: mapToInsert(issueAssessmentVariant),
  };

  return sheet;
};

export const issueAssessment = getSheet<typeof ParentTypeEnum.IssueAssessment>(
  ParentTypeEnum.IssueAssessment
);
export const issueAssessmentBreachLog = getSheet<
  typeof ParentTypeEnum.IssueAssessmentBreachLog
>(ParentTypeEnum.IssueAssessmentBreachLog);
export const issueAssessmentSarLog = getSheet<
  typeof ParentTypeEnum.IssueAssessmentSarLog
>(ParentTypeEnum.IssueAssessmentSarLog);
export const issueAssessmentPciBreachLog = getSheet<
  typeof ParentTypeEnum.IssueAssessmentPciBreachLog
>(ParentTypeEnum.IssueAssessmentPciBreachLog);
export const issueAssessmentGdprBreachLog = getSheet<
  typeof ParentTypeEnum.IssueAssessmentGdprBreachLog
>(ParentTypeEnum.IssueAssessmentGdprBreachLog);
export const issueAssessmentConsumerDuty = getSheet<
  typeof ParentTypeEnum.IssueAssessmentConsumerDuty
>(ParentTypeEnum.IssueAssessmentConsumerDuty);
export const issueAssessmentCustomerTrust = getSheet<
  typeof ParentTypeEnum.IssueAssessmentCustomerTrust
>(ParentTypeEnum.IssueAssessmentCustomerTrust);
export const issueAssessmentRiskEvent = getSheet<
  typeof ParentTypeEnum.IssueAssessmentRiskEvent
>(ParentTypeEnum.IssueAssessmentRiskEvent);
