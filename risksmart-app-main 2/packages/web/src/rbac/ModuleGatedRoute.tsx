import { Forbidden } from '@risksmart-app/components/src/errors/errors';
import type { ModuleKey } from '@risksmart-app/modules/src/index';
import type { FC, ReactNode } from 'react';
import { useModulesStore } from 'src/context/moduleContext';
import { useIsModuleEnabled } from 'src/hooks/useIsModuleEnabled';
import { useFeatures } from 'src/rbac/useFeatures';

type Props = {
  children: ReactNode;
  moduleKey: ModuleKey;
  fallback?: ReactNode;
};

const ModuleGatedRoute: FC<Props> = ({ children, moduleKey, fallback }) => {
  const enabled = useIsModuleEnabled(moduleKey);
  const features = useFeatures();
  const hydrated = useModulesStore((s) => s.hydrated);
  const modulesSystemActive = features.includes('modules');

  if (!hydrated && modulesSystemActive) {
    return null;
  }

  if (enabled) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  throw new Forbidden(`Access to module ${moduleKey} denied`);
};

export default ModuleGatedRoute;
