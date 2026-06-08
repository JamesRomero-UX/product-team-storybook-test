import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { AppetiteInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription } from '../services/mockData';
import {
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  statement: z.string().nullish(),
  lowerAppetite: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().int().min(1).max(5).nullish()
  ),
  upperAppetite: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().int().min(1).max(5).nullish()
  ),
  impactId: nullableThirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;
type InsertType = AppetiteInsertInput;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.appetitesCount; i++) {
    records.push({
      id: (i + 1).toString(),
      lowerAppetite: faker.number.int({ min: 1, max: 5 }),
      upperAppetite: faker.number.int({ min: 1, max: 5 }),
      statement: mockDescription(),
      impactId: null,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Statement: c.statement,
    LowerAppetite: c.lowerAppetite,
    UpperAppetite: c.upperAppetite,
    Id: c.id,
    Meta: null,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    ImpactId: c.impactId,
  };
};

const sheet: Sheet<'appetites.csv', CsvType, InsertType> = {
  name: 'appetites.csv',
  schema: schema as z.ZodType<CsvType>,
  objectType: ParentTypeEnum.Appetite,
  customAttributeType: ParentTypeEnum.Appetite,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'statement',
      fieldConfigFieldId: 'Statement',
      type: 'string',
    },
    {
      key: 'lowerAppetite',
      fieldConfigFieldId: 'LowerAppetite',
      type: 'number',
    },
    {
      key: 'upperAppetite',
      fieldConfigFieldId: 'UpperAppetite',
      type: 'number',
    },
    {
      key: 'impactId',
      type: 'string',
      foreignKey: ParentTypeEnum.Impact,
    },
  ],
  mapToInsert,
  generateMockData,
};

export default sheet;
