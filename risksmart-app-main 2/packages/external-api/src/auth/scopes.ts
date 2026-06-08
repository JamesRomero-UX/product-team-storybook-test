const scope = <T extends string>(name: T, desc: string, module: string) =>
  [name, { name, desc, module }] as const;

const resourceScopesArray = [
  // Account
  scope(
    'account:read',
    'Read api client account and usage information',
    'account'
  ),
  // Risks
  scope('risks:list', 'List risks', 'risk'),
  scope('risks:get', 'Get risk by ID', 'risk'),
  scope('risks:read', 'Read access to risks', 'risk'),
  scope('risks:create', 'Create a risk', 'risk'),
  scope('risks:update', 'Update a risk', 'risk'),
  scope('risks:delete', 'Delete a risk', 'risk'),
  scope('risks:write', 'Write access to risks', 'risk'),
  scope('risks.ratings:get', 'Get risk ratings', 'risk'),
  scope('risks.ratings:list', 'List risk ratings', 'risk'),
  scope('risks.ratings:read', 'Read access to risk ratings', 'risk'),
  scope('risks.impacts:list', 'List risk impacts', 'risk.impact'),
  scope('risks.impacts:read', 'Read access to risk impacts', 'risk.impact'),
  scope('risks.actions:list', 'List risk actions', 'risk'),
  scope('risks.actions:read', 'Read access to risk actions', 'risk'),
  scope('risks.controls:list', 'List controls linked to a risk', 'risk'),
  scope('risks.controls:read', 'Read access to risk controls', 'risk'),
  scope('risks.indicators:list', 'List indicators linked to a risk', 'risk'),
  scope('risks.indicators:read', 'Read access to risk indicators', 'risk'),
  scope(
    'risks.indicators:create',
    'Create an indicator linked to a risk',
    'risk'
  ),
  scope('risks.indicators:write', 'Write access to risk indicators', 'risk'),
  scope('risks.approvals:list', 'List risk approvals', 'risk'),
  scope('risks.approvals:get', 'Get risk approval', 'risk'),
  scope('risks.approvals:read', 'Read access to risk approvals', 'risk'),
  scope('risks.linked-items:list', 'List items linked to a risk', 'risk'),
  scope('risks.linked-items:read', 'Read access to risk linked items', 'risk'),
  scope('risks.appetite:list', 'List risk appetite entries', 'risk.appetite'),
  scope(
    'risks.appetite:get',
    'Get specific risk appetite entry',
    'risk.appetite'
  ),
  scope('risks.appetite:read', 'Read access to risk appetite', 'risk.appetite'),
  scope('risks.acceptances:list', 'List risk acceptances', 'risk.acceptance'),
  scope(
    'risks.acceptances:get',
    'Get specific risk acceptance',
    'risk.acceptance'
  ),
  scope(
    'risks.acceptances:read',
    'Read access to risk acceptances',
    'risk.acceptance'
  ),
  // Risk Impacts
  scope('impacts:list', 'List impacts', 'risk'),
  scope('impacts:get', 'Get impact by ID', 'risk'),
  scope('impacts:read', 'Read access to impacts', 'risk'),
  // Enterprise Risks
  scope('enterprise-risks:list', 'List enterprise risks', 'enterprise_risk'),
  scope('enterprise-risks:get', 'Get enterprise risk by ID', 'enterprise_risk'),
  scope(
    'enterprise-risks:read',
    'Read access to enterprise risks',
    'enterprise_risk'
  ),
  scope(
    'enterprise-risks.risks:list',
    'List risks linked to an enterprise risk',
    'enterprise_risk'
  ),
  scope(
    'enterprise-risks.risks:read',
    'Read access to enterprise risk links',
    'enterprise_risk'
  ),
  // Issues
  scope('issues:list', 'List issues', 'issue'),
  scope('issues:get', 'Get issue by ID', 'issue'),
  scope('issues:read', 'Read access to issues', 'issue'),
  scope('issues:create', 'Create an issue', 'issue'),
  scope('issues:update', 'Update an issue', 'issue'),
  scope('issues:delete', 'Delete an issue', 'issue'),
  scope('issues:write', 'Write access to issues', 'issue'),
  scope('issues.updates:list', 'List issue updates', 'issue'),
  scope('issues.updates:get', 'Get issue update', 'issue'),
  scope('issues.updates:read', 'Read access to issue updates', 'issue'),
  scope('issues.actions:list', 'List issue actions', 'issue'),
  scope('issues.actions:read', 'Read access to issue actions', 'issue'),
  scope(
    'issues.actions:create',
    'Create an action linked to an issue',
    'issue'
  ),
  scope('issues.actions:write', 'Write access to issue actions', 'issue'),
  scope('issues.causes:list', 'List issue causes', 'issue.cause'),
  scope('issues.causes:get', 'Get issue cause', 'issue.cause'),
  scope('issues.causes:read', 'Read access to issue causes', 'issue.cause'),
  scope(
    'issues.consequences:list',
    'List issue consequences',
    'issue.consequence'
  ),
  scope(
    'issues.consequences:get',
    'Get issue consequence',
    'issue.consequence'
  ),
  scope(
    'issues.consequences:read',
    'Read access to issue consequences',
    'issue.consequence'
  ),
  scope('issues.assessment:get', 'Get issue assessment', 'issue'),
  scope('issues.assessment:read', 'Read access to issue assessment', 'issue'),
  scope('issues.assessment:create', 'Create an issue assessment', 'issue'),
  scope('issues.assessment:update', 'Update an issue assessment', 'issue'),
  scope('issues.assessment:write', 'Write access to issue assessment', 'issue'),
  scope('issues.linked-items:list', 'List items linked to an issue', 'issue'),
  scope(
    'issues.linked-items:read',
    'Read access to issue linked items',
    'issue'
  ),
  scope('issues.reported:get', 'Get issue reporting confirmation', 'issue'),
  scope(
    'issues.reported:read',
    'Read access to issue reporting confirmations',
    'issue'
  ),
  // Controls
  scope('controls:list', 'List controls', 'control'),
  scope('controls:get', 'Get control by ID', 'control'),
  scope('controls:read', 'Read access to controls', 'control'),
  // Assessments
  scope('assessments:list', 'List assessments', 'assessment'),
  scope('assessments:get', 'Get assessment by ID', 'assessment'),
  scope('assessments:read', 'Read access to assessments', 'assessment'),
  // Obligations
  scope('obligations:list', 'List compliance obligations', 'obligation'),
  scope('obligations:get', 'Get compliance obligation by ID', 'obligation'),
  scope(
    'obligations:read',
    'Read access to compliance obligations',
    'obligation'
  ),
  // Policies
  scope('policies:list', 'List policies', 'document'),
  scope('policies:get', 'Get policy by ID', 'document'),
  scope('policies:read', 'Read access to policies', 'document'),
  scope('policies.attestations:list', 'List policy attestations', 'document'),
  scope(
    'policies.attestations:read',
    'Read access to policy attestations',
    'document'
  ),
  // Third Parties
  scope('third-parties:list', 'List third parties', 'third_party'),
  scope('third-parties:get', 'Get third party by ID', 'third_party'),
  scope('third-parties:read', 'Read access to third parties', 'third_party'),
  // Actions
  scope('actions:list', 'List actions', 'action'),
  scope('actions:get', 'Get action by ID', 'action'),
  scope('actions:read', 'Read access to actions', 'action'),
  scope('actions:create', 'Create an action', 'action'),
  scope('actions:update', 'Update an action', 'action'),
  scope('actions:delete', 'Delete an action', 'action'),
  scope('actions:write', 'Write access to actions', 'action'),
  // Indicators
  scope('indicators:list', 'List indicators', 'indicator'),
  scope('indicators:get', 'Get indicator by ID', 'indicator'),
  scope('indicators:read', 'Read access to indicators', 'indicator'),
  scope('indicators:create', 'Create an indicator', 'indicator'),
  scope('indicators:update', 'Update an indicator', 'indicator'),
  scope('indicators:delete', 'Delete an indicator', 'indicator'),
  scope('indicators:write', 'Write access to indicators', 'indicator'),
  scope('indicators.results:list', 'List indicator results', 'indicator'),
  scope('indicators.results:get', 'Get indicator result by ID', 'indicator'),
  scope(
    'indicators.results:read',
    'Read access to indicator results',
    'indicator'
  ),
  scope('indicators.results:create', 'Create an indicator result', 'indicator'),
  scope('indicators.results:update', 'Update an indicator result', 'indicator'),
  scope('indicators.results:delete', 'Delete an indicator result', 'indicator'),
  scope(
    'indicators.results:write',
    'Write access to indicator results',
    'indicator'
  ),
  // Documentation
  scope('documentation:read', 'Read access to documentation', 'documentation'),
  // Users
  scope('users:get', 'Get user by ID', 'user'),
  scope('users:read', 'Read access to users', 'user'),
  scope('users:list', 'List users', 'user'),
  // User Groups
  scope('user-groups:list', 'List user groups', 'user_group'),
  scope('user-groups:get', 'Get user group by ID', 'user_group'),
  scope('user-groups:read', 'Read access to user groups', 'user_group'),
  // Departments
  scope('departments:read', 'Read access to departments', 'department'),
  scope('departments:list', 'List departments', 'department'),
  scope('departments:get', 'Get department by ID', 'department'),
  // Department Groups
  scope('department-groups:read', 'Read access to department groups', 'department_group'),
  scope('department-groups:list', 'List department groups', 'department_group'),
  scope('department-groups:get', 'Get department group by ID', 'department_group'),
  // Tags
  scope('tags:read', 'Read access to tags', 'tag_type'),
  scope('tags:list', 'List tags', 'tag_type'),
  scope('tags:get', 'Get tag by ID', 'tag_type'),
  // Linked Items
  scope(
    'actions.linked-items:list',
    'List items linked to an action',
    'action'
  ),
  scope(
    'actions.linked-items:read',
    'Read access to action linked items',
    'action'
  ),
  scope(
    'controls.linked-items:list',
    'List items linked to a control',
    'control'
  ),
  scope(
    'controls.linked-items:read',
    'Read access to control linked items',
    'control'
  ),
  scope(
    'indicators.linked-items:list',
    'List items linked to an indicator',
    'indicator'
  ),
  scope(
    'indicators.linked-items:read',
    'Read access to indicator linked items',
    'indicator'
  ),
  scope(
    'obligations.linked-items:list',
    'List items linked to an obligation',
    'obligation'
  ),
  scope(
    'obligations.linked-items:read',
    'Read access to obligation linked items',
    'obligation'
  ),
  scope(
    'policies.linked-items:list',
    'List items linked to a policy',
    'document'
  ),
  scope(
    'policies.linked-items:read',
    'Read access to policy linked items',
    'document'
  ),
  scope(
    'third-parties.linked-items:list',
    'List items linked to a third-party',
    'third_party'
  ),
  scope(
    'third-parties.linked-items:read',
    'Read access to third-party linked items',
    'third_party'
  ),
] as const;

type ExtractResource<T extends string> = T extends `${infer Resource}:${string}`
  ? Resource
  : never;
export type ResourceScopeKey = (typeof resourceScopesArray)[number][0];
export type ResourceScopeName = ExtractResource<ResourceScopeKey>;
export interface ResourceScope {
  name: ResourceScopeKey;
  desc: string;
  module: string;
}

export const resourceScopes = new Map<string, ResourceScope>(
  resourceScopesArray
);

export const resourceScopeList = resourceScopesArray.map(([, scope]) => scope);
