import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { AcceptanceInsertInput } from '../../generated/graphql';
import { AcceptanceStatusEnum, ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockPastDate, mockTitle } from '../services/mockData';
import { dateTimeString, thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  details: z.string(),
  dateAcceptedFrom: dateTimeString,
  dateAcceptedTo: dateTimeString,
  status: z.nativeEnum(AcceptanceStatusEnum),
  parentRiskId: thirdPartyIdSchema,
});
type CsvType = z.infer<typeof schema>;
type InsertType = AcceptanceInsertInput;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.acceptanceCount; i++) {
    records.push({
      id: (i + 1).toString(),
      title: mockTitle(),
      status: faker.helpers.enumValue(AcceptanceStatusEnum),
      details: mockDescription(),
      dateAcceptedFrom: mockPastDate(),
      dateAcceptedTo: mockPastDate(),
      parentRiskId: faker.number
        .int({ min: 1, max: generateConfig.riskCount })
        .toString(),
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Details: c.details,
    DateAcceptedFrom: c.dateAcceptedFrom,
    DateAcceptedTo: c.dateAcceptedTo,
    Id: c.id,
    Meta: null,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    Title: c.title,
    Status: c.status,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

const sheet: Sheet<'acceptances.csv', CsvType, InsertType> = {
  name: 'acceptances.csv',
  schema,
  objectType: ParentTypeEnum.Acceptance,
  customAttributeType: ParentTypeEnum.Acceptance,

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
      key: 'dateAcceptedFrom',
      fieldConfigFieldId: 'DateAcceptedFrom',
      type: 'date',
    },
    {
      key: 'dateAcceptedTo',
      fieldConfigFieldId: 'DateAcceptedTo',
      type: 'date',
    },
    {
      key: 'parentRiskId',
      type: 'date',
      foreignKey: ParentTypeEnum.Risk,
    },
    {
      key: 'status',
      fieldConfigFieldId: 'Status',
      type: 'string',
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
