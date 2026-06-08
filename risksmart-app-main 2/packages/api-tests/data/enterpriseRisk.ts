import { randomUUID } from 'crypto';

import type { InsertEnterpriseRiskInput } from '../generated/graphql2';

const defaultEnterpriseRisk: InsertEnterpriseRiskInput & { Id: string } = {
  Description: 'Risk description',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,
  ParentId: undefined,
  Tier: 1,
  Title: 'Risk Title',
  Meta: undefined,
};

export const buildEnterpriseRisk = (
  overrides: Partial<InsertEnterpriseRiskInput> = {}
): InsertEnterpriseRiskInput & { Id: string } => {
  return {
    ...defaultEnterpriseRisk,
    Id: randomUUID(),
    ...overrides,
  };
};
