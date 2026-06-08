import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type {
  ObligationInsertInput,
  ObligationUpdates,
} from '../../generated/graphql';
import { ObligationTypeEnum, ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const REQUIRED_MESSAGE = 'Required';
const ADHERENCE_ENUM = [
  'mandatory',
  'advised',
  'flexible',
  'bestPractice',
] as const;

const checkForRequiredParentId = (
  {
    type,
    parentId,
  }: { type: ObligationTypeEnum; parentId: string | null | undefined },
  ctx: z.RefinementCtx
) => {
  if (type !== ObligationTypeEnum.Standard && !parentId) {
    ctx.addIssue({
      message: REQUIRED_MESSAGE,
      code: z.ZodIssueCode.custom,
      path: ['ParentId'],
    });
  }
};
const checkForRequiredDescription = (
  {
    type,
    description,
  }: { type: ObligationTypeEnum; description: string | null | undefined },
  ctx: z.RefinementCtx
) => {
  if (type === ObligationTypeEnum.Rule && !description) {
    ctx.addIssue({
      message: REQUIRED_MESSAGE,
      code: z.ZodIssueCode.custom,
      path: ['Description'],
    });
  }
};

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string().min(1),
  description: z.string().nullable(),
  type: z.nativeEnum(ObligationTypeEnum),
  parentId: nullableThirdPartyIdSchema,
  adherence: z.enum(ADHERENCE_ENUM),
  interpretation: z.string().nullish(),
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

const superRefinement: z.SuperRefinement<CsvType> = (values, ctx) => {
  checkForRequiredParentId(
    { type: values.type, parentId: values.parentId },
    ctx
  );
  checkForRequiredDescription(
    { type: values.type, description: values.description },
    ctx
  );
};

type InsertType = ObligationInsertInput;
type UpdateType = ObligationUpdates;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.obligationsCount; i++) {
    const id = i + 1;
    const type = i % 3;
    const types = [
      ObligationTypeEnum.Standard,
      ObligationTypeEnum.Chapter,
      ObligationTypeEnum.Rule,
    ];
    let parentObligationId: string | null = null;
    if (type > 0) {
      parentObligationId = (id - 1).toString();
    }

    records.push({
      id: id.toString(),
      title: mockTitle(),
      description: mockDescription(),
      interpretation: mockDescription(),
      type: types[type] ?? ObligationTypeEnum.Standard,
      adherence: faker.helpers.arrayElement(ADHERENCE_ENUM),
      parentId: parentObligationId,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Adherence: c.adherence,
    CreatedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
    Description: c.description ?? '',
    Id: c.id,
    Interpretation: c.interpretation,
    ModifiedAtTimestamp: undefined,
    ModifiedByUser: 'SYSTEM',
    OrgKey: orgKey,
    ParentId: c.parentId,
    Title: c.title,
    Type: c.type,
  };
};

const mapToUpdate = (c: CsvType, orgKey: string): UpdateType => {
  return {
    where: { Id: { _eq: c.id } },
    _set: {
      Adherence: c.adherence,
      CreatedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      CustomAttributeData: c.CustomAttributeData,
      Description: c.description,
      Interpretation: c.interpretation,
      ModifiedAtTimestamp: undefined,
      ModifiedByUser: 'SYSTEM',
      OrgKey: orgKey,
      ParentId: c.parentId,
      Title: c.title,
      Type: c.type,
    },
  };
};

const sheet: Sheet<'obligations.csv', CsvType, InsertType> = {
  name: 'obligations.csv',
  schema,
  superRefinement,
  objectType: ParentTypeEnum.Obligation,
  customAttributeType: ParentTypeEnum.Obligation,

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
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
    {
      key: 'type',
      fieldConfigFieldId: 'Type',
      type: 'string',
    },
    {
      key: 'parentId',
      type: 'date',
      foreignKey: ParentTypeEnum.Obligation,
    },
    {
      key: 'adherence',
      fieldConfigFieldId: 'Adherence',
      type: 'string',
    },
    {
      key: 'interpretation',
      fieldConfigFieldId: 'Interpretation',
      type: 'string',
    },
  ],
  mapToInsert,
  mapToUpdate,
  generateMockData,
};

export default sheet;
