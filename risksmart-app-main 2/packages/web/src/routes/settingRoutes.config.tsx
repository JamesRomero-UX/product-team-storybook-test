import {
  CustomRoleUpdatePage,
  DataImportUpdatePage,
  GroupUpdatePage,
  RiskScoringSettingsPage,
  SettingsPage,
} from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Navigate, type RouteObject } from 'react-router';
import ModuleGatedRoute from 'src/rbac/ModuleGatedRoute';
import OrgFeatureFlaggedRoute from 'src/rbac/OrgFeatureFlaggedRoute';
import ProtectedRoute from 'src/rbac/ProtectedRoute';
import { ParamId } from 'src/routes/constants';

export const settingsRoute: RouteObject = {
  path: '',
  children: [
    {
      index: true,
      path: '',
      element: (
        <ProtectedRoute permission={'read:settings'}>
          <SettingsPage />
        </ProtectedRoute>
      ),
    },
    {
      handle: {
        title: () => 'Translations',
      },
      path: 'taxonomy',
      element: (
        <ProtectedRoute permission={'update:taxonomy'}>
          <SettingsPage activeTabId={'taxonomy'} />
        </ProtectedRoute>
      ),
    },
    {
      handle: {
        title: () => i18n.format(i18n.t('user_other'), 'capitalize'),
      },
      path: 'users',
      element: (
        <ProtectedRoute permission={'read:settings'}>
          <SettingsPage activeTabId={'users'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'approvals',
      handle: {
        title: () => i18n.t('approvals.page_title'),
      },
      children: [
        {
          index: true,
          element: (
            <ModuleGatedRoute moduleKey={'approval'}>
              <ProtectedRoute permission={'read:settings'}>
                <SettingsPage activeTabId={'approvals'} />
              </ProtectedRoute>
            </ModuleGatedRoute>
          ),
        },
      ],
    },
    {
      path: 'groups',
      handle: {
        title: () => i18n.t('userGroups.groupsTableTitle'),
      },
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute permission={'read:settings'}>
              <SettingsPage activeTabId={'groups'} />
            </ProtectedRoute>
          ),
        },
        {
          path: `:${ParamId.UserGroup}`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.SettingsUserGroups,
              paramName: ParamId.UserGroup,
            },
          },
          children: [
            {
              path: 'details',
              element: (
                <ProtectedRoute permission={'read:settings'}>
                  <GroupUpdatePage activeTabId={'details'} />
                </ProtectedRoute>
              ),
            },
            {
              path: 'members',
              handle: {
                title: () =>
                  i18n.format(
                    i18n.t('userGroupMembers.membersTableTitle'),
                    'capitalize'
                  ),
              },
              element: (
                <ProtectedRoute permission={'read:settings'}>
                  <GroupUpdatePage activeTabId={'members'} />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      handle: {
        title: () => i18n.format(i18n.t('tag_other'), 'capitalize'),
      },
      path: 'tags',
      element: (
        <ProtectedRoute permission={'read:settings'}>
          <SettingsPage activeTabId={'tags'} />
        </ProtectedRoute>
      ),
    },
    {
      handle: {
        title: () => i18n.format(i18n.t('department_other'), 'capitalize'),
      },
      path: 'departments',
      element: (
        <ProtectedRoute permission={'read:settings'}>
          <SettingsPage activeTabId={'departments'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'entities',
      handle: {
        title: () => i18n.t('entity.entityTabTitle'),
      },
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute permission={'read:entity'}>
              <SettingsPage activeTabId={'entities'} />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      handle: {
        title: () => i18n.format(i18n.t('authentication_one'), 'capitalize'),
      },
      path: 'authentication',
      element: (
        <OrgFeatureFlaggedRoute featureFlag={'authentication'}>
          <ProtectedRoute permission={'read:scim_configuration'}>
            <SettingsPage activeTabId={'authentication'} />
          </ProtectedRoute>
        </OrgFeatureFlaggedRoute>
      ),
    },
    {
      path: 'sso',
      handle: {
        title: () => 'SSO',
      },
      element: (
        <ProtectedRoute permission={'read:sso_configuration'}>
          <SettingsPage activeTabId={'sso'} />
        </ProtectedRoute>
      ),
    },
    {
      handle: {
        title: () => i18n.format(i18n.t('audit_one'), 'capitalize'),
      },
      path: 'audit',
      element: (
        <ProtectedRoute permission={'read:settings'}>
          <SettingsPage activeTabId={'audit'} />
        </ProtectedRoute>
      ),
    },
    {
      handle: {
        title: () => i18n.t('notificationHistory.tab_title'),
      },
      path: 'notifications',
      element: (
        <ProtectedRoute permission={'read:settings'}>
          <SettingsPage activeTabId={'notifications'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'data-import',
      handle: {
        title: () => 'Data Import',
      },
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute permission={'insert:data_import'}>
              <SettingsPage activeTabId={'dataImport'} />
            </ProtectedRoute>
          ),
        },
        {
          path: 'add',
          handle: {
            title: () => 'Add',
          },
          element: (
            <ProtectedRoute permission={'insert:data_import'}>
              <DataImportUpdatePage selectedTabId={'details'} />
            </ProtectedRoute>
          ),
        },
        {
          path: `:${ParamId.DataImport}`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.DataImport,
              paramName: ParamId.DataImport,
            },
          },
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute permission={'insert:data_import'}>
                  <DataImportUpdatePage selectedTabId={'details'} />
                </ProtectedRoute>
              ),
            },
            {
              path: 'results',
              handle: {
                title: () => 'Results',
              },
              element: (
                <ProtectedRoute permission={'insert:data_import'}>
                  <DataImportUpdatePage selectedTabId={'results'} />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: 'data-export',
      handle: {
        title: () => 'Data Export',
      },
      element: (
        <ProtectedRoute permission={'read:data_export'}>
          <SettingsPage activeTabId={'dataExport'} />
        </ProtectedRoute>
      ),
    },
    {
      path: 'modules',
      handle: {
        title: () => i18n.t('modules.tab_title'),
      },
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute permission={'read:settings_module'}>
              <SettingsPage activeTabId={'modules'} />
            </ProtectedRoute>
          ),
        },
        {
          path: 'risk',
          handle: {
            title: () => i18n.t('risk'),
          },
          children: [
            {
              index: true,
              element: (
                <Navigate
                  to={'/settings/modules/risk/scoring-settings'}
                  replace
                />
              ),
            },
            {
              path: 'scoring-settings',
              handle: {
                title: () => i18n.t('riskScoringSettings.page.title'),
              },
              element: (
                <ModuleGatedRoute moduleKey={'risk.subModules.risk_scoring'}>
                  <ProtectedRoute permission={'read:settings'}>
                    <RiskScoringSettingsPage />
                  </ProtectedRoute>
                </ModuleGatedRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: 'colours',
      handle: {
        title: () => i18n.t('colours.tab_title'),
      },
      element: <SettingsPage activeTabId={'colours'} />,
    },
    {
      path: 'custom-roles',
      handle: {
        title: () => i18n.t('customRoles.tab_title'),
      },
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute permission={'read:settings'}>
              <SettingsPage activeTabId={'customRoles'} />
            </ProtectedRoute>
          ),
        },
        {
          path: `:${ParamId.CustomRole}`,
          handle: {
            breadcrumbNode: {
              nodeType: Parent_Type_Enum.CustomRole,
              paramName: ParamId.CustomRole,
            },
          },
          children: [
            {
              path: 'details',
              element: (
                <ProtectedRoute permission={'read:settings'}>
                  <CustomRoleUpdatePage activeTabId={'details'} />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: 'external-api',
      handle: {
        title: () => i18n.t('externalApi.tab_title'),
      },
      element: (
        <OrgFeatureFlaggedRoute featureFlag={'trpc'}>
          <ProtectedRoute permission={'read:settings'}>
            <SettingsPage activeTabId={'externalApi'} />
          </ProtectedRoute>
        </OrgFeatureFlaggedRoute>
      ),
    },
  ],
};
