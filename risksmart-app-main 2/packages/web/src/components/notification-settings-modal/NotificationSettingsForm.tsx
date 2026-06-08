import Alert from '@risk-smart/themed-cloudscape-components/alert';
import type {
  PreferenceCategory,
  PreferencesChannel,
  PreferencesSet,
} from '@risksmart-app/shared/knock/schemas';
import { groupBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CategorySwitchesSection } from '@/components/notification-settings-modal/CategorySwitchesSection';
import NotificationChannelSwitchesRow from '@/components/notification-settings-modal/NotificationChannelSwitchesRow';
import type { WorkflowTemplate } from '@/components/notification-settings-modal/util';
import { useIsModuleEnabledLazy } from '@/hooks/useIsModuleEnabled';

import style from './style.module.scss';

type Props = {
  enabledChannels: readonly PreferencesChannel[];
  defaultDisabledChannels: readonly PreferencesChannel[];
  workflows: WorkflowTemplate[];
  /** If true categories start collapsed (default true). Tests can override */
  startCollapsed?: boolean;
};

const NotificationSettingsForm = (props: Props) => {
  const { watch } = useFormContext<PreferencesSet>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'notification_settings',
  });
  const checkFeatureFlag = useIsModuleEnabledLazy();

  const channelTypeMap = t('channel_types', { returnObjects: true }) as Record<
    PreferencesChannel,
    string
  >;
  const categories = groupBy(
    props.workflows.filter(
      (w) => !w.moduleKey || checkFeatureFlag(w.moduleKey)
    ),
    'category'
  );
  const allChannelTypes = watch('channel_types');
  const watchedCategories = watch('categories');
  const watchedWorkflows = watch('workflows');

  // Force re-computation by watching a counter that increments on changes

  type StrategyHolder = { __strategy__?: string } | undefined;
  const hasOrganisationLocked = useMemo(() => {
    const catLocked = Object.values(watchedCategories ?? {}).some(
      (c) => (c as StrategyHolder)?.__strategy__ === 'replace'
    );
    const wfLocked = Object.values(watchedWorkflows ?? {}).some(
      (w) => (w as StrategyHolder)?.__strategy__ === 'replace'
    );

    return catLocked || wfLocked;
  }, [watchedCategories, watchedWorkflows]);

  // Hierarchical enforcement: if top-level channel is OFF, disable it everywhere
  const disabledChannels = [
    ...props.enabledChannels.filter((channel) => !allChannelTypes[channel]),
    ...props.defaultDisabledChannels,
    // Add channels that are disabled by top-level OFF setting
    ...props.enabledChannels.filter(
      (channel) => allChannelTypes?.[channel] === false
    ),
  ];

  // Collapsed state for categories
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // Initialise or add new categories as collapsed
  useEffect(() => {
    setCollapsed((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(categories).forEach((c) => {
        if (!(c in next)) {
          next[c] = props.startCollapsed !== false; // default collapsed unless overridden
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [categories, props.startCollapsed]);
  const toggleCategory = useCallback((c: string) => {
    setCollapsed((prev) => ({ ...prev, [c]: !prev[c] }));
  }, []);

  const { setValue } = useFormContext<PreferencesSet>();

  // Track previous values to enable one-time propagation only when values actually change
  const previousChannelTypesRef = useRef<
    Record<PreferencesChannel, boolean> | undefined
  >(undefined);
  const previousCategoryValuesRef = useRef<
    Record<string, Record<PreferencesChannel, boolean>> | undefined
  >(undefined);

  // Child-to-parent promotion now occurs during initial value preparation (outside this component)

  // Hierarchical enforcement: when top-level channel changes, propagate to all workflows/categories
  useEffect(() => {
    if (!allChannelTypes || !watchedWorkflows) {
      return;
    }

    // One-time propagation: only propagate when top-level values actually change
    const previousChannelTypes = previousChannelTypesRef.current;
    const hasChanged =
      !previousChannelTypes ||
      props.enabledChannels.some(
        (channel) => previousChannelTypes[channel] !== allChannelTypes[channel]
      );

    if (!hasChanged) {
      return;
    }

    // Store the previous values before updating the ref (needed for change detection in propagation)
    const previousChannelTypesForComparison = previousChannelTypes;

    // Update the ref for next comparison
    previousChannelTypesRef.current = {
      chat: allChannelTypes.chat ?? false,
      email: allChannelTypes.email ?? false,
      in_app_feed: allChannelTypes.in_app_feed ?? false,
      sms: allChannelTypes.sms ?? false,
      push: allChannelTypes.push ?? false,
      http: allChannelTypes.http ?? false,
    };

    // Synchronous propagation (removed setTimeout). Guard to only write when necessary.
    props.enabledChannels.forEach((channel) => {
      if (allChannelTypes[channel] === false) {
        // Force all workflows to OFF for this channel
        props.workflows.forEach((workflow) => {
          // Check if the workflow is disabled/read-only due to __strategy__ = 'replace'
          const workflowRoot = watchedWorkflows[workflow.key] as
            | { __strategy__?: string }
            | undefined;
          const isWorkflowDisabled = workflowRoot?.__strategy__ === 'replace';

          // Only modify non-disabled workflows
          if (!isWorkflowDisabled) {
            const currentValue =
              watchedWorkflows[workflow.key]?.channel_types?.[channel];
            if (currentValue !== false) {
              setValue(
                `workflows.${workflow.key}.channel_types.${channel}`,
                false
              );
            }
          }
        });

        // Force all categories to OFF for this channel
        Object.keys(categories).forEach((category) => {
          const currentCategoryChannels =
            watchedCategories?.[category]?.channel_types || {};
          const currentValue = currentCategoryChannels[channel];
          if (currentValue !== false) {
            // Set the entire channel_types object to maintain consistent structure
            const updatedChannelTypes = {
              ...currentCategoryChannels,
              [channel]: false,
            };
            setValue(
              `categories.${category}.channel_types`,
              updatedChannelTypes
            );
          }
        });
      } else if (allChannelTypes[channel] === true) {
        // When top-level is turned ON, enable workflows/categories ONLY if they don't have explicit values
        props.workflows.forEach((workflow) => {
          // Check if the workflow is disabled/read-only due to __strategy__ = 'replace'
          const workflowRoot = watchedWorkflows[workflow.key] as
            | { __strategy__?: string }
            | undefined;
          const isWorkflowDisabled = workflowRoot?.__strategy__ === 'replace';

          // Only modify non-disabled workflows
          if (!isWorkflowDisabled) {
            const currentValue =
              watchedWorkflows[workflow.key]?.channel_types?.[channel];
            // Only set to true if the value is undefined/null (not explicitly set by user)
            if (currentValue === undefined || currentValue === null) {
              setValue(
                `workflows.${workflow.key}.channel_types.${channel}`,
                true
              );
            }
          }
        });

        // Enable all categories when top-level is turned ON
        Object.keys(categories).forEach((category) => {
          const categoryFormValue =
            watchedCategories?.[category]?.channel_types || {};
          const currentValue = categoryFormValue[channel];

          // Distinguish between initial load and user interaction for categories too
          const isFirstRun = !previousChannelTypesForComparison;
          const channelValueChanged =
            previousChannelTypesForComparison?.[channel] !==
            allChannelTypes[channel];

          let shouldEnable = false;

          if (isFirstRun && allChannelTypes[channel] === true) {
            // Initial form load with top-level enabled: preserve explicit user choices
            shouldEnable = currentValue === undefined || currentValue === null;
          } else if (
            !isFirstRun &&
            channelValueChanged &&
            allChannelTypes[channel] === true
          ) {
            // User interaction - top-level changed to true: enable all categories
            shouldEnable = currentValue !== true;
          }

          if (shouldEnable) {
            // Correct structure: categories.actions.channel_types is the object, not nested
            const updatedChannelTypes = {
              ...categoryFormValue,
              [channel]: true,
            };
            setValue(
              `categories.${category}.channel_types`,
              updatedChannelTypes
            );
          }
        });
      }
    });
  }, [
    allChannelTypes,
    setValue,
    props.workflows,
    props.enabledChannels,
    categories,
    watchedWorkflows,
    watchedCategories,
  ]);

  // Category-level enforcement: when category channel changes, propagate to workflows in that category
  useEffect(() => {
    if (!watchedCategories || !watchedWorkflows) {
      return;
    }

    // One-time propagation: only propagate when category values actually change
    const currentCategoryValues: Record<
      string,
      Record<PreferencesChannel, boolean>
    > = {};
    Object.keys(categories).forEach((categoryKey) => {
      const categoryChannelTypes =
        watchedCategories[categoryKey]?.channel_types || {};
      currentCategoryValues[categoryKey] = {
        chat: categoryChannelTypes.chat ?? false,
        email: categoryChannelTypes.email ?? false,
        in_app_feed: categoryChannelTypes.in_app_feed ?? false,
        sms: categoryChannelTypes.sms ?? false,
        push: categoryChannelTypes.push ?? false,
        http: categoryChannelTypes.http ?? false,
      };
    });

    const previousCategoryValues = previousCategoryValuesRef.current;
    let hasChanges = false;

    if (!previousCategoryValues) {
      hasChanges = true; // First time
    } else {
      // Check if any category values actually changed
      for (const categoryKey of Object.keys(categories)) {
        for (const channel of props.enabledChannels) {
          const prevValue = previousCategoryValues[categoryKey]?.[channel];
          const currentValue = currentCategoryValues[categoryKey]?.[channel];
          if (prevValue !== currentValue) {
            hasChanges = true;
            break;
          }
        }
        if (hasChanges) {
          break;
        }
      }
    }

    if (!hasChanges) {
      return;
    }

    // Store the previous values before updating the ref (needed for change detection in propagation)
    const previousValuesForComparison = previousCategoryValues;

    // Update the ref for next comparison
    previousCategoryValuesRef.current = currentCategoryValues;

    // Synchronous propagation (removed setTimeout). Guard to only write when necessary.
    props.enabledChannels.forEach((channel) => {
      // Only process if top-level channel is enabled (otherwise top-level rules take precedence)
      if (allChannelTypes?.[channel] !== false) {
        Object.keys(categories).forEach((categoryKey) => {
          const categoryChannelValue =
            watchedCategories[categoryKey]?.channel_types?.[channel];

          if (categoryChannelValue === false) {
            // When category channel is OFF, disable workflows in that category for this channel
            const categoryWorkflows = categories[categoryKey] || [];
            categoryWorkflows.forEach((workflow) => {
              // Check if the workflow is disabled/read-only due to __strategy__ = 'replace'
              const workflowRoot = watchedWorkflows[workflow.key] as
                | { __strategy__?: string }
                | undefined;
              const isWorkflowDisabled =
                workflowRoot?.__strategy__ === 'replace';

              // Only modify non-disabled workflows
              if (!isWorkflowDisabled) {
                const currentValue =
                  watchedWorkflows[workflow.key]?.channel_types?.[channel];
                if (currentValue !== false) {
                  setValue(
                    `workflows.${workflow.key}.channel_types.${channel}`,
                    false
                  );
                }
              }
            });
          } else if (categoryChannelValue === true) {
            // When category channel is ON, behavior differs based on context:
            // - Initial loading: preserve explicit user choices (only enable undefined/null workflows)
            // - User interaction: enable all non-readonly workflows (override false values)
            const categoryWorkflows = categories[categoryKey] || [];
            categoryWorkflows.forEach((workflow) => {
              // Check if the workflow is disabled/read-only due to __strategy__ = 'replace'
              const workflowRoot = watchedWorkflows[workflow.key] as
                | { __strategy__?: string }
                | undefined;
              const isWorkflowDisabled =
                workflowRoot?.__strategy__ === 'replace';

              // Only enable non-disabled workflows
              if (!isWorkflowDisabled) {
                const currentValue =
                  watchedWorkflows[workflow.key]?.channel_types?.[channel];

                // Check if this category value actually changed from the previous check
                const previousCategoryValue =
                  previousValuesForComparison?.[categoryKey]?.[channel];
                const categoryValueChanged =
                  previousCategoryValue !== categoryChannelValue;

                let shouldEnable = false;

                // Distinguish between initial load and user interaction
                const isFirstRun = !previousValuesForComparison;

                if (isFirstRun && categoryChannelValue === true) {
                  // Initial form load with category enabled: preserve explicit user choices
                  shouldEnable =
                    currentValue === undefined || currentValue === null;
                } else if (
                  !isFirstRun &&
                  categoryValueChanged &&
                  categoryChannelValue === true
                ) {
                  // User interaction - category changed to true: enable all workflows
                  shouldEnable = currentValue !== true;
                }

                if (shouldEnable) {
                  setValue(
                    `workflows.${workflow.key}.channel_types.${channel}`,
                    true
                  );
                }
              }
            });
          }
        });
      }
    });
  }, [
    watchedCategories,
    watchedWorkflows,
    allChannelTypes,
    setValue,
    props.enabledChannels,
    categories,
  ]);

  return (
    <div>
      {hasOrganisationLocked && (
        <div className={'mb-4'}>
          <Alert
            type={'info'}
            header={
              t('mandatory_info_header', {
                defaultValue: 'Organisation controlled preferences',
              }) as string
            }
          >
            {
              t('mandatory_info_body', {
                defaultValue:
                  'Some notification settings have been set by your organisation and are read-only.',
              }) as string
            }
          </Alert>
        </div>
      )}
      <div className={style.notificationTableRow}>
        <div></div>
        {props.enabledChannels.map((channel) => (
          <div className={'font-bold'} key={channel}>
            {channelTypeMap[channel]}
          </div>
        ))}
      </div>

      <NotificationChannelSwitchesRow
        label={'All'}
        variant={'header'}
        channelTypes={props.enabledChannels}
        name={'channel_types'}
        disabledChannels={props.defaultDisabledChannels} // Disable slack notifications for now
      />

      {Object.entries(categories).map(([category, workflows]) => (
        <CategorySwitchesSection
          key={category}
          category={category as PreferenceCategory}
          workflows={workflows}
          channels={props.enabledChannels}
          disabledChannels={disabledChannels}
          collapsed={collapsed[category] !== false}
          onToggle={(c) => toggleCategory(c)}
        />
      ))}
    </div>
  );
};

export default NotificationSettingsForm;
