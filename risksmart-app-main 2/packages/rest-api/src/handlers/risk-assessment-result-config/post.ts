import { InsertRiskAssessmentResultConfigDocument } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';

import { PostRiskAssessmentResultConfigSchema } from './schema';

export const handler = backendRouteHandler(
  PostRiskAssessmentResultConfigSchema,
  async (request) => {
    const hasuraClient = getHasuraBackendClientForAction(request);

    const result = await hasuraClient.mutate({
      mutation: InsertRiskAssessmentResultConfigDocument,
      variables: {
        object: {
          Config: request.input.Config,
        },
      },
    });

    const inserted = result.data?.insert_risk_assessment_result_config_one;
    if (!inserted) {
      throw new Error('Failed to insert risk assessment result configuration');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: inserted.Id,
        Version: inserted.Version,
        IsLatest: inserted.IsLatest,
      }),
    };
  }
);
