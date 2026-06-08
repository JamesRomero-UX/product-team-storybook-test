import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ActionStatusEnum } from 'generated/graphql';
import { intTest } from 'src/testing/integration/intTest';
import { stub } from 'src/testing/stub';

import { lambdaHandler } from './post';

describe('actions post', () => {
  intTest(
    'can save an action',
    async ({ org1, riskManager1, adminApiClient }) => {
      const result = await lambdaHandler({
        action: { name: '.' },
        input: {
          DateDue: '2011-01-01',
          Title: 'Action',
          Status: ActionStatusEnum.Closed,
          DateRaised: '2011-01-01',
          ClosedDate: null,
          ContributorUserIds: [],
          ContributorGroupIds: [],
          OwnerGroupIds: [],
          OwnerUserIds: [],
          TagTypeIds: [],
          DepartmentTypeIds: [],
        },
        event: stub<APIGatewayProxyEventV2>(),
        session_variables: {
          'x-hasura-org-id': org1,
          'x-hasura-tenant-name': 'MultiTenant',
          'x-hasura-role': 'RiskManager',
          'x-hasura-user-id': riskManager1,
        },
      });
      expect(result.statusCode).toEqual(200);

      const { action } = await adminApiClient.getActions({
        where: { OrgKey: { _eq: org1 } },
      });
      expect(action.length).toEqual(1);
      expect(action[0]?.Title).toEqual('Action');
    }
  );
});
