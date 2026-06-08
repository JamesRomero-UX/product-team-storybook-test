import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import type { Compat } from '../types/versioning';
import { getSchemaForVersion } from '../utils/schema-versioning';
import {
  controlItemResponseSchemaLatest,
  controlItemResponseSchemaVersions,
  controlListResponseSchemaLatest,
  controlListResponseSchemaVersions,
} from '../versions/control/schema-registry';
import { CURRENT_API_VERSION } from '../versions/index';
import { AccountResponseSchema } from './account/account.schema';
import { resourceSchemas } from './index';
import { z } from './openapi.zod';

// Builds an OpenAPI registry with versioned schemas.
export function buildOpenApiRegistry(apiVersion: Compat = CURRENT_API_VERSION) {
  const registry = new OpenAPIRegistry();

  // Get versioned Control schemas
  const controlItemSchema = getSchemaForVersion(
    apiVersion,
    controlItemResponseSchemaLatest,
    controlItemResponseSchemaVersions
  );

  const controlListItemSchema = getSchemaForVersion(
    apiVersion,
    controlListResponseSchemaLatest,
    controlListResponseSchemaVersions
  );

  // Issue schemas
  const issueListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.IssueListResponseSchema
  );

  const issueUpdateListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.IssueUpdateListResponseSchema
  );

  const issueCauseListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.CauseListResponseSchema
  );

  const issueConsequenceListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.ConsequenceListResponseSchema
  );

  // Policy schemas
  const policyListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.PolicyListResponseSchema
  );

  // Control schemas
  const controlListResponse = resourceSchemas.createBaseListResponse(
    controlListItemSchema
  );

  // Risk schemas
  const riskListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.RiskListItemSchema
  );

  const riskAppetiteListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.AppetiteListResponseSchema
  );

  const riskApprovalListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.ApprovalListSchema
  );

  const riskRatingListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.RiskRatingListSchema
  );

  const acceptanceListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.AcceptanceListResponseSchema
  );

  // Action schemas
  const actionListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.ActionListResponseSchema
  );

  // Assessment schemas
  const assessmentListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.AssessmentListResponseSchema
  );

  // Indicator schemas
  const indicatorListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.IndicatorListResponseSchema
  );

  const indicatorResultListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.IndicatorResultListResponseSchema
  );

  // Obligation schemas
  const obligationListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.ObligationListResponseSchema
  );

  // Third Party schemas
  const thirdPartyListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.ThirdPartyListResponseSchema
  );

  // Enterprise Risks schemas
  const enterpriseRisksListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.EnterpriseRiskListResponseSchema
  );

  // Impacts schemas
  const impactListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.ImpactListResponseSchema
  );

  // Linked Items schemas
  const linkedItemListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.LinkedItemListSchema
  );

  // User Group schemas
  const userGroupListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.UserGroupListResponseSchema
  );

  // Department schemas
  const departmentListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.DepartmentListResponseSchema
  );

  // Department Group schemas
  const departmentGroupListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.DepartmentGroupListResponseSchema
  );

  // Tag schemas
  const tagListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.TagListResponseSchema
  );

  // User schemas
  const userListResponse = resourceSchemas.createBaseListResponse(
    resourceSchemas.UserListResponseSchema
  );

  // Account response schema
  registry.register('AccountResponse', AccountResponseSchema);

  // Resource schema response
  registry.register(
    'ResourceSchemaResponse',
    resourceSchemas.ResourceSchemaResponseSchema
  );

  // Common response schemas
  registry.register('ErrorResponse', resourceSchemas.ErrorResponseSchema);
  registry.register(
    'ValidationErrorResponse',
    resourceSchemas.ValidationErrorResponseSchema
  );
  registry.register(
    'ForbiddenResponse',
    resourceSchemas.ForbiddenResponseSchema
  );
  registry.register('NotFoundResponse', resourceSchemas.NotFoundResponseSchema);
  registry.register(
    'InternalServerErrorResponse',
    resourceSchemas.InternalServerErrorResponseSchema
  );

  const MutationResponseSchema = z.object({
    id: z.string().uuid().openapi({ description: 'UUID of the resource' }),
  });
  registry.register('MutationResponse', MutationResponseSchema);

  // Return both registry and schema references
  return {
    registry,
    schemas: {
      controlItemSchema,
      controlListResponse,
      riskSchema: resourceSchemas.RiskSchema,
      riskListResponse,
      riskAppetiteListResponse,
      riskAppetiteItemSchema: resourceSchemas.AppetiteItemResponseSchema,
      riskRatingListResponse,
      riskRatingItemSchema: resourceSchemas.RiskRatingItemSchema,
      riskApprovalListResponse,
      riskApprovalItemSchema: resourceSchemas.ApprovalItemSchema,
      errorResponse: resourceSchemas.ErrorResponseSchema,
      validationErrorResponse: resourceSchemas.ValidationErrorResponseSchema,
      actionListResponse,
      actionItemSchema: resourceSchemas.ActionItemResponseSchema,
      issueListResponse,
      issueItemSchema: resourceSchemas.IssueItemResponseSchema,
      policyListResponse,
      policyItemSchema: resourceSchemas.PolicyItemResponseSchema,
      assessmentListResponse,
      assessmentItemSchema: resourceSchemas.AssessmentItemResponseSchema,
      indicatorListResponse,
      indicatorItemSchema: resourceSchemas.IndicatorItemResponseSchema,
      indicatorResultListResponse,
      indicatorResultItemSchema:
        resourceSchemas.IndicatorResultItemResponseSchema,
      obligationListResponse,
      obligationItemSchema: resourceSchemas.ObligationItemResponseSchema,
      thirdPartyListResponse,
      thirdPartyItemSchema: resourceSchemas.ThirdPartyItemResponseSchema,
      userItemSchema: resourceSchemas.UserItemResponseSchema,
      userListResponse,
      enterpriseRisksListResponse,
      enterpriseRiskItemSchema:
        resourceSchemas.EnterpriseRiskItemResponseSchema,
      impactListResponse,
      impactItemSchema: resourceSchemas.ImpactItemResponseSchema,
      acceptanceListResponse,
      acceptanceItemSchema: resourceSchemas.AcceptanceItemResponseSchema,
      linkedItemListResponse,
      issueCauseListResponse,
      issueCauseItemSchema: resourceSchemas.CauseItemResponseSchema,
      issueConsequenceListResponse,
      issueConsequenceItemSchema: resourceSchemas.ConsequenceItemResponseSchema,
      issueUpdateListResponse,
      issueUpdateItemSchema: resourceSchemas.IssueUpdateItemResponseSchema,
      issueAssessmentItemSchema: resourceSchemas.IssueAssessmentResponseSchema,
      mutationResponse: MutationResponseSchema,
      accountResponseSchema: AccountResponseSchema,
      resourceSchemaResponse: resourceSchemas.ResourceSchemaResponseSchema,
      userGroupListResponse,
      userGroupItemSchema: resourceSchemas.UserGroupItemResponseSchema,
      departmentListResponse,
      departmentItemSchema: resourceSchemas.DepartmentItemResponseSchema,
      departmentGroupListResponse,
      departmentGroupItemSchema: resourceSchemas.DepartmentGroupItemResponseSchema,
      tagListResponse,
      tagItemSchema: resourceSchemas.TagItemResponseSchema,
    },
  };
}

export type RegistryWithSchemas = ReturnType<typeof buildOpenApiRegistry>;
export type VersionedSchemas = RegistryWithSchemas['schemas'];

// Creates standard error responses for OpenAPI paths.
export function baseErrorResponses(resource: string, includeNotFound = true) {
  return {
    ...(includeNotFound
      ? {
          404: {
            description: `${resource} not found`,
            content: {
              'application/json': {
                schema: resourceSchemas.NotFoundResponseSchema,
              },
            },
          },
        }
      : {}),
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: resourceSchemas.ErrorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: resourceSchemas.ForbiddenResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: resourceSchemas.InternalServerErrorResponseSchema,
        },
      },
    },
  };
}
