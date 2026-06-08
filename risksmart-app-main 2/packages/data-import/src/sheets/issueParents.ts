import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { IssueParentInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockUniqueCompositeId } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  parentId: thirdPartyIdSchema,
  parentType: z.nativeEnum(ParentTypeEnum),
  issueId: thirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;
type InsertType = IssueParentInsertInput;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  const generateUniqueIds = mockUniqueCompositeId();

  for (let i = 1; i <= generateConfig.issueParentsCount; i++) {
    const parentType: ParentTypeEnum = faker.helpers.arrayElement([
      ParentTypeEnum.Obligation,
      ParentTypeEnum.Control,
    ]);
    const ids = generateUniqueIds(ParentTypeEnum.Issue, parentType);
    records.push({
      parentType: parentType,
      issueId: ids.childId,
      parentId: ids.parentId,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    ParentId: c.parentId,
    IssueId: c.issueId,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    ParentType: c.parentType,
  };
};

const sheet: Sheet<'issueParents.csv', CsvType, InsertType> = {
  name: 'issueParents.csv',
  schema,
  fields: [
    {
      key: 'parentId',
      type: 'string',
      keyDependantForeignKey: 'parentType',
    },
    {
      key: 'parentType',
      fieldConfigFieldId: 'ParentType',
      type: 'string',
    },
    {
      key: 'issueId',
      type: 'string',
      foreignKey: ParentTypeEnum.Issue,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['issueId', 'parentId'],
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
