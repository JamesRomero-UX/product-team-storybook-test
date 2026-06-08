import {
  CreateInternalAuditResultPage,
  InternalAuditReportUpdatePage,
  UpdateInternalAuditResultPage,
} from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import { ParamId } from 'src/routes/constants';

export const internalAuditReportsRoute: RouteObject = {
  path: `:${ParamId.InternalAuditReport}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.InternalAuditReport,
      paramName: ParamId.InternalAuditReport,
    },
  },
  children: [
    {
      path: '',
      element: <InternalAuditReportUpdatePage activeTabId={'details'} />,
    },
    {
      path: 'activities',
      handle: {
        title: () => i18n.format(i18n.t('activity_other'), 'capitalizeAll'),
      },
      children: [
        {
          path: '',
          element: (
            <InternalAuditReportUpdatePage
              activeTabId={'activities'}
              activityMode={'list'}
            />
          ),
        },
        {
          path: 'add',
          handle: {
            title: () => i18n.format(i18n.t('activity_one'), 'capitalizeAll'),
          },
          element: (
            <InternalAuditReportUpdatePage
              activeTabId={'activities'}
              activityMode={'addActivity'}
            />
          ),
        },
        {
          path: `:${ParamId.AssessmentActivity}`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.AssessmentActivity,
              paramName: ParamId.AssessmentActivity,
            },
          },
          element: (
            <InternalAuditReportUpdatePage
              activeTabId={'activities'}
              activityMode={'updateActivity'}
            />
          ),
        },
      ],
    },

    {
      path: 'findings',
      handle: {
        title: () => i18n.format(i18n.t('finding_other'), 'capitalizeAll'),
      },
      children: [
        {
          path: '',
          element: <InternalAuditReportUpdatePage activeTabId={'findings'} />,
        },
        {
          path: ':findingId',
          handle: {
            title: () => i18n.format(i18n.t('finding_one'), 'capitalizeAll'),
          },
          element: <UpdateInternalAuditResultPage />,
        },
        {
          path: 'add',
          element: <CreateInternalAuditResultPage />,
          handle: {
            title: () => i18n.t('assessmentResults.create_title'),
          },
        },
      ],
    },

    {
      path: 'linked-items',
      children: [
        {
          path: '',
          element: (
            <InternalAuditReportUpdatePage activeTabId={'linkedItems'} />
          ),
        },
      ],
    },
  ],
};
