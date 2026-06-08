import type {
  DocumentListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { ListQueryFetchFn, ServiceCallContext } from '../../types/service';

export type PoliciesService = ReturnType<typeof policiesService>;

export function policiesService(client: IClient) {
  const getPolicies: ListQueryFetchFn<
    DocumentListQueryResponse['document']
  > = async (query, ctx) => {
    const response = await client.queryDocumentList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.document, metadata: response.pageMetadata };
  };
  const getPolicyById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getDocumentById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { document, form_configuration } = response;

    return { data: document, form_configuration };
  };

  return { getPolicies, getPolicyById };
}
