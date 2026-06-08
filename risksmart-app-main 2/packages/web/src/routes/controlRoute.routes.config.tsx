import { ControlsUpdatePage } from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import { ParamId } from 'src/routes/constants';

import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { actionRoute } from './actionRoutes.config';
import { assessmentsRoute } from './assessmentRoutes.config';
import { indicatorRoute } from './indicatorRoutes.config';
import { issueRoute } from './issueRoutes.config';

export const controlRoute: RouteObject = {
  path: `:${ParamId.Control}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.Control,
      paramName: ParamId.Control,
    },
  },
  children: [
    {
      path: '',
      element: (
        <ControlsUpdatePage activeTabId={'details'} showDeleteButton={true} />
      ),
    },
    {
      path: 'performance',
      handle: {
        title: () => i18n.format(i18n.t('performance'), 'capitalize'),
      },
      children: [
        {
          path: '',
          element: <ControlsUpdatePage activeTabId={'performance'} />,
        },
        assessmentsRoute,
      ],
    },
    {
      path: 'actions',
      handle: {
        title: () => i18n.format(i18n.t('action_other'), 'capitalize'),
      },
      children: [
        {
          path: '',
          element: <ControlsUpdatePage activeTabId={'actions'} />,
        },
        actionRoute,
      ],
    },

    ...Object.entries(IssueTypeMapping).map(([_, itm]) => ({
      path: itm.uriPath,
      handle: {
        title: () => i18n.t(`${itm.taxonomy}.tab_title`),
      },

      children: [
        {
          path: '',
          element: <ControlsUpdatePage activeTabId={itm.taxonomy} />,
        },
        issueRoute(itm.type),
      ],
    })),
    {
      path: 'indicators',
      handle: {
        title: () => i18n.t('indicators.tab_title'),
      },

      children: [
        {
          path: '',
          element: <ControlsUpdatePage activeTabId={'indicators'} />,
        },
        indicatorRoute,
      ],
    },
    {
      path: 'approvals',
      handle: {
        title: () => i18n.t('approvals.tab_title'),
      },
      element: <ControlsUpdatePage activeTabId={'approvals'} />,
    },
    {
      path: 'linked-items',
      handle: {
        title: () => i18n.t('linkedItems.tab_title'),
      },

      children: [
        {
          path: '',
          element: <ControlsUpdatePage activeTabId={'linkedItems'} />,
        },
      ],
    },
    {
      path: 'notification-history',
      handle: {
        title: () => i18n.t('notificationHistory.tab_title'),
      },
      element: <ControlsUpdatePage activeTabId={'notificationHistory'} />,
    },
  ],
};
