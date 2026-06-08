import type { IPolicy } from 'cockatiel';

import { MockAppClient } from '../auth/mock-app-client.auth';
import type {
  AppAuthClientConfig,
  ClientDataConfig,
} from '../schemas/app-config/app-config.schema';
import { mockTrpcClient } from '../trpc/mock-client';
import type { IAuthClient, IClient } from './client.interface';
import { CognitoAuthClientAdapter } from './cognito-auth-client.adapter';
import type { GraphqlMutationClientConfig } from './graphql-mutation-client.adapter';
import { createGraphqlMutationClient } from './graphql-mutation-client.adapter';
import type { IMutationClient } from './mutation-client.interface';
import { TrpcClientAdapter } from './trpc-client.adapter';

// factory for plugging in data source client.
export function createDataClient(config: ClientDataConfig): IClient {
  switch (config.clientType) {
    case 'trpc':
      return TrpcClientAdapter(config.trpcUrl || '', config.version);
    case 'mock':
      return mockTrpcClient();
    default:
      throw new Error('Unsupported client type');
  }
}
function withMutationPolicy(
  client: IMutationClient,
  policy: IPolicy
): IMutationClient {
  return {
    insertRisk: (variables, ctx) =>
      policy.execute(() => client.insertRisk(variables, ctx)),
    updateRisk: (variables, ctx) =>
      policy.execute(() => client.updateRisk(variables, ctx)),
    deleteRisk: (variables, ctx) =>
      policy.execute(() => client.deleteRisk(variables, ctx)),
    insertIndicator: (variables, ctx) =>
      policy.execute(() => client.insertIndicator(variables, ctx)),
    updateIndicator: (variables, ctx) =>
      policy.execute(() => client.updateIndicator(variables, ctx)),
    deleteIndicator: (variables, ctx) =>
      policy.execute(() => client.deleteIndicator(variables, ctx)),
    insertIndicatorResult: (variables, ctx) =>
      policy.execute(() => client.insertIndicatorResult(variables, ctx)),
    updateIndicatorResult: (variables, ctx) =>
      policy.execute(() => client.updateIndicatorResult(variables, ctx)),
    deleteIndicatorResult: (variables, ctx) =>
      policy.execute(() => client.deleteIndicatorResult(variables, ctx)),
    insertIssue: (variables, ctx) =>
      policy.execute(() => client.insertIssue(variables, ctx)),
    updateIssue: (variables, ctx) =>
      policy.execute(() => client.updateIssue(variables, ctx)),
    deleteIssue: (variables, ctx) =>
      policy.execute(() => client.deleteIssue(variables, ctx)),
    insertAction: (variables, ctx) =>
      policy.execute(() => client.insertAction(variables, ctx)),
    updateAction: (variables, ctx) =>
      policy.execute(() => client.updateAction(variables, ctx)),
    deleteActions: (variables, ctx) =>
      policy.execute(() => client.deleteActions(variables, ctx)),
    insertIssueAssessment: (variables, ctx) =>
      policy.execute(() => client.insertIssueAssessment(variables, ctx)),
    updateIssueAssessment: (variables, ctx) =>
      policy.execute(() => client.updateIssueAssessment(variables, ctx)),
  };
}

// factory for plugging in mutation client (GraphQL).
export function createMutationClient(
  config: GraphqlMutationClientConfig,
  policy: IPolicy
): IMutationClient {
  const client = createGraphqlMutationClient(config);

  return withMutationPolicy(client, policy);
}

// factory for plugging in auth client config.
export function createAuthClient(config: AppAuthClientConfig): IAuthClient {
  switch (config.clientType) {
    case 'cognito':
      return CognitoAuthClientAdapter(config);
    case 'mock':
      return new MockAppClient(config);
    default:
      throw new Error('Unsupported client type');
  }
}
