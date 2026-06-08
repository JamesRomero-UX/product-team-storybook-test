import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type { ServiceContext } from 'src/types';

import { getDatabaseConnection } from '../../../../../repositories/db-client';
import {
  createIssueAssessmentRepository,
  type IssueAssessmentRelationships,
  type IssueAssessmentRepository,
} from '../../../../../repositories/issue-assessment-repository';
import {
  type CreateIssueAssessmentRequest,
  createIssueAssessmentRequestSchema,
} from '../../../../../schemas/issue-assessment';
import { getLogger } from '../../../../../utils/logger';
import {
  ObjectEventStrategy,
  type ObjectStrategyData,
} from '../../../events/object-event-strategy';
import { createHttpMutationHandler } from '../../../utils/create-http-mutation-handler';
import { ObjectCreationFailedError } from '../../../utils/error';
import { extractServiceContext } from '../../../utils/extract-context';
import { createdResponse } from '../../../utils/http-response';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from '../../../utils/mutation-middleware';

const logger = getLogger();

export interface ProcessorDependencies {
  issueAssessmentRepository: IssueAssessmentRepository;
}

/**
 * Processor for creating an issue assessment
 * Handles database insertion with parent issue type mapping and relationships
 */
export const createProcessor =
  ({ issueAssessmentRepository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: CreateIssueAssessmentRequest;
    context: ServiceContext;
  }) => {
    logger.info('Processing create issue assessment', {
      userId: context.userId,
      orgKey: context.orgKey,
      tenant: context.tenant,
    });

    const insertData = {
      ParentIssueId: payload.ParentIssueId,
      Severity: payload.Severity ?? null,
      Status: payload.Status ?? null,
      CertifiedIndividual: payload.CertifiedIndividual ?? null,
      IssueType: payload.IssueType ?? null,
      ActualCloseDate: payload.ActualCloseDate ?? null,
      TargetCloseDate: payload.TargetCloseDate ?? null,
      PolicyOwnerCommentary: payload.PolicyOwnerCommentary ?? null,
      PolicyOwner: payload.PolicyOwner ?? null,
      PolicyBreach: payload.PolicyBreach ?? null,
      Reportable: payload.Reportable ?? null,
      PoliciesBreached: payload.PoliciesBreached ?? null,
      Rationale: payload.Rationale ?? null,
      IssueCausedByThirdParty: payload.IssueCausedByThirdParty ?? null,
      SystemResponsible: payload.SystemResponsible ?? null,
      RegulatoryBreach: payload.RegulatoryBreach ?? null,
      RegulationsBreached: payload.RegulationsBreached ?? null,
      ThirdPartyResponsible: payload.ThirdPartyResponsible ?? null,
      IssueCausedBySystemIssue: payload.IssueCausedBySystemIssue ?? null,
      CreatedByUser: context.userId,
      ModifiedByUser: context.userId,
      OrgKey: context.orgKey,
      CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
    };

    const relationships: IssueAssessmentRelationships = {
      parentIssueId: payload.ParentIssueId,
      tagTypeIds: payload.TagTypeIds ?? [],
      departmentTypeIds: payload.DepartmentTypeIds ?? [],
      regulationsBreachedIds: payload.RegulationsBreachedIds ?? [],
      associatedControlIds: payload.AssociatedControlIds ?? [],
      policiesBreachedIds: payload.PoliciesBreachedIds ?? [],
    };

    const insertedRecord =
      await issueAssessmentRepository.insertWithRelationships(
        insertData,
        relationships,
        context
      );

    if (!insertedRecord?.Id) {
      throw new ObjectCreationFailedError(
        'Failed to retrieve created issue assessment'
      );
    }

    logger.info('Successfully created issue assessment', {
      objectId: insertedRecord.Id,
    });

    return insertedRecord;
  };

/**
 * Processor for POST /issue-assessments
 * Creates a new issue assessment with permission check, database insert, and event emission
 * Returns the full created object with Location header
 * Errors are handled by the restApiLambdaErrorHandler middleware
 */
export const createIssueAssessmentProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Database connection and repository
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const issueAssessmentRepository = createIssueAssessmentRepository(db);

  const processor = createProcessor({
    issueAssessmentRepository,
  });

  // Create object event strategy for emitting ObjectCreated events
  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'issue_assessment',
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof createIssueAssessmentRequestSchema>()
    .withSchema(createIssueAssessmentRequestSchema)
    .withObjectName('issue_assessment')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => [
      {
        objectName: 'issue_assessment',
        action: 'insert',
      },
      {
        objectName: 'rs_node',
        objectId: payload.ParentIssueId,
        action: 'insert',
      },
    ])
    .withHandler(
      async (
        event,
        context: ValidatedLambdaContext<
          CreateIssueAssessmentRequest,
          ObjectStrategyData
        >
      ): Promise<HandlerResult<APIGatewayProxyResult, ObjectStrategyData>> => {
        const result = await processor({
          payload: context.payload,
          context: context.serviceContext,
        });

        return {
          response: createdResponse({
            event,
            object: result,
            objectType: 'issue_assessment',
          }),
          strategyData: {
            objectIds: [result.Id],
          },
        };
      }
    )
    .execute(event, context);
};
