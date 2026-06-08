import {
  type ResourceScopeKey,
  resourceScopeList,
  type ResourceScopeName,
  resourceScopes,
} from './scopes';

const regexMatchScopeFormat = /^([a-z][a-z0-9.-]*):([a-z*]+)$/i;
const writeActions = ['create', 'update', 'delete'] as const;
const readActions = ['list', 'get'] as const;

type AllActions = [...typeof writeActions, ...typeof readActions][number];

// checks for valid scope and errors if invalid.
const getValidScopes = (scopes: string[]): ResourceScopeKey[] => {
  const validScopes: ResourceScopeKey[] = [];
  for (const scope of scopes) {
    const matchedScope = resourceScopes.get(scope);
    if (!matchedScope) {
      throw new Error(`scope key ${scope} not found in resource scopes`);
    }
    validScopes.push(matchedScope.name);
  }

  return validScopes;
};

const getAllResourceScopes = (resourceScopeName: ResourceScopeName) => {
  return resourceScopeList
    .filter((scope) => {
      const [name] = scope.name.split(':');

      return name === resourceScopeName;
    })
    .map((scope) => scope.name);
};

// expands any grouping scopes (read, write) by adding the granular scopes.
export function expandScopes(
  granted: ResourceScopeKey[]
): Set<ResourceScopeKey> {
  // adds documentation & account read access by default to granted.
  const resultSet = new Set(granted);
  resultSet.add('documentation:read');
  resultSet.add('account:read');
  for (const grantItem of granted) {
    const matchedFormat = grantItem.match(regexMatchScopeFormat);
    if (!matchedFormat) {
      continue; //skip.
    }
    const [, resource, action] = matchedFormat;
    // matches key to resource scopes and adds it to set (if it exists).
    const addToResult = (key: string, set: Set<ResourceScopeKey>) => {
      const scopeKey = resourceScopes.get(key)?.name;
      if (scopeKey) {
        set.add(scopeKey);
      }
    };
    if (action === 'read') {
      readActions.forEach((actionItem) =>
        addToResult(`${resource}:${actionItem}`, resultSet)
      );
    }
    if (action === 'write') {
      writeActions.forEach((actionItem) =>
        addToResult(`${resource}:${actionItem}`, resultSet)
      );
    }
  }

  return resultSet;
}

// raw space separated string scopes to array.
export function normalizeScopes(
  raw?: string | string[],
  separator = ' '
): ResourceScopeKey[] {
  const mapRawScopes = (rawScopes: string[]) =>
    rawScopes
      .map((rawScope) => resourceScopes.get(rawScope)?.name)
      .filter((scope) => scope !== undefined);
  if (Array.isArray(raw)) {
    return mapRawScopes(raw);
  }
  if (typeof raw === 'string') {
    return mapRawScopes(raw.split(separator));
  }

  return [];
}

// check required scopes with an expanded scope list.
export function hasAny(
  expanded: Set<ResourceScopeKey>,
  required: ResourceScopeKey[]
) {
  if (!required.length) {
    return true;
  }

  return required.some((requiredScope) => expanded.has(requiredScope));
}

// scope helper.
export const need = {
  get: (res: ResourceScopeName) => ({
    requiredScopes: getValidScopes([`${res}:read`, `${res}:get`]),
  }),
  list: (res: ResourceScopeName) => ({
    requiredScopes: getValidScopes([`${res}:read`, `${res}:list`]),
  }),
  anyReadWrite: (res: ResourceScopeName) => ({
    requiredScopes: getValidScopes(getAllResourceScopes(res)),
  }),
  create: (res: ResourceScopeName) => ({
    requiredScopes: getValidScopes([`${res}:write`, `${res}:create`]),
  }),
  update: (res: ResourceScopeName) => ({
    requiredScopes: getValidScopes([`${res}:write`, `${res}:update`]),
  }),
  delete: (res: ResourceScopeName) => ({
    requiredScopes: getValidScopes([`${res}:write`, `${res}:delete`]),
  }),
  act: (res: ResourceScopeName, action: AllActions) => ({
    requiredScopes: getValidScopes([`${res}:${action}`]),
  }),
};
