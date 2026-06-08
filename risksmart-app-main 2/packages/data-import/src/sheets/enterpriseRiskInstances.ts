import { z } from 'zod';

import type {
  EnterpriseRiskInstanceInsertInput,
  EnterpriseRiskInstanceUpdates,
} from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import {
  nullableThirdPartyIdSchema,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  riskId: thirdPartyIdSchema,
  entityId: thirdPartyIdSchema,
  enterpriseRiskId: nullableThirdPartyIdSchema,
});

type CsvType = z.infer<typeof schema>;
type InsertType = EnterpriseRiskInstanceInsertInput;
type UpdateType = EnterpriseRiskInstanceUpdates;

const generateMockData = () => {
  const records: CsvType[] = [];

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    RiskId: c.riskId,
    EntityId: c.entityId,
    EnterpriseRiskId: c.enterpriseRiskId,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

const mapToUpdate = (c: CsvType, orgKey: string): UpdateType => {
  return {
    where: { RiskId: { _eq: c.riskId } },
    _set: {
      EnterpriseRiskId: c.enterpriseRiskId,
      EntityId: c.entityId,
      OrgKey: orgKey,
      CreatedAtTimestamp: undefined,
      ModifiedAtTimestamp: undefined,
      CreatedByUser: 'SYSTEM',
      ModifiedByUser: 'SYSTEM',
    },
  };
};

export const sheet: Sheet<
  'enterpriseRiskInstances.csv',
  CsvType,
  InsertType,
  UpdateType
> = {
  name: 'enterpriseRiskInstances.csv',
  schema,
  fields: [
    {
      key: 'riskId',
      type: 'string',
      foreignKey: ParentTypeEnum.Risk,
    },
    {
      key: 'entityId',
      type: 'string',
      foreignKey: ParentTypeEnum.Entity,
    },
    {
      key: 'enterpriseRiskId',
      type: 'string',
      foreignKey: ParentTypeEnum.EnterpriseRisk,
    },
  ],
  constraints: [
    {
      type: 'unique',
      fields: ['riskId', 'entityId'],
    },
  ],
  generateMockData,
  mapToInsert,
  mapToUpdate,
};
export default sheet;
