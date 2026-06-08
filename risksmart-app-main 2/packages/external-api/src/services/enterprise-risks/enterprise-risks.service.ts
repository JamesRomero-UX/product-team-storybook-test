import type {
  EnterpriseRiskChildRiskListQueryResponse,
  EnterpriseRiskListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type {
  LinkedListQueryFetchFn,
  ListQueryFetchFn,
  ServiceCallContext,
} from '../../types/service';

export type EnterpriseRisksService = ReturnType<typeof enterpriseRisksService>;

export function enterpriseRisksService(client: IClient) {
  const getEnterpriseRisksChildRisks: LinkedListQueryFetchFn<
    EnterpriseRiskChildRiskListQueryResponse['risk']
  > = async (linkId, query, ctx) => {
    const response = await client.queryEnterpriseChildRisks(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
        linkId,
      }
    );

    return { data: response.risk, metadata: response.pageMetadata };
  };

  const getEnterpriseRisks: ListQueryFetchFn<
    EnterpriseRiskListQueryResponse['enterpriseRisk']
  > = async (query, ctx) => {
    const response = await client.queryEnterpriseRiskList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.enterpriseRisk, metadata: response.pageMetadata };
  };

  const getEnterpriseRiskById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getEnterpriseRiskById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { enterpriseRisk, form_configuration } = response;

    return { data: enterpriseRisk, form_configuration };
  };

  return {
    getEnterpriseRisks,
    getEnterpriseRiskById,
    getEnterpriseRisksChildRisks,
  };
}
