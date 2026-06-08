import type { HandleOptions } from '@risksmart-app/components/src/breadcrumbs/types';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import EnterpriseRiskCreatePage from 'src/pages/enterprise-risk/create/Page';
import EnterpriseRiskPage from 'src/pages/enterprise-risk/Page';
import EnterpriseRiskUpdatePage from 'src/pages/enterprise-risk/update/Page';
import ModuleGatedRoute from 'src/rbac/ModuleGatedRoute';
import ProtectedRoute from 'src/rbac/ProtectedRoute';
import { ParamId } from 'src/routes/constants';

import { enterpriseRiskDashboardUrl, enterpriseRiskUrl } from '@/utils/urls';

export const enterpriseRiskRoute: RouteObject = {
  path: enterpriseRiskUrl,
  handle: {
    title: () => i18n.format(i18n.t('enterprise_risk_other'), 'capitalizeAll'),
    breadcrumbUrl: (options: HandleOptions) => {
      if (options.location.state?.from === 'enterprise-risk-dashboard') {
        return enterpriseRiskDashboardUrl();
      }

      return enterpriseRiskUrl;
    },
  },
  children: [
    {
      path: enterpriseRiskUrl,
      index: true,
      element: (
        <ModuleGatedRoute moduleKey={'enterprise_risk'}>
          <ProtectedRoute permission={'read:enterprise_risk'}>
            <EnterpriseRiskPage />
          </ProtectedRoute>
        </ModuleGatedRoute>
      ),
    },
    {
      path: 'add',
      element: (
        <ModuleGatedRoute moduleKey={'enterprise_risk'}>
          <ProtectedRoute permission={'insert:enterprise_risk'}>
            <EnterpriseRiskCreatePage />
          </ProtectedRoute>
        </ModuleGatedRoute>
      ),
    },
    {
      path: `:${ParamId.EnterpriseRisk}`,
      handle: {
        breadcrumbNode: {
          nodeType: Parent_Type_Enum.EnterpriseRisk,
          paramName: ParamId.EnterpriseRisk,
        },
      },
      children: [
        {
          path: '',
          element: (
            <ModuleGatedRoute moduleKey={'enterprise_risk'}>
              <ProtectedRoute permission={'read:enterprise_risk'}>
                <EnterpriseRiskUpdatePage
                  selectedTabId={'details'}
                  showDeleteButton={true}
                />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
        {
          path: 'risks',
          handle: {
            title: () => i18n.format(i18n.t('risk_other'), 'capitalize'),
          },
          element: (
            <ModuleGatedRoute moduleKey={'enterprise_risk'}>
              <ProtectedRoute permission={'read:enterprise_risk'}>
                <EnterpriseRiskUpdatePage
                  selectedTabId={'risks'}
                  showDeleteButton={true}
                />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
      ],
    },
  ],
};
