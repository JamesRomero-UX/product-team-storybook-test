import {
  QuestionnaireTemplateUpdatePage,
  QuestionnaireTemplateVersionCreatePage,
  QuestionnaireTemplateVersionUpdatePage,
} from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import ModuleGatedRoute from 'src/rbac/ModuleGatedRoute';
import { ParamId } from 'src/routes/constants';

export const questionnaireTemplateRoute: RouteObject = {
  path: `:${ParamId.QuestionnaireTemplate}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.QuestionnaireTemplate,
      paramName: ParamId.QuestionnaireTemplate,
    },
  },
  children: [
    {
      index: true,
      element: (
        <ModuleGatedRoute moduleKey={'third_party'}>
          <QuestionnaireTemplateUpdatePage activeTabId={'details'} />
        </ModuleGatedRoute>
      ),
    },
    {
      path: 'versions',
      handle: {
        title: () => i18n.format(i18n.t('versions'), 'capitalize'),
      },
      children: [
        {
          index: true,
          element: (
            <ModuleGatedRoute moduleKey={'third_party'}>
              <QuestionnaireTemplateUpdatePage activeTabId={'versions'} />
            </ModuleGatedRoute>
          ),
        },
        {
          path: `update/:${ParamId.QuestionnaireTemplateVersion}`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.QuestionnaireTemplateVersion,
              paramName: ParamId.QuestionnaireTemplateVersion,
            },
          },
          children: [
            {
              index: true,
              element: (
                <ModuleGatedRoute moduleKey={'third_party'}>
                  <QuestionnaireTemplateVersionUpdatePage
                    activeTabId={'details'}
                  />
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
            <ModuleGatedRoute moduleKey={'third_party'}>
              <QuestionnaireTemplateVersionCreatePage />
            </ModuleGatedRoute>
          ),
        },
      ],
    },
  ],
};
