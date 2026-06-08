import {
  Risk_Status_Type_Enum,
  Risk_Treatment_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { RiskFormDataFields } from './riskSchema';
import { RiskFormSchema } from './riskSchema';

const risk: RiskFormDataFields = {
  Owners: [
    {
      value: 'Owner',
      type: 'user',
    },
  ],
  Title: 'Title',
  Description: 'Description',
  Treatment: Risk_Treatment_Type_Enum.Treat,
  Status: Risk_Status_Type_Enum.Active,
  Contributors: [],
  Tier: 1,
  ParentRiskId: null,
  ancestorContributors: [],
  tags: [],
  departments: [],
  schedule: {},
};

const ParentRiskId = '123e4567-e89b-12d3-a456-426614174000';

describe('Risks Schema', () => {
  test('Tier 1 Risks must have no ParentRiskId', () => {
    const input = {
      ...risk,
      Tier: 1,
    };
    expect(RiskFormSchema.parse(input)).toStrictEqual(input);
    expect(() =>
      RiskFormSchema.parse({
        ...input,
        ParentRiskId,
      })
    ).toThrow();
  });

  test('Tier 2 Risks must have a ParentRiskId', () => {
    const input = {
      ...risk,
      Tier: 2,
      ParentRiskId,
    };
    expect(RiskFormSchema.parse(input)).toStrictEqual(input);

    expect(() =>
      RiskFormSchema.parse({ ...input, ParentRiskId: null })
    ).toThrow();
  });

  test('Tier 3 Risks must have a ParentRiskId', () => {
    const input = {
      ...risk,
      Tier: 3,
      ParentRiskId,
    };
    expect(RiskFormSchema.parse(input)).toStrictEqual(input);

    expect(() =>
      RiskFormSchema.parse({ ...input, ParentRiskId: null })
    ).toThrow();
  });
});
