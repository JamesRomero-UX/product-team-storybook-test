import {
  ComplianceMonitoringAssessmentUpdatePage,
  CreateMonitoringAssessmentsResultPage,
  UpdateMonitoringAssessmentsResultPage,
} from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import { ParamId } from 'src/routes/constants';

export const complianceMonitoringAssessmentRoute: RouteObject = {
  path: `:${ParamId.ComplianceMonitoringAssessment}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.ComplianceMonitoringAssessment,
      paramName: ParamId.ComplianceMonitoringAssessment,
    },
  },
  children: [
    {
      path: '',
      element: (
        <ComplianceMonitoringAssessmentUpdatePage activeTabId={'details'} />
      ),
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
            <ComplianceMonitoringAssessmentUpdatePage
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
            <ComplianceMonitoringAssessmentUpdatePage
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
            <ComplianceMonitoringAssessmentUpdatePage
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
          element: (
            <ComplianceMonitoringAssessmentUpdatePage
              activeTabId={'findings'}
            />
          ),
        },
        {
          path: ':findingId',
          handle: {
            title: () => i18n.format(i18n.t('finding_one'), 'capitalizeAll'),
          },
          element: <UpdateMonitoringAssessmentsResultPage />,
        },
        {
          path: 'add',
          element: <CreateMonitoringAssessmentsResultPage />,
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
            <ComplianceMonitoringAssessmentUpdatePage
              activeTabId={'linkedItems'}
            />
          ),
        },
      ],
    },
  ],
};
