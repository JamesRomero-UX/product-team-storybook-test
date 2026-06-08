import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import { renderHook } from '@testing-library/react';
import { when } from 'jest-when';
import { useModules } from 'src/context/moduleContext';
import type { ObjectAccess } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { getWrapper } from 'src/testing/wrapper';
import { expect, vi, vitest } from 'vitest';

import {
  useIsFeatureFlagEnabled,
  useIsFeatureFlagEnabledLazy,
} from '@/hooks/useIsFeatureFlagEnabled';
import {
  useIsModuleEnabled,
  useIsModuleEnabledLazy,
} from '@/hooks/useIsModuleEnabled';

import { useNavItems } from './useNavItems';

vitest.mock('src/rbac/useHasPermission');
vitest.mock('@/hooks/useIsFeatureFlagEnabled');
vitest.mock('@/hooks/useIsModuleEnabled');
vitest.mock('src/context/moduleContext');

const mockUseHasPermission = vitest.mocked(useHasPermissionQuery);
const mockedUseIsFeatureFlagEnabled = vitest.mocked(useIsFeatureFlagEnabled);
const mockedUseIsFeatureFlagEnabledLazy = vitest.mocked(
  useIsFeatureFlagEnabledLazy
);
const mockedUseIsModuleEnabled = vitest.mocked(useIsModuleEnabled);
const mockedUseIsModuleEnabledLazy = vitest.mocked(useIsModuleEnabledLazy);
const mockedUseModules = vitest.mocked(useModules);

describe('useNavItems', () => {
  const isModuleEnabled = vi.fn().mockReturnValue(false);
  beforeEach(() => {
    vitest.resetAllMocks();
    mockedUseIsModuleEnabled.mockReturnValue(false);
    mockedUseIsFeatureFlagEnabled.mockReturnValue(false);
    mockedUseIsFeatureFlagEnabledLazy.mockReturnValue((flag) =>
      mockedUseIsFeatureFlagEnabled(flag)
    );
    mockedUseIsModuleEnabledLazy.mockReturnValue((key) =>
      mockedUseIsModuleEnabled(key)
    );
    mockedUseModules.mockReturnValue({
      isModuleEnabled,
      toggle: vi.fn().mockResolvedValue(undefined),
      modules: {},
      commit: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(undefined),
      loading: false,
      setConfig: vi.fn().mockResolvedValue(undefined),
      isDirty: false,
    });

    when(mockedUseIsFeatureFlagEnabled)
      .calledWith('issue-gc')
      .mockReturnValue(false);
    when(mockedUseIsFeatureFlagEnabled)
      .calledWith('issue-allica')
      .mockReturnValue(false);
    when(mockedUseIsModuleEnabled).calledWith('issue').mockReturnValue(true);
    when(mockUseHasPermission).mockReturnValue({
      hasPermission: false,
      loading: false,
    });
  });

  it.each([
    {
      text: 'Issues',
      type: 'link',
      permission: 'read:issue',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Issues',
      type: 'link',
      permission: 'read:issue',
      hasPermission: false,
      expectedResult: 'exclude',
    },
    {
      text: 'Actions',
      type: 'link',
      permission: 'read:action',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Actions',
      type: 'link',
      permission: 'read:action',
      hasPermission: false,
      expectedResult: 'exclude',
    },

    {
      text: 'Risks',
      type: 'section',
      permission: 'read:risk',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Risks',
      type: 'section',
      permission: 'read:risk',
      hasPermission: false,
      expectedResult: 'exclude',
    },
    {
      text: 'Controls',
      type: 'section',
      permission: 'read:control',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Controls',
      type: 'section',
      permission: 'read:control',
      hasPermission: false,
      expectedResult: 'exclude',
    },
    {
      text: 'Indicators',
      type: 'link',
      permission: 'read:indicator',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Indicators',
      type: 'link',
      permission: 'read:indicator',
      hasPermission: false,
      expectedResult: 'exclude',
    },
    {
      text: 'Home',
      type: 'link',
      permission: 'read:dashboard',
      hasPermission: false,
      expectedResult: 'exclude',
    },
    {
      text: 'Home',
      type: 'link',
      permission: 'read:dashboard',
      hasPermission: true,
      expectedResult: 'include',
    },
  ])(
    'should $expectedResult the $text $type when useHasPermission called with $permission and canHaveAccessAsContributor=true returns $hasPermission',
    ({ hasPermission, expectedResult, text, permission, type }) => {
      when(mockedUseIsModuleEnabled).calledWith('action').mockReturnValue(true);
      when(mockedUseIsModuleEnabled).calledWith('risk').mockReturnValue(true);
      when(mockedUseIsModuleEnabled)
        .calledWith('control')
        .mockReturnValue(true);
      when(mockedUseIsModuleEnabled)
        .calledWith('indicator')
        .mockReturnValue(true);
      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess, undefined, true)
        .mockReturnValue({ hasPermission, loading: false });
      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) => nav.type === type && 'text' in nav && nav.text === text
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      text: 'Register',
      type: 'link',
      permission: 'read:control',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Groups',
      type: 'link',
      permission: 'read:control_group',
      hasPermission: false,
      expectedResult: 'exclude',
    },
    {
      text: 'Tests',
      type: 'link',
      permission: 'read:control',
      hasPermission: true,
      expectedResult: 'include',
    },
  ])(
    'should $expectedResult the $text $type when useHasPermission called with $permission and canHaveAccessAsContributor=true returns $hasPermission (and user has read:control permission)',
    ({ hasPermission, expectedResult, text, permission, type }) => {
      when(mockUseHasPermission)
        .calledWith('read:control', undefined, true)
        .mockReturnValue({ hasPermission: true, loading: false });
      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess, undefined, true)
        .mockReturnValue({ hasPermission, loading: false });
      when(mockedUseIsModuleEnabled)
        .calledWith('control')
        .mockReturnValue(true);
      when(mockedUseIsModuleEnabled)
        .calledWith('control.subModules.control_group')
        .mockReturnValue(true);
      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      const riskItem = result.current.find(
        (nav) => nav.type === 'section' && nav.text === 'Controls'
      ) as SideNavigationProps.Section;
      expect(
        !!riskItem.items.find(
          (nav) => nav.type === type && 'text' in nav && nav.text === text
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      text: 'Report an issue',
      type: 'link',
      permission: 'read:public_issue_form',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Report an issue',
      type: 'link',
      permission: 'read:public_issue_form',
      hasPermission: false,
      expectedResult: 'exclude',
    },
  ])(
    'should $expectedResult the $text $type when useHasPermission called with $permission returns $hasPermission',
    ({ hasPermission, expectedResult, text, permission, type }) => {
      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess)
        .mockReturnValue({ hasPermission, loading: false });
      when(mockedUseIsModuleEnabled)
        .calledWith('notification')
        .mockReturnValue(true);
      when(mockedUseIsModuleEnabled)
        .calledWith('incident_reporting')
        .mockReturnValue(true);

      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) => nav.type === type && 'text' in nav && nav.text === text
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      flagEnabled: 'enabled',
      expectedResult: 'include',
      permission: 'update:impact',
      hasPermission: true,
    },
    {
      flagEnabled: 'disabled',
      expectedResult: 'exclude',
      permission: 'update:impact',
      hasPermission: true,
    },
    {
      flagEnabled: 'enabled',
      expectedResult: 'exclude',
      permission: 'update:impact',
      hasPermission: false,
    },
    {
      flagEnabled: 'disabled',
      expectedResult: 'exclude',
      permission: 'update:impact',
      hasPermission: false,
    },
  ])(
    'should $expectedResult the impacts section when the impacts feature flag is $flagEnabled and when useHasPermission called with $permission returns $hasPermission',
    ({ flagEnabled, expectedResult, permission, hasPermission }) => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(flagEnabled === 'enabled');

      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess)
        .mockReturnValue({ hasPermission, loading: false });

      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) => nav.type === 'section' && nav.text === 'Impacts'
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      flagEnabled: 'enabled',
      expectedResult: 'include',
      permission: 'read:custom_datasource',
      hasPermission: true,
    },
    {
      flagEnabled: 'disabled',
      expectedResult: 'exclude',
      permission: 'read:custom_datasource',
      hasPermission: true,
    },
    {
      flagEnabled: 'enabled',
      expectedResult: 'exclude',
      permission: 'read:custom_datasource',
      hasPermission: false,
    },
    {
      flagEnabled: 'disabled',
      expectedResult: 'exclude',
      permission: 'read:custom_datasource',
      hasPermission: false,
    },
  ])(
    'should $expectedResult the custom datasources page when the custom_datasource feature flag is $flagEnabled and when useHasPermission called with $permission returns $hasPermission',
    ({ flagEnabled, expectedResult, permission, hasPermission }) => {
      when(mockedUseIsModuleEnabled)
        .calledWith('custom_datasource')
        .mockReturnValue(flagEnabled === 'enabled');

      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess)
        .mockReturnValue({ hasPermission, loading: false });

      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) =>
            nav.type === 'link' &&
            'text' in nav &&
            nav.text === 'Custom Datasources'
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      flagEnabled: 'enabled',
      expectedResult: 'include',
      permission: 'read:public_policies',
      hasPermission: true,
    },
    {
      flagEnabled: 'disabled',
      expectedResult: 'exclude',
      permission: 'read:public_policies',
      hasPermission: true,
    },
    {
      flagEnabled: 'enabled',
      expectedResult: 'exclude',
      permission: 'read:public_policies',
      hasPermission: false,
    },
    {
      flagEnabled: 'disabled',
      expectedResult: 'exclude',
      permission: 'read:public_policies',
      hasPermission: false,
    },
  ])(
    'should $expectedResult the documents section when the policies feature flag is $flagEnabled and when useHasPermission called with $permission returns $hasPermission',
    ({ flagEnabled, expectedResult, permission, hasPermission }) => {
      const isEnabled = flagEnabled === 'enabled';
      when(mockedUseIsModuleEnabled)
        .calledWith('document')
        .mockReturnValue(isEnabled);
      when(mockedUseIsModuleEnabled)
        .calledWith('document.subModules.public_document')
        .mockReturnValue(isEnabled);

      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess)
        .mockReturnValue({ hasPermission, loading: false });

      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) =>
            nav.type === 'link' && 'text' in nav && nav.text === 'Documents'
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      flagEnabled: 'enabled',
      expectedResult: 'exclude',
    },
    {
      flagEnabled: 'disabled',
      expectedResult: 'include',
    },
  ])(
    'should $expectedResult the appetites register when the impacts feature flag is $flagEnabled and the user has the read:appetite and read:risk permissions',
    ({ flagEnabled, expectedResult }) => {
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(flagEnabled === 'enabled');
      when(mockedUseIsModuleEnabled).calledWith('risk').mockReturnValue(true);
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.appetite')
        .mockReturnValue(true);
      when(mockUseHasPermission)
        .calledWith('read:appetite', undefined, true)
        .mockReturnValue({ hasPermission: true, loading: false });
      when(mockUseHasPermission)
        .calledWith('read:risk', undefined, true)
        .mockReturnValue({ hasPermission: true, loading: false });

      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      const riskItem = result.current.find(
        (nav) => nav.type === 'section' && nav.text === 'Risks'
      ) as SideNavigationProps.Section;
      expect(
        !!riskItem.items.find(
          (nav) => nav.type === 'link' && nav.text === 'Appetites'
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      section: 'Compliance',
      permission: 'read:obligation',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      section: 'Compliance',
      permission: 'read:obligation',
      hasPermission: false,
      expectedResult: 'exclude',
    },
  ])(
    'should $expectedResult the compliance section when useHasPermission called with $permission and canHaveAccessAsContributor=true returns $hasPermission (and compliance feature is on)',
    ({ hasPermission, expectedResult, section, permission }) => {
      when(mockedUseIsModuleEnabled)
        .calledWith('obligation')
        .mockReturnValue(true);

      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess, undefined, true)
        .mockReturnValue({ hasPermission, loading: false });
      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) => nav.type === 'section' && nav.text === section
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      section: 'Policy',
      permission: 'read:document',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      section: 'Policy',
      permission: 'read:document',
      hasPermission: false,
      expectedResult: 'exclude',
    },
  ])(
    'should $expectedResult the policy section when useHasPermission called with $permission and canHaveAccessAsContributor=true returns $hasPermission (and policy feature is on)',
    ({ hasPermission, expectedResult, section, permission }) => {
      when(mockedUseIsModuleEnabled)
        .calledWith('document')
        .mockReturnValue(true);

      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess, undefined, true)
        .mockReturnValue({ hasPermission, loading: false });
      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) => nav.type === 'link' && nav.text === section
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      section: 'Assessments',
      permission: 'read:assessment',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      section: 'Assessments',
      permission: 'read:assessment',
      hasPermission: false,
      expectedResult: 'exclude',
    },
  ])(
    'should $expectedResult the assessments section when useHasPermission called with $permission and canHaveAccessAsContributor=true returns $hasPermission',
    ({ hasPermission, expectedResult, section, permission }) => {
      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess, undefined, true)
        .mockReturnValue({ hasPermission, loading: false });
      when(mockedUseIsModuleEnabled)
        .calledWith('assessment')
        .mockReturnValue(true);
      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      expect(
        !!result.current.find(
          (nav) => nav.type === 'section' && nav.text === section
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it.each([
    {
      text: 'Acceptances',
      type: 'link',
      permission: 'read:acceptance',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Acceptances',
      type: 'link',
      permission: 'read:acceptance',
      hasPermission: false,
      expectedResult: 'exclude',
    },

    {
      text: 'Appetites',
      type: 'link',
      permission: 'read:appetite',
      hasPermission: true,
      expectedResult: 'include',
    },
    {
      text: 'Appetites',
      type: 'link',
      permission: 'read:appetite',
      hasPermission: false,
      expectedResult: 'exclude',
    },
  ])(
    'should $expectedResult the $text $type when useHasPermission called with $permission and canHaveAccessAsContributor=true returns $hasPermission (and user has read:risk permission)',
    ({ hasPermission, expectedResult, text, permission, type }) => {
      when(mockUseHasPermission)
        .calledWith('read:risk', undefined, true)
        .mockReturnValue({ hasPermission: true, loading: false });
      when(mockUseHasPermission)
        .calledWith(permission as ObjectAccess, undefined, true)
        .mockReturnValue({ hasPermission, loading: false });
      when(mockedUseIsModuleEnabled).calledWith('risk').mockReturnValue(true);
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.appetite')
        .mockReturnValue(true);
      when(mockedUseIsModuleEnabled)
        .calledWith('risk.subModules.acceptance')
        .mockReturnValue(true);
      const { result } = renderHook(() => useNavItems(), {
        wrapper: getWrapper([], 'i18n', 'trpc'),
      });
      const riskItem = result.current.find(
        (nav) => nav.type === 'section' && nav.text === 'Risks'
      ) as SideNavigationProps.Section;
      expect(
        !!riskItem.items.find(
          (nav) => nav.type === type && 'text' in nav && nav.text === text
        )
      ).toEqual(expectedResult === 'include');
    }
  );

  it('should show Issues as a link when causes and consequences are both disabled', () => {
    mockUseHasPermission.mockReturnValue({
      hasPermission: true,
      loading: false,
    });
    when(mockedUseIsModuleEnabled)
      .calledWith('issue.subModules.cause')
      .mockReturnValue(false);
    when(mockedUseIsModuleEnabled)
      .calledWith('issue.subModules.consequence')
      .mockReturnValue(false);
    const { result } = renderHook(() => useNavItems(), {
      wrapper: getWrapper([], 'i18n', 'trpc'),
    });

    expect(
      !!result.current.find(
        (nav) => nav.type === 'link' && 'text' in nav && nav.text === 'Issues'
      )
    ).toEqual(true);
  });

  it('should show Issues as a section when causes is enabled', () => {
    mockUseHasPermission.mockReturnValue({
      hasPermission: true,
      loading: false,
    });
    when(mockedUseIsModuleEnabled)
      .calledWith('issue.subModules.cause')
      .mockReturnValue(true);
    const { result } = renderHook(() => useNavItems(), {
      wrapper: getWrapper([], 'i18n', 'trpc'),
    });

    expect(
      !!result.current.find(
        (nav) =>
          nav.type === 'section' && 'text' in nav && nav.text === 'Issues'
      )
    ).toEqual(true);
  });

  it('should show Issues as a section when consequences is enabled', () => {
    mockUseHasPermission.mockReturnValue({
      hasPermission: true,
      loading: false,
    });
    when(mockedUseIsModuleEnabled)
      .calledWith('issue.subModules.consequence')
      .mockReturnValue(true);
    const { result } = renderHook(() => useNavItems(), {
      wrapper: getWrapper([], 'i18n', 'trpc'),
    });

    expect(
      !!result.current.find(
        (nav) =>
          nav.type === 'section' && 'text' in nav && nav.text === 'Issues'
      )
    ).toEqual(true);
  });
});
