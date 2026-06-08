import {
  AssessmentUpdatePage,
  CreateAssessmentResultPage,
  UpdateAssessmentResultPage,
} from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';

import { ParamId } from './constants';

export const assessmentsRoute: RouteObject = {
  path: `:${ParamId.Assessment}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.Assessment,
      paramName: ParamId.Assessment,
    },
  },
  children: [
    {
      path: '',
      element: <AssessmentUpdatePage activeTabId={'details'} />,
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
            <AssessmentUpdatePage
              activeTabId={'activities'}
              activityMode={'list'}
            />
          ),
        },
        {
          path: 'add-activity',
          handle: {
            title: () => i18n.format(i18n.t('activity_one'), 'capitalizeAll'),
          },
          element: (
            <AssessmentUpdatePage
              activeTabId={'activities'}
              activityMode={'addActivity'}
            />
          ),
        },
        {
          path: 'add-rcsa',
          handle: {
            title: () => i18n.format(i18n.t('activity_one'), 'capitalizeAll'),
          },
          element: (
            <AssessmentUpdatePage
              activeTabId={'activities'}
              activityMode={'addRCSA'}
            />
          ),
        },
        {
          path: `:${ParamId.AssessmentActivity}/activity`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.AssessmentActivity,
              paramName: ParamId.AssessmentActivity,
            },
          },
          element: (
            <AssessmentUpdatePage
              activeTabId={'activities'}
              activityMode={'updateActivity'}
            />
          ),
        },
        {
          path: `:${ParamId.AssessmentActivity}/rcsa`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.AssessmentActivity,
              paramName: ParamId.AssessmentActivity,
            },
          },
          element: (
            <AssessmentUpdatePage
              activeTabId={'activities'}
              activityMode={'updateRCSA'}
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
          element: <AssessmentUpdatePage activeTabId={'findings'} />,
          index: true,
        },
        {
          path: ':findingId',
          element: <UpdateAssessmentResultPage />,

          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.AssessmentResult,
              paramName: 'findingId',
            },
          },
        },
        {
          path: 'add',
          element: <CreateAssessmentResultPage />,
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
          element: <AssessmentUpdatePage activeTabId={'linkedItems'} />,
        },
      ],
    },
  ],
};
