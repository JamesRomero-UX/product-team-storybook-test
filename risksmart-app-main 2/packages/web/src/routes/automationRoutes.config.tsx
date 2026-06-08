import { AutomationsPage } from '@pages';
import type { RouteObject } from 'react-router';
import ModuleGatedRoute from 'src/rbac/ModuleGatedRoute';

export const automationsRoute: RouteObject = {
  path: '',
  children: [
    {
      index: true,
      element: (
        <ModuleGatedRoute moduleKey={'integrations'}>
          <AutomationsPage />
        </ModuleGatedRoute>
      ),
    },
  ],
};
