import {
  PolicyFileCreatePage,
  PolicyFileUpdatePage,
  PolicyUpdatePage,
} from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import ModuleGatedRoute from 'src/rbac/ModuleGatedRoute';
import ProtectedRoute from 'src/rbac/ProtectedRoute';
import { ParamId } from 'src/routes/constants';

import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { actionRoute } from './actionRoutes.config';
import { assessmentsRoute } from './assessmentRoutes.config';
import { issueRoute } from './issueRoutes.config';

export const documentRoute: RouteObject = {
  path: `:${ParamId.Document}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.Document,
      paramName: ParamId.Document,
    },
  },
  children: [
    {
      index: true,
      element: (
        <ModuleGatedRoute moduleKey={'document'}>
          <ProtectedRoute
            permission={'read:document'}
            canHaveAccessAsContributor={true}
          >
            <PolicyUpdatePage activeTabId={'details'} />
          </ProtectedRoute>
        </ModuleGatedRoute>
      ),
    },
    {
      path: 'actions',
      handle: {
        title: () => i18n.format(i18n.t('action_other'), 'capitalize'),
      },
      children: [
        {
          index: true,
          element: (
            <ModuleGatedRoute moduleKey={'document'}>
              <ProtectedRoute
                permission={'read:document'}
                canHaveAccessAsContributor={true}
              >
                <PolicyUpdatePage activeTabId={'actions'} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        actionRoute,
      ],
    },
    {
      path: 'ratings',
      handle: {
        title: () => i18n.format(i18n.t('assessment_other'), 'capitalize'),
      },
      children: [
        {
          index: true,
          element: (
            <ModuleGatedRoute moduleKey={'document'}>
              <ProtectedRoute
                permission={'read:document'}
                canHaveAccessAsContributor={true}
              >
                <PolicyUpdatePage activeTabId={'ratings'} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        assessmentsRoute,
      ],
    },
    {
      path: 'files',
      handle: {
        title: () => i18n.format(i18n.t('versions'), 'capitalize'),
      },
      children: [
        {
          index: true,
          element: (
            <ModuleGatedRoute moduleKey={'document'}>
              <ProtectedRoute
                permission={'read:document'}
                canHaveAccessAsContributor={true}
              >
                <PolicyUpdatePage activeTabId={'files'} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        {
          path: `update/:${ParamId.DocumentFile}`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.DocumentFile,
              paramName: ParamId.DocumentFile,
            },
          },
          children: [
            {
              index: true,
              element: (
                <ModuleGatedRoute moduleKey={'document'}>
                  <PolicyFileUpdatePage activeTabId={'details'} />
                </ModuleGatedRoute>
              ),
            },
            {
              path: 'attestations',
              element: (
                <ModuleGatedRoute moduleKey={'document.subModules.attestation'}>
                  <PolicyFileUpdatePage activeTabId={'attestations'} />
                </ModuleGatedRoute>
              ),
            },
          ],
        },

        {
          path: 'create',
          handle: {
            title: () => i18n.format(i18n.t('create_version'), 'capitalize'),
          },
          element: (
            <ModuleGatedRoute moduleKey={'document'}>
              <PolicyFileCreatePage />
            </ModuleGatedRoute>
          ),
        },
      ],
    },
    ...Object.entries(IssueTypeMapping).map(([_, itm]) => ({
      path: itm.uriPath,
      handle: {
        title: () => i18n.format(i18n.t(itm.entityLabelOther), 'capitalize'),
      },
      children: [
        {
          index: true,
          element: (
            <ModuleGatedRoute moduleKey={'document'}>
              <ProtectedRoute
                permission={'read:document'}
                canHaveAccessAsContributor={true}
              >
                <PolicyUpdatePage activeTabId={itm.taxonomy} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        issueRoute(itm.type),
      ],
    })),
    {
      path: 'approvals',
      handle: {
        title: () => i18n.t('approvals.tab_title'),
      },
      element: (
        <ProtectedRoute
          permission={'read:document'}
          canHaveAccessAsContributor={true}
        >
          <PolicyUpdatePage activeTabId={'approvals'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'linked-items',
      handle: {
        title: () => i18n.t('linkedItems.tab_title'),
      },
      element: (
        <ProtectedRoute
          permission={'read:document'}
          canHaveAccessAsContributor={true}
        >
          <PolicyUpdatePage activeTabId={'linkedItems'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'attestations',
      handle: {
        title: () => i18n.t('attestations.tab_title'),
      },
      element: (
        <ProtectedRoute
          permission={'read:document'}
          canHaveAccessAsContributor={true}
        >
          <PolicyUpdatePage activeTabId={'attestations'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'notification-history',
      handle: {
        title: () => i18n.t('notificationHistory.tab_title'),
      },
      element: (
        <ProtectedRoute
          permission={'read:document'}
          canHaveAccessAsContributor={true}
        >
          <PolicyUpdatePage activeTabId={'notificationHistory'} />
        </ProtectedRoute>
      ),
    },
  ],
};
