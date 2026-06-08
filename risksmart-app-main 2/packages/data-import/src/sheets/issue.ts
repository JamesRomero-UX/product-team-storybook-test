import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { IssueInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockPastDate, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  dateTimeString,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const issueVariants = [
  ParentTypeEnum.Issue,
  ParentTypeEnum.IssueBreachLog,
  ParentTypeEnum.IssueSarLog,
  ParentTypeEnum.IssuePciBreachLog,
  ParentTypeEnum.IssueGdprBreachLog,
  ParentTypeEnum.IssueConsumerDuty,
  ParentTypeEnum.IssueCustomerTrust,
  ParentTypeEnum.IssueRiskEvent,
];

type IssueVariant = (typeof issueVariants)[number];

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  details: z.string().nullable(),
  impactsCustomer: z.boolean().nullable(),
  isExternalIssue: z.boolean().nullable(),
  dateOccurred: dateTimeString,
  dateIdentified: dateTimeString,
  dateRaised: dateTimeString.nullable(),
  CustomAttributeData,
});
type CSVType = z.infer<typeof schema>;
type InsertType = IssueInsertInput;

const generateMockData = (issueVariant: IssueVariant) => (): CSVType[] => {
  const records: CSVType[] = [];
  if (issueVariant !== ParentTypeEnum.Issue) {
    return records; // No mock data for non-Issue variants
  }
  for (let i = 0; i < generateConfig.issueCount; i++) {
    records.push({
      id: (i + 1).toString(),
      title: mockTitle(),
      details: mockDescription(),
      impactsCustomer: faker.datatype.boolean(),
      isExternalIssue: faker.datatype.boolean(),
      dateOccurred: mockPastDate(),
      dateIdentified: mockPastDate(),
      dateRaised: mockPastDate(),
    });
  }

  return records;
};

const mapToInsert =
  (issueVariant: IssueVariant) =>
  (c: CSVType, orgKey: string): InsertType => {
    const now = new Date();

    return {
      Id: c.id,
      Title: c.title,
      Details: c.details ?? '',
      ImpactsCustomer: c.impactsCustomer,
      IsExternalIssue: c.isExternalIssue,
      DateOccurred: new Date(c.dateOccurred).toISOString(),
      DateIdentified: new Date(c.dateIdentified).toISOString(),
      Type: issueVariant,
      RaisedAtTimestamp: new Date(
        c.dateRaised ? c.dateRaised : now
      ).toISOString(),
      Meta: null,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      ModifiedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      ModifiedByUser: 'SYSTEM',
      CustomAttributeData: c.CustomAttributeData,
    };
  };

const getSheet = <T extends IssueVariant>(
  issueVariant: IssueVariant
): Sheet<`${T}.csv`, CSVType, InsertType> => {
  const sheet: Sheet<`${T}.csv`, CSVType, InsertType> = {
    name: `${issueVariant as T}.csv`,
    schema,
    objectType: ParentTypeEnum.Issue,
    customAttributeType: issueVariant,
    fields: [
      {
        key: 'id',
        type: 'string',
        isPrimaryKey: true,
      },
      {
        key: 'title',
        fieldConfigFieldId: 'Title',
        type: 'string',
      },
      {
        key: 'details',
        fieldConfigFieldId: 'Details',
        type: 'string',
      },
      {
        key: 'impactsCustomer',
        fieldConfigFieldId: 'ImpactsCustomer',
        type: 'boolean',
      },
      {
        key: 'isExternalIssue',
        fieldConfigFieldId: 'IsExternalIssue',
        type: 'boolean',
      },
      {
        key: 'dateOccurred',
        fieldConfigFieldId: 'DateOccurred',
        type: 'date',
      },
      {
        key: 'dateIdentified',
        fieldConfigFieldId: 'DateIdentified',
        type: 'date',
      },
      {
        key: 'dateRaised',
        fieldConfigFieldId: 'DateRaised',
        type: 'date',
      },
    ],
    mapToInsert: mapToInsert(issueVariant),
    generateMockData: generateMockData(issueVariant),
  };

  return sheet;
};

export const issue = getSheet<typeof ParentTypeEnum.Issue>(
  ParentTypeEnum.Issue
);
export const issueBreachLog = getSheet<typeof ParentTypeEnum.IssueBreachLog>(
  ParentTypeEnum.IssueBreachLog
);
export const issueSarLog = getSheet<typeof ParentTypeEnum.IssueSarLog>(
  ParentTypeEnum.IssueSarLog
);
export const issuePciBreachLog = getSheet<
  typeof ParentTypeEnum.IssuePciBreachLog
>(ParentTypeEnum.IssuePciBreachLog);
export const issueGdprBreachLog = getSheet<
  typeof ParentTypeEnum.IssueGdprBreachLog
>(ParentTypeEnum.IssueGdprBreachLog);
export const issueConsumerDuty = getSheet<
  typeof ParentTypeEnum.IssueConsumerDuty
>(ParentTypeEnum.IssueConsumerDuty);
export const issueCustomerTrust = getSheet<
  typeof ParentTypeEnum.IssueCustomerTrust
>(ParentTypeEnum.IssueCustomerTrust);
export const issueRiskEvent = getSheet<typeof ParentTypeEnum.IssueRiskEvent>(
  ParentTypeEnum.IssueRiskEvent
);
