import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  procedurePath: string;
  parameters: z.ZodType;
  availableVia: 'all' | 'oauth-only';
}

export const toolDefinitions: ToolDefinition[] = [
  // Risks
  {
    name: 'list_risks',
    description:
      'List all risks in the risk register. Returns risk details including title, description, status, tier, and treatment.',
    procedurePath: 'frontend.risk.register',
    parameters: z.object({}),
    availableVia: 'all',
  },
  {
    name: 'get_risk_by_id',
    description:
      'Get detailed information about a specific risk by its ID, including linked controls, actions, and assessment results.',
    procedurePath: 'frontend.risk.riskById',
    parameters: z.object({
      riskId: z.string().uuid().describe('The unique identifier of the risk'),
    }),
    availableVia: 'all',
  },
  {
    name: 'get_risk_scores',
    description:
      'Get risk scores across the risk register, including inherent and residual risk ratings.',
    procedurePath: 'frontend.risk.scores',
    parameters: z.object({}),
    availableVia: 'oauth-only',
  },

  // Controls
  {
    name: 'list_controls',
    description:
      'List all controls in the control register. Optionally filter by parent risk ID.',
    procedurePath: 'frontend.control.register',
    parameters: z.object({
      parentId: z
        .string()
        .uuid()
        .optional()
        .describe('Optional parent risk ID to filter controls'),
    }),
    availableVia: 'all',
  },
  {
    name: 'get_control_by_id',
    description:
      'Get detailed information about a specific control by its ID, including effectiveness, test results, and linked items.',
    procedurePath: 'frontend.control.controlById',
    parameters: z.object({
      controlId: z
        .string()
        .uuid()
        .describe('The unique identifier of the control'),
    }),
    availableVia: 'all',
  },

  // Actions
  {
    name: 'list_actions',
    description:
      'List all actions. Optionally filter by parent ID, tag types, or department types.',
    procedurePath: 'frontend.action.register',
    parameters: z.object({
      parentId: z
        .string()
        .uuid()
        .optional()
        .describe('Optional parent item ID to filter actions'),
      tagTypeIds: z
        .array(z.string().uuid())
        .optional()
        .describe('Optional tag type IDs to filter by'),
      departmentTypeIds: z
        .array(z.string().uuid())
        .optional()
        .describe('Optional department type IDs to filter by'),
    }),
    availableVia: 'all',
  },
  {
    name: 'get_action_by_id',
    description: 'Get detailed information about a specific action by its ID.',
    procedurePath: 'frontend.action.actionById',
    parameters: z.object({
      id: z.string().uuid().describe('The unique identifier of the action'),
    }),
    availableVia: 'all',
  },

  // Issues
  {
    name: 'list_issues',
    description:
      'List all issues of a given type. Issue types include: issue, issue_breach_log, issue_consumer_duty, issue_customer_trust, issue_gdpr_breach_log, issue_pci_breach_log, issue_risk_event, issue_sar_log.',
    procedurePath: 'frontend.issue.register',
    parameters: z.object({
      issueType: z
        .enum([
          'issue_breach_log',
          'issue_consumer_duty',
          'issue_customer_trust',
          'issue_gdpr_breach_log',
          'issue_pci_breach_log',
          'issue_risk_event',
          'issue_sar_log',
          'issue',
        ])
        .describe('The type of issues to list'),
      tagTypeIds: z
        .array(z.string().uuid())
        .optional()
        .describe('Optional tag type IDs to filter by'),
      departmentTypeIds: z
        .array(z.string().uuid())
        .optional()
        .describe('Optional department type IDs to filter by'),
    }),
    availableVia: 'all',
  },
  {
    name: 'get_issue_by_id',
    description: 'Get detailed information about a specific issue by its ID.',
    procedurePath: 'frontend.issue.issueById',
    parameters: z.object({
      id: z.string().uuid().describe('The unique identifier of the issue'),
    }),
    availableVia: 'all',
  },

  // Obligations
  {
    name: 'list_obligations',
    description: 'List all regulatory obligations in the obligation register.',
    procedurePath: 'frontend.obligation.register',
    parameters: z.object({}),
    availableVia: 'all',
  },

  // Third Parties
  {
    name: 'list_third_parties',
    description: 'List all third parties in the third-party register.',
    procedurePath: 'frontend.thirdParty.register',
    parameters: z.object({}),
    availableVia: 'all',
  },

  // Enterprise Risks
  {
    name: 'list_enterprise_risks',
    description: 'List all enterprise risks in the enterprise risk register.',
    procedurePath: 'frontend.enterpriseRisk.register',
    parameters: z.object({}),
    availableVia: 'all',
  },

  // Indicators
  {
    name: 'list_indicators',
    description:
      'List all key risk indicators (KRIs) in the indicator register.',
    procedurePath: 'frontend.indicator.register',
    parameters: z.object({}),
    availableVia: 'all',
  },

  // Documents
  {
    name: 'list_documents',
    description:
      'List all documents (policies, standards, procedures) in the document register.',
    procedurePath: 'frontend.document.register',
    parameters: z.object({}),
    availableVia: 'all',
  },

  // Linked Items
  {
    name: 'get_linked_items',
    description:
      'Get all items linked to a given item by its ID. Returns cross-referenced risks, controls, actions, and other linked entities. When using API key authentication, the entityType parameter is required.',
    procedurePath: 'frontend.linkedItem.linkedItems',
    parameters: z.object({
      id: z.string().uuid().describe('The unique identifier of the item'),
      entityType: z
        .enum([
          'risks',
          'controls',
          'actions',
          'issues',
          'indicators',
          'policies',
          'compliance/obligations',
          'third-parties',
        ])
        .optional()
        .describe(
          'The entity type of the item (required for API key auth). E.g. "risks", "controls", "actions"'
        ),
    }),
    availableVia: 'all',
  },

  // Tags
  {
    name: 'list_tags',
    description:
      'List all tag types available in the organization for categorizing items.',
    procedurePath: 'frontend.tag.allTypes',
    parameters: z.object({}),
    availableVia: 'oauth-only',
  },

  // Departments
  {
    name: 'list_departments',
    description: 'List all department types available in the organization.',
    procedurePath: 'frontend.department.allTypes',
    parameters: z.object({}),
    availableVia: 'oauth-only',
  },

  // Assessments
  {
    name: 'list_assessments',
    description:
      'List all assessments (compliance monitoring, internal audit, RCSA) in the assessment register.',
    procedurePath: 'frontend.assessment.register',
    parameters: z.object({}),
    availableVia: 'all',
  },
];
