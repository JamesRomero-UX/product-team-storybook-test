import type { AllowedScope } from 'src/providers/ExternalApiProvider';

interface ScopeInfo {
  fullScope: string;
  resource: string;
  subresource: string | null;
  action: string;
}

interface SubresourceGroup {
  name: string;
  displayName: string;
  scopes: AllowedScope[];
}

interface ResourceScopes {
  resource: string;
  displayName: string;
  topLevelScopes: AllowedScope[];
  subresourceGroups: SubresourceGroup[];
  hasRead: boolean;
  hasWrite: boolean;
}

// Resources to exclude from the primary resource list
const EXCLUDED_RESOURCES = ['auth-client', 'documentation', 'account'];

const RESOURCE_DISPLAY_NAMES: Record<string, string> = {
  risks: 'Risks',
  'enterprise-risks': 'Enterprise Risks',
  issues: 'Issues',
  controls: 'Controls',
  assessments: 'Assessments',
  obligations: 'Obligations',
  policies: 'Policies',
  'third-parties': 'Third Parties',
  actions: 'Actions',
  indicators: 'Indicators',
  users: 'Users',
  impacts: 'Impacts',
};

function parseScopeName(scope: string): ScopeInfo {
  const [resourcePart, action] = scope.split(':');
  const parts = resourcePart.split('.');

  // First part is always the primary resource
  const resource = parts[0];
  const subresource = parts.length > 1 ? parts.slice(1).join('.') : null;

  return {
    fullScope: scope,
    resource,
    subresource,
    action,
  };
}

function groupScopesByResource(
  allScopes: AllowedScope[]
): Record<string, ResourceScopes> {
  const grouped: Record<string, ResourceScopes> = {};

  // First pass: discover all primary resources from scopes (excluding EXCLUDED_RESOURCES)
  allScopes.forEach((scope) => {
    const parsed = parseScopeName(scope.name);

    // Skip excluded resources
    if (EXCLUDED_RESOURCES.includes(parsed.resource)) {
      return;
    }

    // Initialize resource if not already present
    if (!grouped[parsed.resource]) {
      grouped[parsed.resource] = {
        resource: parsed.resource,
        displayName:
          RESOURCE_DISPLAY_NAMES[parsed.resource] ||
          formatResourceName(parsed.resource),
        topLevelScopes: [],
        subresourceGroups: [],
        hasRead: false,
        hasWrite: false,
      };
    }
  });

  // Second pass: group scopes
  allScopes.forEach((scope) => {
    const parsed = parseScopeName(scope.name);

    // Skip if excluded or not initialized
    if (!grouped[parsed.resource]) {
      return;
    }

    if (!parsed.subresource) {
      // Top-level scope
      grouped[parsed.resource].topLevelScopes.push(scope);
      // Check for read actions (list or get)
      if (parsed.action === 'list' || parsed.action === 'get') {
        grouped[parsed.resource].hasRead = true;
      }
      // Check for write actions (create, update, or delete)
      if (
        parsed.action === 'create' ||
        parsed.action === 'update' ||
        parsed.action === 'delete'
      ) {
        grouped[parsed.resource].hasWrite = true;
      }
    } else {
      // Subresource scope
      let group = grouped[parsed.resource].subresourceGroups.find(
        (g) => g.name === parsed.subresource
      );
      if (!group) {
        group = {
          name: parsed.subresource!,
          displayName: formatSubresourceName(parsed.subresource!),
          scopes: [],
        };
        grouped[parsed.resource].subresourceGroups.push(group);
      }
      group.scopes.push(scope);
    }
  });

  // Sort subresource groups alphabetically
  Object.values(grouped).forEach((resourceScopes) => {
    resourceScopes.subresourceGroups.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  });

  return grouped;
}

function formatSubresourceName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatResourceName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getAllReadScopes(
  resource: string,
  allScopes: AllowedScope[]
): string[] {
  // Get list and get actions (not the aggregate :read)
  return allScopes
    .filter((scope) => {
      const parsed = parseScopeName(scope.name);

      return (
        parsed.resource === resource &&
        (parsed.action === 'list' || parsed.action === 'get')
      );
    })
    .map((scope) => scope.name);
}

function getAllWriteScopes(
  resource: string,
  allScopes: AllowedScope[]
): string[] {
  // Get create, update, delete actions (not the aggregate :write)
  return allScopes
    .filter((scope) => {
      const parsed = parseScopeName(scope.name);

      return (
        parsed.resource === resource &&
        (parsed.action === 'create' ||
          parsed.action === 'update' ||
          parsed.action === 'delete')
      );
    })
    .map((scope) => scope.name);
}

function getPrimaryResources(allScopes: AllowedScope[]): string[] {
  const resources = new Set<string>();

  allScopes.forEach((scope) => {
    const parsed = parseScopeName(scope.name);

    // Skip excluded resources
    if (!EXCLUDED_RESOURCES.includes(parsed.resource)) {
      resources.add(parsed.resource);
    }
  });

  // Sort alphabetically
  return Array.from(resources).sort();
}

export {
  getAllReadScopes,
  getAllWriteScopes,
  getPrimaryResources,
  groupScopesByResource,
  parseScopeName,
  RESOURCE_DISPLAY_NAMES,
};

export type { ResourceScopes, ScopeInfo, SubresourceGroup };
