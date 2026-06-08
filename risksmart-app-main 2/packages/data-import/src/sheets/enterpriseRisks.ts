import { z } from 'zod';

import type {
  EnterpriseRiskInsertInput,
  EnterpriseRiskUpdates,
} from '../../generated/graphql';
import { ParentTypeEnum, RiskTreatmentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string(),
  description: z.string().nullish(),
  tier: z.number(),
  parentRiskId: nullableThirdPartyIdSchema,
  treatment: z.nativeEnum(RiskTreatmentTypeEnum).nullish(),
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;

const superRefinement: z.SuperRefinement<CsvType> = (values, ctx) => {
  if (values.tier > 1 && !values.parentRiskId) {
    ctx.addIssue({
      message: 'Required if tier is greater than 1',
      code: z.ZodIssueCode.custom,
      path: ['parentRiskId'],
    });
  }
  if (values.tier === 1 && values.parentRiskId) {
    ctx.addIssue({
      message: 'Tier 1 risk cannot have a parent',
      code: z.ZodIssueCode.custom,
      path: ['parentRiskId'],
    });
  }
};

type InsertType = EnterpriseRiskInsertInput;
type UpdateType = EnterpriseRiskUpdates;

const generateMockData = () => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.riskCount; i++) {
    const id = i + 1;
    const tier = (i % 3) + 1;
    let parentRiskId: string | null = null;
    if (tier > 1) {
      parentRiskId = (id - 1).toString();
    }

    records.push({
      id: id.toString(),
      title: mockTitle(),
      description: mockDescription(),
      tier,
      parentRiskId,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Description: c.description,
    Id: c.id,
    Meta: null,
    OrgKey: orgKey,
    ParentId: c.parentRiskId,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    Title: c.title,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    Treatment: c.treatment,
    Tier: c.tier,
    CustomAttributeData: c.CustomAttributeData,
  };
};

const mapToUpdate = (c: CsvType, orgKey: string): UpdateType => {
  return {
    where: { Id: { _eq: c.id } },
    _set: {
      Description: c.description,
      Meta: null,
      OrgKey: orgKey,
      ParentId: c.parentRiskId,
      CreatedAtTimestamp: undefined,
      ModifiedAtTimestamp: undefined,
      Title: c.title,
      CreatedByUser: 'SYSTEM',
      ModifiedByUser: 'SYSTEM',
      Tier: c.tier,
      Treatment: c.treatment,
      CustomAttributeData: c.CustomAttributeData,
    },
  };
};

export const sheet: Sheet<
  'enterpriseRisks.csv',
  CsvType,
  InsertType,
  UpdateType
> = {
  name: 'enterpriseRisks.csv',
  customAttributeType: ParentTypeEnum.Risk, // Not a typo, they share custom attributes
  schema,
  superRefinement,
  objectType: ParentTypeEnum.EnterpriseRisk,
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
      key: 'tier',
      fieldConfigFieldId: 'Tier',
      type: 'number',
    },
    {
      key: 'parentRiskId',
      type: 'string',
      foreignKey: ParentTypeEnum.EnterpriseRisk,
    },
    {
      key: 'treatment',
      type: 'string',
    },
  ],
  generateMockData,
  mapToInsert,
  mapToUpdate,
};
export default sheet;
