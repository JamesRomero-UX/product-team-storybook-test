import { useMutation, useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  defaultModules,
  isModuleEnabled as resolveModule,
  mergeModulesWithDefaults,
  type Module,
  type ModuleConfig,
  moduleConfigSchema,
  type ModuleKey,
} from '@risksmart-app/modules/src/index';
import type {
  Appetite_Model_Enum,
  Risk_Scoring_Model_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetModulesDocument,
  Parent_Type_Enum,
  ResetTabPreferencesDocument,
  UpdateAggregationSettingsForOrgDocument,
  UpdateModulesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useEffect } from 'react';
import { create } from 'zustand';

import { evictField } from '@/utils/graphqlUtils';

export type BasicModule = Module;

const parseModuleSettings = (raw: unknown): ModuleConfig => {
  const result = moduleConfigSchema.safeParse(raw);

  return result.success ? result.data : {};
};

export type Modules = {
  toggle: (id: string) => void;
  /**
   * **Internal only** — reads the raw zustand module store without legacy
   * feature flag backwards compatibility. For checking if a module is
   * enabled in components, use `useIsModuleEnabled` or
   * `useIsModuleEnabledLazy` from `src/hooks/useIsModuleEnabled` instead.
   * Those hooks call `resolveModuleEnabled` which correctly handles orgs
   * that haven't migrated to the modules system yet.
   */
  isModuleEnabled: (id: ModuleKey) => boolean;
  setConfig: (id: string, config: Record<string, unknown>) => void;
  modules: Record<string, BasicModule>;
  hydrated: boolean;
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
  dirtyModules?: string[];
};

// Default modules are now defined in @risksmart-app/modules.
// See packages/modules/src/defaults.ts for the authoritative source.

/**
 * Set of module IDs that correspond to valid Parent_Type_Enum values.
 * Only these modules can have their tab preferences reset.
 */
const PARENT_TYPE_MODULES = new Set<Parent_Type_Enum>(
  Object.values(Parent_Type_Enum)
);

const isParentTypeEnum = (value: string): value is Parent_Type_Enum => {
  return PARENT_TYPE_MODULES.has(value as Parent_Type_Enum);
};

export const useModulesStore = create<Modules>((set, get) => {
  return {
    toggle: (id: string) => {
      set((state) => {
        const updatedModules = _.cloneDeep(state.modules);

        if (_.has(updatedModules, id)) {
          const currentEnabled = _.get(updatedModules, `${id}.enabled`, false);
          const newEnabled = !currentEnabled;

          _.set(updatedModules, `${id}.enabled`, newEnabled);

          // If disabling a module, also disable all its submodules
          if (!newEnabled) {
            const module = _.get(updatedModules, id) as BasicModule | undefined;
            if (module?.subModules) {
              Object.keys(module.subModules).forEach((subModuleKey) => {
                _.set(
                  updatedModules,
                  `${id}.subModules.${subModuleKey}.enabled`,
                  false
                );
              });
            }
          }
        } else {
          console.warn(`Module with id "${id}" does not exist.`);
        }

        const mainModuleId = id.split('.')[0];

        return {
          modules: updatedModules,
          isDirty: true,
          dirtyModules: _.uniq(
            _.concat(state.dirtyModules ?? [], mainModuleId)
          ),
        };
      });
    },
    setConfig: (id: string, config: Record<string, unknown>) => {
      set((state) => {
        const updatedModules = { ...state.modules };
        if (_.has(updatedModules, id)) {
          _.set(updatedModules, `${id}.config`, config);
        } else {
          console.warn(`Module with id "${id}" does not exist.`);
        }

        return { modules: updatedModules, isDirty: true };
      });
    },
    isModuleEnabled: (id: ModuleKey): boolean => {
      return resolveModule(get().modules, id);
    },
    modules: defaultModules,
    hydrated: false,
    dirtyModules: [],
    // @TODO: Obsolete, can be inferred from dirtyModules
    isDirty: false,
    setIsDirty: (isDirty: boolean) => {
      set({ isDirty, dirtyModules: isDirty ? get().dirtyModules : [] });
    },
  };
});

export const useModules = () => {
  const {
    toggle,
    isModuleEnabled,
    modules,
    setConfig,
    isDirty,
    setIsDirty,
    dirtyModules,
  } = useModulesStore();
  const { addNotification } = useNotifications();
  const [updateAggregationSettings] = useMutation(
    UpdateAggregationSettingsForOrgDocument
  );
  const [updateModules, { loading: updateLoading }] = useMutation(
    UpdateModulesDocument,
    {
      onCompleted: () => {
        addNotification({
          type: 'success',
          content: 'Modules updated successfully.',
        });
      },
      update: (cache) => {
        evictField(cache, 'organisation_module');
      },
    }
  );
  const { data, loading } = useQuery(GetModulesDocument);
  const [resetTabs] = useMutation(ResetTabPreferencesDocument, {
    update: (cache) => {
      evictField(cache, 'organisation_tab_preference');
      evictField(cache, 'user_tab_preference');
    },
  });

  const commit = async (config: {
    RiskScoringModel: Risk_Scoring_Model_Enum;
    RiskScoringModelConfig: string;
    AppetiteCascadingModel: Appetite_Model_Enum;
    AppetiteCascadingModelConfig: string;
  }) => {
    await updateModules({
      variables: { ModuleSettings: modules },
    });

    if (dirtyModules?.length) {
      await Promise.all(
        dirtyModules
          .filter((c) => isParentTypeEnum(c))
          .map(async (moduleId: Parent_Type_Enum) => {
            return await resetTabs({
              variables: {
                ObjectType: moduleId,
              },
            });
          })
      );
    }

    const riskScoringEnabled = isModuleEnabled('risk.subModules.risk_scoring');
    const appetiteCascadingEnabled = isModuleEnabled(
      'risk.subModules.appetite_cascading'
    );

    if (riskScoringEnabled || appetiteCascadingEnabled) {
      await updateAggregationSettings({
        variables: {
          RiskScoringModel:
            riskScoringEnabled && config.RiskScoringModel
              ? config.RiskScoringModel
              : null,
          AppetiteCascadingModel:
            appetiteCascadingEnabled && config.AppetiteCascadingModel
              ? config.AppetiteCascadingModel
              : null,
          Config: {
            ...JSON.parse(
              riskScoringEnabled ? config.RiskScoringModelConfig : '{}'
            ),
            ...JSON.parse(
              appetiteCascadingEnabled
                ? config.AppetiteCascadingModelConfig
                : '{}'
            ),
          },
        },
      });
    } else {
      await updateAggregationSettings({
        variables: {
          RiskScoringModel: null,
          AppetiteCascadingModel: null,
          Config: {},
        },
      });
    }

    setIsDirty(false);
  };

  const reset = () => {
    if (data?.organisation_module?.[0]?.ModuleSettings && !loading) {
      useModulesStore.setState({
        modules: mergeModulesWithDefaults(
          parseModuleSettings(data.organisation_module[0].ModuleSettings)
        ),
        isDirty: false,
      });
      addNotification({
        type: 'success',
        content: 'Changes reverted.',
      });
    }
  };

  useEffect(() => {
    if (!loading && !isDirty) {
      const raw = data?.organisation_module?.[0]?.ModuleSettings;
      useModulesStore.setState({
        modules: mergeModulesWithDefaults(raw ? parseModuleSettings(raw) : {}),
        hydrated: true,
      });
    }
  }, [loading, data, isDirty]);

  return {
    toggle,
    isModuleEnabled,
    modules,
    commit,
    reset,
    loading: updateLoading || loading,
    setConfig,
    isDirty,
  };
};

/**
 * Lightweight hook that hydrates the module store from the server.
 * Call this early in the component tree (e.g. ProtectedLayout) so
 * that ModuleGatedRoute has org-specific module state before it
 * decides whether to render or throw.
 *
 * Apollo caches the GetModulesDocument query, so calling useModules()
 * later (e.g. in the Settings page) reuses the cached result.
 */
export const useModulesHydration = () => {
  const { hydrated, isDirty } = useModulesStore();
  const { data, loading } = useQuery(GetModulesDocument);

  useEffect(() => {
    if (!loading && !isDirty) {
      const savedModuleSettingData =
        data?.organisation_module?.[0]?.ModuleSettings;
      useModulesStore.setState({
        modules: mergeModulesWithDefaults(
          savedModuleSettingData
            ? parseModuleSettings(savedModuleSettingData)
            : {}
        ),
        hydrated: true,
      });
    }
  }, [loading, data, isDirty]);

  return { hydrated: hydrated || loading === false, loading };
};
