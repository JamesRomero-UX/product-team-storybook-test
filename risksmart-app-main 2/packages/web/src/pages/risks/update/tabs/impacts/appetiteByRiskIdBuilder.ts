import {
  Appetite_Status_Enum,
  type GetAppetitesByRiskIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

type AppetiteByRiskId = GetAppetitesByRiskIdQuery['appetite_parent'][number];

const defaultAppetiteByRiskId: AppetiteByRiskId = {
  Status: Appetite_Status_Enum.Active,
  appetite: {
    Id: '3e2cf5e6-70f5-407a-b546-904a76dbea7f',
    LowerAppetite: 1,
    UpperAppetite: 1,
    ImpactAppetite: 3,
    LikelihoodAppetite: null,
    Statement: '',
    EffectiveDate: '2024-02-01T00:00:00+00:00',
    AppetiteType: 'impact',
    CreatedAtTimestamp: '2024-10-07T13:26:59.013602+00:00',
    ModifiedAtTimestamp: '2024-10-07T13:38:57.764053+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    SequentialId: 20005,
    __typename: 'appetite',
    modifiedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    impact: { Id: 'b8c75086-2fb2-47f1-9194-6ceacf99b224', Name: '' },
  },
};

export const buildAppetiteByRiskId = (
  appetiteOverrides: Partial<AppetiteByRiskId['appetite']> = {}
): AppetiteByRiskId => ({
  ...defaultAppetiteByRiskId,
  appetite: {
    ...defaultAppetiteByRiskId.appetite!,
    ...appetiteOverrides,
  },
});
