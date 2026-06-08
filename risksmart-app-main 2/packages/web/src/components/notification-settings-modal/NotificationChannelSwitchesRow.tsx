import type { PreferencesChannel } from '@risksmart-app/shared/knock/schemas';
import { type ReactNode, useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Switch } from 'src/components/form/controlled-switch/ControlledSwitch';

import style from './style.module.scss';

type Props = {
  name: string;
  label: string;
  variant?: 'header' | 'normal';
  channelTypes: readonly PreferencesChannel[];
  disabledChannels: readonly PreferencesChannel[];
  /** Force all switches in this row to be read only (e.g. parent category has __strategy__ = 'replace') */
  forceReadOnly?: boolean;
  /** Optional custom label node (e.g. collapse toggle) */
  labelNode?: ReactNode;
  /** Computed states that override default behavior (for category switches based on workflow states) */
  computedStates?: Record<string, { checked: boolean; disabled: boolean }>;
};

const NotificationChannelSwitchesRow = ({
  name,
  label,
  variant = 'normal',
  channelTypes,
  disabledChannels,
  forceReadOnly = false,
  labelNode,
  computedStates,
}: Props) => {
  const { control, watch, setValue } = useFormContext();
  const {
    field: { value },
  } = useController({ name, control });
  // Determine if the immediate parent object (which may contain __strategy__) is set to replace
  // name examples:
  //  - channel_types (top level) -> no parent, ignore
  //  - categories.actions.channel_types -> parent: categories.actions
  //  - workflows.action-delete.channel_types -> parent: workflows.action-delete
  const parentPath = name.split('.').slice(0, -1).join('.');
  // We don't have a strongly typed path utility here; treat as unknown then narrow.
  const parentObj = (parentPath ? watch(parentPath as string) : undefined) as
    | { __strategy__?: string }
    | undefined;
  const strategyReplace = parentObj?.__strategy__ === 'replace';
  // Determine if this is the top-level row
  const isTopLevel = name === 'channel_types';
  // Dynamically derive top-level readonly channels: any strategy replace category or workflow
  // that has the channel set to true forces the top-level channel to be readonly & true.
  // We can't rely on metadata added during promotion because schema parsing may strip unknown keys.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootValues = watch() as any;
  const topLevelStrategyReadonly: Record<string, boolean> = {};
  if (isTopLevel) {
    const categories = rootValues?.categories || {};
    Object.values(categories).forEach((cat: unknown) => {
      if (
        cat &&
        typeof cat === 'object' &&
        (cat as { __strategy__?: string }).__strategy__ === 'replace' &&
        (cat as { channel_types?: Record<string, boolean> }).channel_types
      ) {
        Object.entries(
          (cat as { channel_types: Record<string, boolean> }).channel_types
        ).forEach(([ch, val]) => {
          if (val) {
            topLevelStrategyReadonly[ch] = true;
          }
        });
      }
    });
    const workflows = rootValues?.workflows || {};
    Object.values(workflows).forEach((wf: unknown) => {
      if (
        wf &&
        typeof wf === 'object' &&
        (wf as { __strategy__?: string }).__strategy__ === 'replace' &&
        (wf as { channel_types?: Record<string, boolean> }).channel_types
      ) {
        Object.entries(
          (wf as { channel_types: Record<string, boolean> }).channel_types
        ).forEach(([ch, val]) => {
          if (val) {
            topLevelStrategyReadonly[ch] = true;
          }
        });
      }
    });
  }
  const isRowReadOnly = forceReadOnly || strategyReplace;

  const handleChangeChannel = (
    channel: PreferencesChannel,
    checked: boolean
  ) => {
    if (isRowReadOnly || (computedStates && channel in computedStates)) {
      return; // Guard against unintended changes and computed state overrides
    }
    // Check if this is a top-level toggle (name === 'channel_types')
    // vs category/workflow toggle (name like 'categories.actions.channel_types')
    const isTopLevel = name === 'channel_types';

    let newValue;
    if (isTopLevel) {
      // For top-level: the form structure is flat { in_app_feed: true, email: false, ... }
      newValue = {
        ...value,
        [channel]: checked,
      };
    } else {
      // For categories/workflows: the form structure should be flat { in_app_feed: true, email: false, ... }
      // According to the schema: categories.actions.channel_types = { in_app_feed: true }
      // NOT categories.actions.channel_types = { channel_types: { in_app_feed: true } }
      newValue = {
        ...value,
        [channel]: checked,
      };
    }
    setValue(name, newValue);
  };

  const currentChannelState = (channel: string) => {
    // If computed states are provided, use them (for category switches)
    if (computedStates && channel in computedStates) {
      return computedStates[channel].checked;
    }
    // For strategy replace (read-only), always show the actual form value regardless of hierarchy
    if (strategyReplace) {
      const defaultState = Object.hasOwn(value ?? {}, channel)
        ? value[channel]
        : true;

      return defaultState;
    }
    // If channel is disabled by hierarchy, it should be unchecked
    if (disabledChannels.includes(channel as PreferencesChannel)) {
      return false;
    }
    // Otherwise use the default behavior
    const defaultState = Object.hasOwn(value ?? {}, channel)
      ? value[channel]
      : true;

    return defaultState;
  };

  const isChannelDisabled = (channel: PreferencesChannel) => {
    // If computed states are provided, use them (for category switches)
    if (computedStates && channel in computedStates) {
      return computedStates[channel].disabled;
    }
    // For strategy replace workflows, don't disable - they show their original value
    if (strategyReplace) {
      return false;
    }
    // For workflow rows, channels should be editable (disabled: false)
    // even when constrained by hierarchy - the readonly property handles constraints

    return isRowReadOnly;
  };

  const isChannelReadOnly = (channel: PreferencesChannel) => {
    // Computed states can override readonly behavior
    if (computedStates && channel in computedStates) {
      return false; // Categories are editable
    }
    // Channels are read-only when constrained by hierarchy or strategy
    if (isTopLevel && topLevelStrategyReadonly[channel]) {
      return true;
    }

    return isRowReadOnly || disabledChannels.includes(channel);
  };

  useEffect(() => {
    if (value == null) {
      setValue(
        name,
        channelTypes.reduce(
          (acc, channel) => {
            // If computed states are provided, use the computed checked value
            // Otherwise default to true
            if (computedStates && channel in computedStates) {
              acc[channel] = computedStates[channel].checked;
            } else {
              acc[channel] = true;
            }

            return acc;
          },
          {} as Record<PreferencesChannel, boolean>
        )
      );
    }
  }, [value, setValue, name, channelTypes, computedStates]);

  const className =
    variant === 'header'
      ? `${style.notificationTableRow} ${style.headerRow}`
      : `${style.notificationTableRow}`;

  return (
    <div className={className}>
      <div>{labelNode ?? label}</div>
      {channelTypes.map((channel) => (
        <div key={channel} className={'grid place-items-center'}>
          <Switch
            data-testid={`${name}.${channel}`}
            checked={currentChannelState(channel)}
            onChange={() => {
              // Allow category-level toggles to be interactive even with computed states
              // Only block workflow-level computed states (top-level computedStates)
              const isCategoryLevel = name.startsWith('categories.');
              const shouldAllowChange =
                !computedStates ||
                !(channel in computedStates) ||
                isCategoryLevel;

              if (shouldAllowChange) {
                handleChangeChannel(channel, !currentChannelState(channel));
              }
            }}
            disabled={isChannelDisabled(channel)}
            readOnly={isChannelReadOnly(channel)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationChannelSwitchesRow;
