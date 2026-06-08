import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type { OwnershipFilter } from '../../routers/frontend/my-items.router';
import type { MyDueItemsResponse } from '../../types/index';
import type { MyItemsService, ServiceContext } from '../service.types';

export class MyItemsServiceImpl implements MyItemsService {
  async getMyDueItems(
    ctx: ServiceContext,
    date: string,
    userId: string,
    ownershipFilter: OwnershipFilter
  ): Promise<MyDueItemsResponse> {
    const apiContext = toApiContext(ctx);

    const [
      actionsResult,
      assessmentsResult,
      controlsResult,
      documentsResult,
      indicatorsResult,
      issuesResult,
      obligationsResult,
      risksResult,
      attestationRecordsResult,
      assessmentActivitiesResult,
      changeRequestsResult,
    ] = await Promise.all([
      dataLayerApiClient.getMyDueActions(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueAssessments(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueControls(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueDocuments(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueIndicators(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueIssues(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueObligations(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueRisks(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueAttestationRecords(apiContext, {
        date,
        userId,
      }),
      dataLayerApiClient.getMyDueAssessmentActivities(apiContext, {
        date,
        userId,
        ownershipFilter,
      }),
      dataLayerApiClient.getMyDueChangeRequests(apiContext, {
        date,
        userId,
      }),
    ]);

    const response = {
      action: actionsResult.data,
      assessment: assessmentsResult.data,
      control: controlsResult.data,
      document: documentsResult.data,
      indicator: indicatorsResult.data,
      issue: issuesResult.data,
      obligation: obligationsResult.data,
      risk: risksResult.data,
      attestationRecord: attestationRecordsResult.data,
      assessmentActivity: assessmentActivitiesResult.data,
      changeRequest: changeRequestsResult.data,
    };

    return response;
  }
}
