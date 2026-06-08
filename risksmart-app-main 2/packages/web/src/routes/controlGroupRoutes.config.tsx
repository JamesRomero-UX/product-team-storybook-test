import { ControlGroupUpdatePage } from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import ProtectedRoute from 'src/rbac/ProtectedRoute';
import { ParamId } from 'src/routes/constants';

import { controlRoute } from './controlRoute.routes.config';

export const controlGroupRoute: RouteObject = {
  path: `:${ParamId.ControlGroup}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.ControlGroup,
      paramName: ParamId.ControlGroup,
    },
  },
  children: [
    {
      path: '',
      element: (
        <ProtectedRoute permission={'read:control_group'}>
          <ControlGroupUpdatePage activeTabId={'details'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'controls',
      handle: {
        title: () => i18n.format(i18n.t('control_other'), 'capitalize'),
      },
      children: [
        {
          path: '',
          element: (
            <ProtectedRoute permission={'read:control'}>
              <ControlGroupUpdatePage activeTabId={'controls'} />
            </ProtectedRoute>
          ),
        },
        controlRoute,
      ],
    },
    {
      path: 'linked-items',
      handle: {
        title: 'Linked items',
      },
      children: [
        {
          path: '',
          element: <ControlGroupUpdatePage activeTabId={'linkedItems'} />,
        },
      ],
    },
    {
      path: 'notification-history',
      handle: {
        title: () => i18n.t('notificationHistory.tab_title'),
      },
      element: <ControlGroupUpdatePage activeTabId={'notificationHistory'} />,
    },
  ],
};
