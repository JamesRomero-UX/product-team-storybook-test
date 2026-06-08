import { InternalAuditUpdatePage } from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import ModuleGatedRoute from 'src/rbac/ModuleGatedRoute';
import ProtectedRoute from 'src/rbac/ProtectedRoute';
import { ParamId } from 'src/routes/constants';

import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { actionRoute } from './actionRoutes.config';
import { internalAuditReportsRoute } from './internalAuditReportRoutes.config';
import { issueRoute } from './issueRoutes.config';

export const internalAuditRoute: RouteObject = {
  path: `:${ParamId.InternalAudit}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.InternalAuditEntity,
      paramName: ParamId.InternalAudit,
    },
  },
  children: [
    {
      path: '',
      element: (
        <ModuleGatedRoute moduleKey={'internal_audit_entity'}>
          <ProtectedRoute
            permission={'read:internal_audit_entity'}
            canHaveAccessAsContributor={true}
          >
            <InternalAuditUpdatePage activeTabId={'details'} />
          </ProtectedRoute>
        </ModuleGatedRoute>
      ),
    },
    {
      path: 'reports',
      handle: {
        title: () =>
          i18n.format(i18n.t('internal_audit_report_other'), 'capitalize'),
      },
      children: [
        {
          path: '',
          element: (
            <ModuleGatedRoute moduleKey={'internal_audit_entity'}>
              <ProtectedRoute
                permission={'read:internal_audit_entity'}
                canHaveAccessAsContributor={true}
              >
                <InternalAuditUpdatePage activeTabId={'reports'} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        internalAuditReportsRoute,
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
            <ModuleGatedRoute moduleKey={'internal_audit_entity'}>
              <ProtectedRoute
                permission={'read:internal_audit_entity'}
                canHaveAccessAsContributor={true}
              >
                <InternalAuditUpdatePage activeTabId={itm.taxonomy} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        issueRoute(itm.type),
      ],
    })),
    {
      path: 'actions',
      handle: {
        title: () => i18n.format(i18n.t('action_other'), 'capitalize'),
      },
      children: [
        {
          path: '',
          element: (
            <ModuleGatedRoute moduleKey={'internal_audit_entity'}>
              <ProtectedRoute
                permission={'read:internal_audit_entity'}
                canHaveAccessAsContributor={true}
              >
                <InternalAuditUpdatePage activeTabId={'actions'} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        actionRoute,
      ],
    },
    {
      path: 'risks',
      handle: {
        title: () => i18n.format(i18n.t('risk_other'), 'capitalize'),
      },
      children: [
        {
          path: '',
          element: (
            <ModuleGatedRoute moduleKey={'internal_audit_entity'}>
              <ProtectedRoute
                permission={'read:internal_audit_entity'}
                canHaveAccessAsContributor={true}
              >
                <InternalAuditUpdatePage activeTabId={'risks'} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        internalAuditReportsRoute,
      ],
    },
  ],
};
