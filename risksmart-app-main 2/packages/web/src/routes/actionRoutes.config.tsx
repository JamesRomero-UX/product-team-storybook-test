import { ActionsUpdatePage } from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';

import { ParamId } from './constants';

export const actionRoute: RouteObject = {
  path: `:${ParamId.Action}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.Action,
      paramName: ParamId.Action,
    },
  },
  children: [
    {
      path: '',
      element: (
        <ActionsUpdatePage activeTabId={'details'} showDeleteButton={true} />
      ),
    },
    {
      path: 'updates',
      handle: {
        title: () => i18n.format(i18n.t('update_other'), 'capitalize'),
      },
      element: <ActionsUpdatePage activeTabId={'updates'} />,
    },
    {
      path: 'linked-items',
      handle: {
        title: () => i18n.t('linkedItems.tab_title'),
      },
      element: <ActionsUpdatePage activeTabId={'linkedItems'} />,
    },
    {
      path: 'notification-history',
      handle: {
        title: () => i18n.t('notificationHistory.tab_title'),
      },
      element: <ActionsUpdatePage activeTabId={'notificationHistory'} />,
    },
  ],
};
