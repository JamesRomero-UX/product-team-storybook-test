import { useQuery } from '@apollo/client';
import type { IssueTaxonomyKeys } from '@risksmart-app/shared/forms/issues/types';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDefaultTabsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

export type TabId =
  | 'acceptances'
  | 'actions'
  | 'activities'
  | 'appetites'
  | 'approvals'
  | 'assessments'
  | 'attestations'
  | 'audit'
  | 'authentication'
  | 'causes'
  | 'colours'
  | 'consequences'
  | 'contacts'
  | 'controls'
  | 'customRoles'
  | 'dataExport'
  | 'dataImport'
  | 'departments'
  | 'details'
  | 'entities'
  | 'entityRisks'
  | 'externalApi'
  | 'findings'
  | 'globalApprovals'
  | 'impacts'
  | 'indicators'
  | 'internalAuditRisks'
  | 'linkedItems'
  | 'modules'
  | 'notificationHistory'
  | 'notifications'
  | 'questionnaires'
  | 'reports'
  | 'results'
  | 'sso'
  | 'tags'
  | 'taxonomy'
  | 'testResults'
  | 'updates'
  | 'userGroups'
  | 'users'
  | 'versions'
  | IssueTaxonomyKeys;

type TabPreference = {
  id: TabId;
  hidden?: boolean;
  demoted?: boolean;
  label?: string;
};

/**
 * Appends any tabs present in system defaults but missing from saved preferences.
 * This ensures newly added default tabs appear even when org/user preferences
 * were saved before the new tab existed.
 */
const appendMissingDefaults = (
  prefs: TabPreference[],
  defaults: TabPreference[]
): TabPreference[] => {
  const existingIds = new Set(prefs.map((t) => t.id));
  const missing = defaults.filter((t) => !existingIds.has(t.id));
  if (missing.length === 0) {
    return prefs;
  }

  return [...prefs, ...missing];
};

const useTabPreferences = (
  parentType?: Parent_Type_Enum,
  isOrgLevel?: boolean
): { tabs?: TabPreference[]; loading: boolean } => {
  const { data, loading } = useQuery(GetDefaultTabsDocument);

  return useMemo(() => {
    if (loading) {
      return {
        loading: true,
      };
    }

    // Example: [{"id":"details"},{"id":"controls"},{"id":"ratings"},{"id":"appetites"},{"id":"acceptances"},{"id":"actions"},{"id":"indicators"},{"id":"approvals"},{"id":"linkedItems"}]
    const d: TabPreference[] =
      data?.tab?.find((t) => t.ParentType === parentType)?.Tabs?.default || [];
    // Example: different order, some tabs hidden
    // [{"id":"details"},{"id":"controls"},{"id":"actions"},{"id":"ratings"},{"id":"appetites"},{"id":"acceptances"},{"id":"indicators","hidden":true},{"id":"approvals","hidden":true},{"id":"linkedItems","hidden":true}]
    const o: TabPreference[] = data?.organisation_tab_preference?.find(
      (t) => t.ObjectType === parentType
    )?.Preferences?.default;
    // Can't hide tabs on user level, but can move them to a dropdown at the end
    // [{"id":"controls"},{"id":"details"},{"id":"actions"},{"id":"ratings"},{"id":"appetites","demoted":true},{"id":"acceptances","demoted":true}]
    const u: TabPreference[] = data?.user_tab_preference?.find(
      (t) => t.ObjectType === parentType
    )?.Preferences;

    if (isOrgLevel) {
      if (!o) {
        return {
          loading: false,
          tabs: d.filter((tab: TabPreference) => !tab.hidden),
        };
      }

      return {
        loading: false,
        tabs: o,
      };
    }

    if (!o && !u) {
      return {
        loading: false,
        tabs: d.filter((tab: TabPreference) => !tab.hidden),
      };
    }

    if (!u) {
      return {
        loading: false,
        tabs: appendMissingDefaults(o, d).filter(
          (tab: TabPreference) => !tab.hidden
        ),
      };
    }

    return {
      loading: false,
      tabs: appendMissingDefaults(u, d),
    };
  }, [loading, data, parentType, isOrgLevel]);
};

export default useTabPreferences;
