import { IssuesUpdatePage } from '@pages';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import { ParamId } from 'src/routes/constants';

import { actionRoute } from './actionRoutes.config';

export const issueRoute = (issueType: ParentIssueType): RouteObject => ({
  path: `:${ParamId.Issue}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.Issue,
      paramName: ParamId.Issue,
    },
  },
  children: [
    {
      path: '',
      element: (
        <IssuesUpdatePage
          activeTabId={'details'}
          showDeleteButton={true}
          issueType={issueType}
        />
      ),
    },
    {
      path: 'updates',
      handle: {
        title: () => i18n.format(i18n.t('update_other'), 'capitalize'),
      },
      element: (
        <IssuesUpdatePage activeTabId={'updates'} issueType={issueType} />
      ),
    },
    {
      path: 'actions',
      handle: {
        title: () => i18n.format(i18n.t('action_other'), 'capitalize'),
      },
      children: [
        {
          path: '',
          element: (
            <IssuesUpdatePage activeTabId={'actions'} issueType={issueType} />
          ),
        },
        actionRoute,
      ],
    },
    {
      path: 'causes',
      handle: {
        // TODO: translation
        title: 'Causes',
      },
      element: (
        <IssuesUpdatePage activeTabId={'causes'} issueType={issueType} />
      ),
    },
    {
      path: 'consequences',
      handle: {
        // TODO: translation
        title: 'Consequences',
      },
      element: (
        <IssuesUpdatePage activeTabId={'consequences'} issueType={issueType} />
      ),
    },
    {
      path: 'assessment',
      handle: {
        // TODO: translation
        title: 'Assessment',
      },
      element: (
        <IssuesUpdatePage activeTabId={'assessment'} issueType={issueType} />
      ),
    },
    {
      path: 'linked-items',
      handle: {
        title: () => i18n.t('linkedItems.tab_title'),
      },
      element: (
        <IssuesUpdatePage activeTabId={'linkedItems'} issueType={issueType} />
      ),
    },
    {
      path: 'notification-history',
      handle: {
        title: () => i18n.t('notificationHistory.tab_title'),
      },
      element: (
        <IssuesUpdatePage
          activeTabId={'notificationHistory'}
          issueType={issueType}
        />
      ),
    },
  ],
});
