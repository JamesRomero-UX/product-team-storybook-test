import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { useModules } from 'src/context/moduleContext';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { getWrapper } from 'src/testing/wrapper';
import { vi, vitest } from 'vitest';

import {
  useIsFeatureFlagEnabled,
  useIsFeatureFlagEnabledLazy,
} from '@/hooks/useIsFeatureFlagEnabled';
import {
  useIsModuleEnabled,
  useIsModuleEnabledLazy,
} from '@/hooks/useIsModuleEnabled';

import useTabPreferences from './useTabPreferences';
import useTabs from './useTabs';

vi.mock('src/context/moduleContext');
vi.mock('@/hooks/useIsFeatureFlagEnabled');
vi.mock('@/hooks/useIsModuleEnabled');
vi.mock('./useTabPreferences');

const mockedUseIsFeatureFlagEnabled = vitest.mocked(useIsFeatureFlagEnabled);
const mockedUseIsFeatureFlagEnabledLazy = vitest.mocked(
  useIsFeatureFlagEnabledLazy
);
const mockedUseIsModuleEnabled = vitest.mocked(useIsModuleEnabled);
const mockedUseIsModuleEnabledLazy = vitest.mocked(useIsModuleEnabledLazy);
const mockedUseModules = vitest.mocked(useModules);
const mockedUseTabPreferences = vitest.mocked(useTabPreferences);

describe('useTabs', () => {
  beforeEach(() => {
    mockedUseModules.mockReturnValue({
      isModuleEnabled: () => true,
      toggle: () => Promise.resolve(),
      modules: {},
      commit: () => Promise.resolve(),
      reset: () => Promise.resolve(),
      loading: false,
      setConfig: () => false,
      isDirty: false,
    });
  });

  describe('settings', () => {
    beforeEach(() => {
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('trpc')
        .mockReturnValue(false);
      mockedUseIsFeatureFlagEnabledLazy.mockReturnValue((flag) =>
        mockedUseIsFeatureFlagEnabled(flag)
      );
      mockedUseIsModuleEnabledLazy.mockReturnValue((key) =>
        mockedUseIsModuleEnabled(key)
      );

      mockedUseTabPreferences.mockReturnValue({
        tabs: [
          { id: 'users' },
          { id: 'userGroups' },
          { id: 'tags' },
          { id: 'taxonomy' },
          { id: 'dataImport' },
          { id: 'dataExport' },
          { id: 'authentication' },
          { id: 'approvals' },
        ],
        loading: false,
      });
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should NOT return any tabs when the settings feature is disabled', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Translations')
      ).not.toBeDefined();
    });

    it('should return the taxonomy tab when the user has the update:taxonomy permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'taxonomy',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Translations')
      ).toBeDefined();
    });

    it('should NOT return the taxonomy tab when the user does not have update:taxonomy permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Translations')
      ).not.toBeDefined();
    });

    it('should return the users tab when the user has the update:settings_users permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'settings_users',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Users')).toBeDefined();
    });

    it('should NOT return the users tab when when the user does not have update:settings_users permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Users')).not.toBeDefined();
    });

    it('should return the groups tab when the user has the update:settings_user_groups permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'settings_user_groups',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Groups')).toBeDefined();
    });

    it('should NOT return the groups tab when the user does not have the update:settings_user_groups permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Groups')
      ).not.toBeDefined();
    });

    it('should return the tags tab when the user has the update:settings_tags permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'settings_tags',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Tags')).toBeDefined();
    });

    it('should NOT return the tags tab when the user does not have the update:settings_tags permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Tags')).not.toBeDefined();
    });

    it('should return the approvals tab when approvers feature is enabled and user has update:settings_approvals permission', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('approval')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'settings_approvals',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Approvals')).toBeDefined();
    });

    it('should NOT return the approvals tab when approvers feature is disabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('approval')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'settings_approvals',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Approvals')
      ).not.toBeDefined();
    });

    it('should NOT return the approvals tab when user does not have update:settings_approvals permission', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('approval')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Approvals')
      ).not.toBeDefined();
    });

    it('should NOT return the data import tab when the user does not have insert:data_import permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Data Import')
      ).not.toBeDefined();
    });

    it('should return the data import tab when the user has the insert:data_import permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    ObjectType: Parent_Type_Enum.DataImport,
                    ContributorType: Contributor_Type_Enum.Any,
                    AccessType: Access_Type_Enum.Insert,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Data Import')
      ).toBeDefined();
    });

    it('should return the authentication tab when authentication feature is enabled and user has update:scim_configuration permission', async () => {
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('authentication')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'scim_configuration',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Authentication')
      ).toBeDefined();
    });

    it('should NOT return the authentication tab when authentication feature is disabled', async () => {
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('authentication')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'update',
                    ContributorType: 'any',
                    ObjectType: 'scim_configuration',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Authentication')
      ).not.toBeDefined();
    });

    it('should NOT return the authentication tab when user does not have update:scim_configuration permission', async () => {
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('authentication')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Authentication')
      ).not.toBeDefined();
    });

    it('should return dataExport tab when user has read:data_export permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: 'read',
                    ContributorType: 'any',
                    ObjectType: 'data_export',
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );

      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);

      expect(
        result.current.find((t) => t.label === 'Data Export')
      ).toBeDefined();
    });

    it('should NOT return dataExport tab when user does not have read:data_export permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Settings,
            parent: undefined,
            hrefRoot: '/settings',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );

      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);

      expect(
        result.current.find((t) => t.label === 'Data Export')
      ).not.toBeDefined();
    });
  });

  describe('risks', () => {
    beforeEach(() => {
      mockedUseTabPreferences.mockReturnValue({
        tabs: [
          { id: 'details' },
          { id: 'controls' },
          { id: 'assessments' },
          { id: 'appetites' },
          { id: 'acceptances' },
          { id: 'actions' },
          { id: 'indicators' },
          { id: 'impacts' },
          { id: 'approvals' },
          { id: 'linkedItems' },
        ],
        loading: false,
      });
      mockedUseIsFeatureFlagEnabled.mockReturnValue(false);
      mockedUseIsModuleEnabled.mockReturnValue(false);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('trpc')
        .mockReturnValue(false);
      mockedUseIsFeatureFlagEnabledLazy.mockReturnValue((flag) =>
        mockedUseIsFeatureFlagEnabled(flag)
      );
      mockedUseIsModuleEnabledLazy.mockReturnValue((key) =>
        mockedUseIsModuleEnabled(key)
      );
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-gc')
        .mockReturnValue(false);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-allica')
        .mockReturnValue(false);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should return the impacts tab when the user has read:impact_rating permission and impacts feature flag enabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.ImpactRating,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Impacts')).toBeDefined();
    });

    it('should return the controls tab when the user has read:control permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Control,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Controls')).toBeDefined();
    });

    it('should NOT return the controls tab when the user does NOT have read:control permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Controls')
      ).not.toBeDefined();
    });

    it('should NOT return the ratings tab when the user does NOT have read:assessment permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Ratings')
      ).not.toBeDefined();
    });

    it('should return the appetite tab when the user has read:appetite permission', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.appetite')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Appetite,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Appetite')).toBeDefined();
    });

    it('should NOT return the Appetite tab when the user does NOT have read:appetite permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Appetite')
      ).not.toBeDefined();
    });

    it('should NOT return the impacts tab when the user does NOT have read:impact_rating permission and impacts feature flag enabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Impacts')
      ).not.toBeDefined();
    });

    it('should NOT return the impacts tab when the user has read:impact_rating permission and impacts feature flag disabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.ImpactRating,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Impacts')
      ).not.toBeDefined();
    });

    it('should NOT return the ratings tab when the user has read:assessment permission and impacts feature flag enabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Assessment,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Ratings')
      ).not.toBeDefined();
    });

    it('should return the ratings tab when the user has read:assessment permission and impacts feature flag NOT enabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Assessment,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Ratings')).toBeDefined();
    });

    it('should return the actions tab when the user has read:action permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Action,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Actions')).toBeDefined();
    });

    it('should NOT return the Actions tab when the user does NOT have read:action permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Actions')
      ).not.toBeDefined();
    });

    it('should return the Indicators tab when the user has read:indicator permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Indicator,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Indicators')
      ).toBeDefined();
    });

    it('should NOT return the Indicators tab when the user does NOT have read:indicator permission', async () => {
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Indicators')
      ).not.toBeDefined();
    });

    it('should return the Approvals tab when approvals enabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('approval')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(result.current.find((t) => t.label === 'Approvals')).toBeDefined();
    });

    it('should NOT return the Approvals tab when approvals NOT enabled', async () => {
      when(mockedUseIsModuleEnabled)
        .calledWith('approval')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.Risk,
            parent: undefined,
            hrefRoot: '/risks/a-risk-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      expect(
        result.current.find((t) => t.label === 'Approvals')
      ).not.toBeDefined();
    });
  });

  describe('third parties', () => {
    beforeEach(() => {
      mockedUseTabPreferences.mockReturnValue({
        tabs: [
          { id: 'details' },
          { id: 'questionnaires' },
          { id: 'controls' },
          { id: 'issues' },
          { id: 'issuesRiskEvents' },
          { id: 'issuesBreachLog' },
          { id: 'issuesConsumerDuty' },
          { id: 'issuesCustomerTrust' },
          { id: 'issuesGDPRBreachLog' },
          { id: 'issuesPCIBreachLog' },
          { id: 'issuesSARLog' },
          { id: 'actions' },
        ],
        loading: false,
      });
      mockedUseIsFeatureFlagEnabled.mockReturnValue(false);
      mockedUseIsModuleEnabled.mockReturnValue(false);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('trpc')
        .mockReturnValue(false);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('Enables issue tab if permissions allow and hides issue variants', async () => {
      mockedUseIsFeatureFlagEnabledLazy.mockReturnValue((flag) =>
        mockedUseIsFeatureFlagEnabled(flag)
      );
      mockedUseIsModuleEnabledLazy.mockReturnValue((key) =>
        mockedUseIsModuleEnabled(key)
      );
      when(mockedUseIsModuleEnabled).calledWith('issue').mockReturnValue(true);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-gc')
        .mockReturnValue(false);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-allica')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.ThirdParty,
            parent: undefined,
            hrefRoot: '/third-party/a-third-party-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Issue,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      const tabs = result.current;

      const issueTabs = tabs.filter((tab) => tab.label === 'Issues');
      expect(issueTabs).toHaveLength(1);

      const riskEventTabs = tabs.filter((tab) => tab.label === 'Risk events');
      expect(riskEventTabs).toHaveLength(0);

      const breachesTabs = tabs.filter((tab) => tab.label === 'Breaches');
      expect(breachesTabs).toHaveLength(0);

      const consumerDutiesTabs = tabs.filter(
        (tab) => tab.label === 'Consumer duties'
      );
      expect(consumerDutiesTabs).toHaveLength(0);

      const customerTrustsTabs = tabs.filter(
        (tab) => tab.label === 'Customer trusts'
      );
      expect(customerTrustsTabs).toHaveLength(0);

      const gdprBreachesTabs = tabs.filter(
        (tab) => tab.label === 'GDPR breaches'
      );
      expect(gdprBreachesTabs).toHaveLength(0);

      const pciBreachesTabs = tabs.filter(
        (tab) => tab.label === 'PCI breaches'
      );
      expect(pciBreachesTabs).toHaveLength(0);

      const sarsTabs = tabs.filter((tab) => tab.label === 'SARs');
      expect(sarsTabs).toHaveLength(0);
    });

    it('Enables issue and risk events if allica feature flag true', async () => {
      mockedUseIsFeatureFlagEnabledLazy.mockReturnValue((flag) =>
        mockedUseIsFeatureFlagEnabled(flag)
      );
      mockedUseIsModuleEnabledLazy.mockReturnValue((key) =>
        mockedUseIsModuleEnabled(key)
      );
      when(mockedUseIsModuleEnabled).calledWith('issue').mockReturnValue(true);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-gc')
        .mockReturnValue(false);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-allica')
        .mockReturnValue(true);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.ThirdParty,
            parent: undefined,
            hrefRoot: '/third-party/a-third-party-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Issue,
                  },
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.IssueRiskEvent,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      const tabs = result.current;

      const issueTabs = tabs.filter((tab) => tab.label === 'Issues');
      expect(issueTabs).toHaveLength(1);

      const riskEventTabs = tabs.filter((tab) => tab.label === 'Risk events');
      expect(riskEventTabs).toHaveLength(1);
    });

    it('Enables issue and golden charter issue tabs if feature flag true', async () => {
      mockedUseIsFeatureFlagEnabledLazy.mockReturnValue((flag) =>
        mockedUseIsFeatureFlagEnabled(flag)
      );
      mockedUseIsModuleEnabledLazy.mockReturnValue((key) =>
        mockedUseIsModuleEnabled(key)
      );
      when(mockedUseIsModuleEnabled).calledWith('issue').mockReturnValue(true);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-gc')
        .mockReturnValue(true);
      when(mockedUseIsFeatureFlagEnabled)
        .calledWith('issue-allica')
        .mockReturnValue(false);
      const { result } = renderHook(
        () =>
          useTabs({
            parentType: Parent_Type_Enum.ThirdParty,
            parent: undefined,
            hrefRoot: '/third-party/a-third-party-id',
          }),
        {
          wrapper: getWrapper(
            [
              mockedGetOrganisation(),
              mockedRoleAccessResponse({
                role_access: [
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.Issue,
                  },
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.IssueBreachLog,
                  },
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.IssueConsumerDuty,
                  },
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.IssueCustomerTrust,
                  },
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.IssueGdprBreachLog,
                  },
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.IssuePciBreachLog,
                  },
                  {
                    AccessType: Access_Type_Enum.Read,
                    ContributorType: Contributor_Type_Enum.Any,
                    ObjectType: Parent_Type_Enum.IssueSarLog,
                  },
                ],
              }),
            ],
            'graphql',
            'permission',
            'features',
            'trpc'
          ),
        }
      );
      await waitFor(() => result.current);
      await waitFor(() => result.current?.length && result.current.length > 0);
      const tabs = result.current;

      const issueTabs = tabs.filter((tab) => tab.label === 'Issues');
      expect(issueTabs).toHaveLength(1);

      const breachesTabs = tabs.filter((tab) => tab.label === 'Breaches');
      expect(breachesTabs).toHaveLength(1);

      const consumerDutiesTabs = tabs.filter(
        (tab) => tab.label === 'Consumer duties'
      );
      expect(consumerDutiesTabs).toHaveLength(1);

      const customerTrustsTabs = tabs.filter(
        (tab) => tab.label === 'Customer trusts'
      );
      expect(customerTrustsTabs).toHaveLength(1);

      const gdprBreachesTabs = tabs.filter(
        (tab) => tab.label === 'GDPR breaches'
      );
      expect(gdprBreachesTabs).toHaveLength(1);

      const pciBreachesTabs = tabs.filter(
        (tab) => tab.label === 'PCI breaches'
      );
      expect(pciBreachesTabs).toHaveLength(1);

      const sarsTabs = tabs.filter((tab) => tab.label === 'SARs');
      expect(sarsTabs).toHaveLength(1);
    });
  });
});
