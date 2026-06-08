import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { appDescription, appTitle } from '../docs/api.info';
import type { Compat } from '../types/versioning';
import { appVersion } from '../utils/versions';
import { CURRENT_API_VERSION } from '../versions/index';
import {
  createActionForParentRequestSchema,
  createActionRequestSchema,
  updateActionRequestSchema,
} from './actions/action-mutate-request.schema';
import { AuthTokenRequestSchema, AuthTokenResponseSchema } from './auth.schema';
import {
  createIndicatorForParentRequestSchema,
  createIndicatorRequestSchema,
  updateIndicatorRequestSchema,
} from './indicators/indicator-mutate-request.schema';
import {
  createIndicatorResultRequestSchema,
  updateIndicatorResultRequestSchema,
} from './indicators/indicator-result-mutate-request.schema';
import {
  createIssueAssessmentRequestSchema,
  updateIssueAssessmentRequestSchema,
} from './issues/issue-assessment-mutate-request.schema';
import {
  createIssueRequestSchema,
  updateIssueRequestSchema,
} from './issues/issue-mutate-request.schema';
import {
  authHeaderSchema,
  type MutableChildResourceConfig,
  registerAuthTokenPath,
  registerChildCrudResource,
  registerChildSingletonPath,
  registerCrudResource,
  type ResourceConfig,
} from './openapi/index';
import { createSuccessResponse } from './openapi/response-builders';
import {
  baseErrorResponses,
  buildOpenApiRegistry,
  type VersionedSchemas,
} from './openapi-registry-builder';
import {
  createRiskRequestSchema,
  updateRiskRequestSchema,
} from './risks/risk-mutate-request.schema';

// Registers all API path definitions to the OpenAPI registry.
function registerPaths(
  registry: ReturnType<typeof buildOpenApiRegistry>['registry'],
  schemas: VersionedSchemas
) {
  // Register auth token endpoint first (public, no authentication required)
  registerAuthTokenPath(
    registry,
    {
      requestSchema: AuthTokenRequestSchema,
      responseSchema: AuthTokenResponseSchema,
    },
    schemas
  );

  // Define all CRUD resources
  const resources: ResourceConfig[] = [
    {
      name: 'Risk',
      pluralName: 'Risks',
      tag: 'Risks',
      itemSchema: schemas.riskSchema,
      listSchema: schemas.riskListResponse,
      createSchema: createRiskRequestSchema,
      updateSchema: updateRiskRequestSchema,
      deleteEnabled: true,
      schemaEnabled: true,
    },
    {
      name: 'Control',
      pluralName: 'Controls',
      tag: 'Controls',
      itemSchema: schemas.controlItemSchema,
      listSchema: schemas.controlListResponse,
      schemaEnabled: true,
    },
    {
      name: 'Action',
      pluralName: 'Actions',
      tag: 'Actions',
      itemSchema: schemas.actionItemSchema,
      listSchema: schemas.actionListResponse,
      createSchema: createActionRequestSchema,
      updateSchema: updateActionRequestSchema,
      deleteEnabled: true,
      schemaEnabled: true,
    },
    {
      name: 'Issue',
      pluralName: 'Issues',
      tag: 'Issues',
      itemSchema: schemas.issueItemSchema,
      listSchema: schemas.issueListResponse,
      createSchema: createIssueRequestSchema,
      updateSchema: updateIssueRequestSchema,
      deleteEnabled: true,
      schemaEnabled: true,
    },
    {
      name: 'Policy',
      pluralName: 'Policies',
      tag: 'Policies',
      itemSchema: schemas.policyItemSchema,
      listSchema: schemas.policyListResponse,
      schemaEnabled: true,
    },
    {
      name: 'Assessment',
      pluralName: 'Assessments',
      tag: 'Assessments',
      itemSchema: schemas.assessmentItemSchema,
      listSchema: schemas.assessmentListResponse,
      schemaEnabled: true,
    },
    {
      name: 'Indicator',
      pluralName: 'Indicators',
      tag: 'Indicators',
      itemSchema: schemas.indicatorItemSchema,
      listSchema: schemas.indicatorListResponse,
      createSchema: createIndicatorRequestSchema,
      updateSchema: updateIndicatorRequestSchema,
      deleteEnabled: true,
      schemaEnabled: true,
    },
    {
      name: 'Obligation',
      pluralName: 'Obligations',
      tag: 'Compliance',
      itemSchema: schemas.obligationItemSchema,
      listSchema: schemas.obligationListResponse,
      pathPrefix: '/compliance',
      schemaEnabled: true,
    },
    {
      name: 'Third Party',
      pluralName: 'third-parties',
      tag: 'Third Party',
      itemSchema: schemas.thirdPartyItemSchema,
      listSchema: schemas.thirdPartyListResponse,
      schemaEnabled: true,
    },
    {
      name: 'Enterprise Risk',
      pluralName: 'enterprise-risks',
      tag: 'Enterprise Risk',
      itemSchema: schemas.enterpriseRiskItemSchema,
      listSchema: schemas.enterpriseRisksListResponse,
      schemaEnabled: true,
    },
    {
      name: 'Impact',
      pluralName: 'Impacts',
      tag: 'Impact',
      itemSchema: schemas.impactItemSchema,
      listSchema: schemas.impactListResponse,
      schemaEnabled: true,
    },
    {
      name: 'User Group',
      pluralName: 'user-groups',
      tag: 'Users',
      itemSchema: schemas.userGroupItemSchema,
      listSchema: schemas.userGroupListResponse,
      schemaEnabled: false,
    },
    {
      name: 'Department',
      pluralName: 'departments',
      tag: 'Departments',
      itemSchema: schemas.departmentItemSchema,
      listSchema: schemas.departmentListResponse,
      schemaEnabled: false,
    },
    {
      name: 'Department Group',
      pluralName: 'department-groups',
      tag: 'Departments',
      itemSchema: schemas.departmentGroupItemSchema,
      listSchema: schemas.departmentGroupListResponse,
      schemaEnabled: false,
    },
    {
      name: 'Tag',
      pluralName: 'tags',
      tag: 'Tags',
      itemSchema: schemas.tagItemSchema,
      listSchema: schemas.tagListResponse,
      schemaEnabled: false,
    },
    {
      name: 'User',
      pluralName: 'users',
      tag: 'Users',
      itemSchema: schemas.userItemSchema,
      listSchema: schemas.userListResponse,
      mixedIdType: true,
      excludeCustomFields: true,
      schemaEnabled: false,
    },
  ];

  // Register all resources
  resources.forEach((config) =>
    registerCrudResource(registry, config, schemas)
  );

  // Register child list endpoints e.g. risks/:id/controls
  const childResources: MutableChildResourceConfig[] = [
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Control',
      childPluralName: 'Controls',
      tag: 'Risks',
      listSchema: schemas.controlListResponse,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Action',
      childPluralName: 'Actions',
      tag: 'Risks',
      listSchema: schemas.actionListResponse,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Indicator',
      childPluralName: 'Indicators',
      tag: 'Risks',
      listSchema: schemas.indicatorListResponse,
      createSchema: createIndicatorForParentRequestSchema,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Appetite',
      childPluralName: 'Appetites',
      tag: 'Risks',
      listSchema: schemas.riskAppetiteListResponse,
      itemSchema: schemas.riskAppetiteItemSchema,
      schemaEnabled: true,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Rating',
      childPluralName: 'Ratings',
      tag: 'Risks',
      listSchema: schemas.riskRatingListResponse,
      itemSchema: schemas.riskRatingItemSchema,
      schemaEnabled: true,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Impact',
      childPluralName: 'Impacts',
      tag: 'Risks',
      listSchema: schemas.impactListResponse,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Acceptance',
      childPluralName: 'Acceptances',
      tag: 'Risks',
      listSchema: schemas.acceptanceListResponse,
      itemSchema: schemas.acceptanceItemSchema,
      schemaEnabled: true,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Approval',
      childPluralName: 'Approvals',
      tag: 'Risks',
      listSchema: schemas.riskApprovalListResponse,
      itemSchema: schemas.riskApprovalItemSchema,
    },
    {
      parentName: 'Risk',
      parentPluralName: 'Risks',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Risks',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Indicator',
      parentPluralName: 'Indicators',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Indicators',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Indicator',
      parentPluralName: 'Indicators',
      childName: 'Result',
      childPluralName: 'Results',
      tag: 'Indicators',
      listSchema: schemas.indicatorResultListResponse,
      itemSchema: schemas.indicatorResultItemSchema,
      createSchema: createIndicatorResultRequestSchema,
      updateSchema: updateIndicatorResultRequestSchema,
      deleteEnabled: true,
      schemaEnabled: true,
    },
    {
      parentName: 'Action',
      parentPluralName: 'Actions',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Actions',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Issue',
      parentPluralName: 'Issues',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Issues',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Issue',
      parentPluralName: 'Issues',
      childName: 'Action',
      childPluralName: 'Actions',
      tag: 'Issues',
      listSchema: schemas.actionListResponse,
      createSchema: createActionForParentRequestSchema,
    },
    {
      parentName: 'Issue',
      parentPluralName: 'Issues',
      childName: 'Update',
      childPluralName: 'Updates',
      tag: 'Issues',
      listSchema: schemas.issueUpdateListResponse,
      itemSchema: schemas.issueUpdateItemSchema,
      schemaEnabled: true,
    },
    {
      parentName: 'Issue',
      parentPluralName: 'Issues',
      childName: 'Cause',
      childPluralName: 'Causes',
      tag: 'Issues',
      listSchema: schemas.issueCauseListResponse,
      itemSchema: schemas.issueCauseItemSchema,
      schemaEnabled: true,
    },
    {
      parentName: 'Issue',
      parentPluralName: 'Issues',
      childName: 'Consequence',
      childPluralName: 'Consequences',
      tag: 'Issues',
      listSchema: schemas.issueConsequenceListResponse,
      itemSchema: schemas.issueConsequenceItemSchema,
      schemaEnabled: true,
    },
    {
      parentName: 'Control',
      parentPluralName: 'Controls',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Controls',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Third Party',
      parentPluralName: 'third-parties',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Third Party',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Obligation',
      parentPluralName: 'Obligations',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Compliance',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Policy',
      parentPluralName: 'Policies',
      childName: 'Linked Item',
      childPluralName: 'Linked-Items',
      tag: 'Policies',
      listSchema: schemas.linkedItemListResponse,
    },
    {
      parentName: 'Enterprise Risk',
      parentPluralName: 'enterprise-risks',
      childName: 'Risk',
      childPluralName: 'Risks',
      tag: 'Enterprise Risk',
      listSchema: schemas.riskListResponse,
    },
  ];

  childResources.forEach((config) =>
    registerChildCrudResource(registry, config, schemas)
  );

  // Register singleton child endpoints (e.g., issues/:id/assessment)
  const singletonChildResources: (Required<
    Pick<MutableChildResourceConfig, 'itemSchema'>
  > &
    Omit<MutableChildResourceConfig, 'listSchema'>)[] = [
    {
      parentName: 'Issue',
      parentPluralName: 'Issues',
      childName: 'Assessment',
      childPluralName: 'assessment',
      tag: 'Issues',
      itemSchema: schemas.issueAssessmentItemSchema,
      createSchema: createIssueAssessmentRequestSchema,
      updateSchema: updateIssueAssessmentRequestSchema,
      schemaEnabled: true,
    },
  ];

  singletonChildResources.forEach((config) =>
    registerChildSingletonPath(registry, config, schemas)
  );

  // Register singleton top-level endpoints
  registry.registerPath({
    method: 'get',
    path: '/api/v1/account',
    summary: 'Get account information',
    description:
      'Returns token identity, permissions, rate limit plan & usage for all tiers, and a signed documentation URL.',
    tags: ['Account'],
    request: { headers: authHeaderSchema },
    responses: {
      ...createSuccessResponse(
        'Account information',
        schemas.accountResponseSchema
      ),
      ...baseErrorResponses('Account', false),
    },
  });
}

// Generates OpenAPI document for the specified API version.
export function generateOpenApiDocument(
  apiVersion: Compat = CURRENT_API_VERSION,
  apiBaseURL: string
) {
  // Build versioned registry for this specific API version
  const { registry: versionedRegistry, schemas } =
    buildOpenApiRegistry(apiVersion);

  // Register security schemes for endpoints.
  versionedRegistry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  // Register path definitions (these reference the component schemas by name)
  // The schemas themselves are already versioned in the registry
  registerPaths(versionedRegistry, schemas);

  const generator = new OpenApiGeneratorV3(versionedRegistry.definitions);
  const doc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: `${appVersion} (API ${apiVersion})`,
      title: appTitle,
      description: `${appDescription}\n\n**API Version:** \`${apiVersion}\``,
      contact: {
        name: 'RiskSmart Support',
        email: 'support@risksmart.com',
      },
      license: {
        name: 'Proprietary',
        url: 'https://risksmart.com',
      },
    },
    servers: [
      {
        url: apiBaseURL,
        description: 'API service',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  });

  return doc;
}

// Export registry for latest version (if needed).
export const registry = buildOpenApiRegistry(CURRENT_API_VERSION).registry;

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details: Array<{
    field: string;
    message: string;
  }>;
}
