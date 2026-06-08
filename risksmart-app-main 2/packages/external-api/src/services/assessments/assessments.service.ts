import type {
  AssessmentListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { ListQueryFetchFn, ServiceCallContext } from '../../types/service';

export type AssessmentsService = ReturnType<typeof assessmentsService>;

export function assessmentsService(client: IClient) {
  const getAssessments: ListQueryFetchFn<
    AssessmentListQueryResponse['assessment']
  > = async (query, ctx) => {
    const response = await client.queryAssessmentList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.assessment, metadata: response.pageMetadata };
  };
  const getAssessmentById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getAssessmentById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { assessment, form_configuration } = response;

    return { data: assessment, form_configuration };
  };

  return { getAssessments, getAssessmentById };
}
