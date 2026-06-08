import { collectEnabledModulePaths } from '@risksmart-app/modules/src/module-resolver';
import type { ModuleConfig } from '@risksmart-app/modules/src/types';

import type { ResourceScope } from '../../auth/scopes';

export const resolveScopesFromConfig = (
  config: ModuleConfig,
  allScopes: ResourceScope[]
): ResourceScope[] => {
  const enabledModulePaths = collectEnabledModulePaths(config);

  if (enabledModulePaths.size === 0) {
    return [];
  }

  // Filter scopes by module attribute, dedupe by name
  const result: ResourceScope[] = [];
  const seenNames = new Set<string>();

  for (const scope of allScopes) {
    if (enabledModulePaths.has(scope.module) && !seenNames.has(scope.name)) {
      seenNames.add(scope.name);
      result.push(scope);
    }
  }

  return result;
};
