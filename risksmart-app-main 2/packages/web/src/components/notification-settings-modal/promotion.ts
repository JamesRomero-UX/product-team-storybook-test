import type {
  PreferencesChannel,
  PreferencesSet,
} from '@risksmart-app/shared/knock/schemas';

/**
 * Normalizes workflow channel structures to ensure all workflows have consistent channel properties.
 *
 * Fixes issue where some workflows were missing certain channel properties (e.g. 'chat' property),
 * causing React Hook Form to behave inconsistently between first and subsequent loads.
 * Ensures all workflows have the same channel structure with default values for missing channels.
 */
function normalizeWorkflowChannels(
  prefs: PreferencesSet,
  enabledChannels: readonly PreferencesChannel[]
): PreferencesSet {
  if (!prefs?.workflows) {
    return prefs;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedWorkflows: Record<string, any> = {};
  let hasChanges = false;

  Object.entries(prefs.workflows).forEach(([workflowKey, workflow]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wfAny = workflow as any;
    const currentChannels = wfAny?.channel_types || {};

    // Create normalized channel structure with all enabled channels
    const normalizedChannels: Partial<Record<PreferencesChannel, boolean>> = {};
    enabledChannels.forEach((channel) => {
      // Use existing value if present, otherwise default to false
      normalizedChannels[channel] = currentChannels[channel] ?? false;
    });

    // Check if we need to update this workflow
    const needsUpdate = enabledChannels.some(
      (channel) => !(channel in currentChannels)
    );

    if (needsUpdate) {
      hasChanges = true;
      normalizedWorkflows[workflowKey] = {
        ...workflow,
        channel_types: normalizedChannels,
      };
    } else {
      normalizedWorkflows[workflowKey] = workflow;
    }
  });

  if (!hasChanges) {
    return prefs;
  }

  return {
    ...prefs,
    workflows: normalizedWorkflows,
  };
}

/**
 * Computes child-to-parent promotions: if any category/workflow enables a channel, promote top-level channel to true.
 * Does not mutate the input; returns a shallow-cloned PreferencesSet with promoted channel_types.
 *
 * Additional rule (first-pass no-race requirement):
 *  - If any category OR workflow with __strategy__ = 'replace' has a channel set to true, we
 *    immediately surface the top-level channel as true and treat it as effectively read-only
 *    (cannot be toggled off by the user) to avoid a timing window where hierarchy propagation
 *    logic could briefly disable underlying read-only children.
 *  - We intentionally do NOT rely on React side-effects for this initial promotion to eliminate
 *    race conditions; instead we compute it synchronously here so the first render reflects
 *    final enforced state.
 *  - Read-only signalling for the UI is done dynamically in NotificationChannelSwitchesRow by
 *    scanning strategy replace children; we still attach a lightweight __readonly_channel_types
 *    object for potential future optimisations (ignored by schema validation when saving).
 */
export function applyChildPromotions(
  prefs: PreferencesSet,
  enabledChannels: readonly PreferencesChannel[]
): PreferencesSet {
  if (!prefs) {
    return prefs;
  }

  // First normalize workflow channel structures to prevent React Hook Form inconsistencies
  const normalizedPrefs = normalizeWorkflowChannels(prefs, enabledChannels);

  const promoted: Record<PreferencesChannel, boolean> = {
    ...(normalizedPrefs.channel_types as Record<PreferencesChannel, boolean>),
  };
  // Track channels that should be rendered readonly at the top-level due to organisation strategy replace children.
  // We attach metadata __readonly_channel_types (not persisted back to backend) for UI rendering only.
  const existingReadonly = (
    normalizedPrefs as unknown as {
      __readonly_channel_types?: Record<string, boolean>;
    }
  ).__readonly_channel_types;
  const readonlyTopLevel: Partial<Record<PreferencesChannel, boolean>> =
    existingReadonly ? { ...existingReadonly } : {};

  enabledChannels.forEach((channel) => {
    let alreadyTrue = !!promoted[channel];

    let shouldPromote = false;
    let forceReadonly = false; // becomes true if any strategy replace child has channel true

    // Check categories (strategy replace categories should force both promote + readonly)
    Object.values(normalizedPrefs.categories || {}).forEach((cat) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catAny = cat as any;
      const catChannels = catAny?.channel_types as
        | Record<PreferencesChannel, boolean>
        | undefined;
      const isStrategyReplace = catAny?.__strategy__ === 'replace';
      if (catChannels?.[channel]) {
        if (!alreadyTrue) {
          shouldPromote = true; // normal promotion if not already true
        }
        if (isStrategyReplace) {
          forceReadonly = true; // mark top-level readonly for this channel
        }
      }
    });

    // Check workflows (strategy replace workflows should force readonly & set true WITHOUT triggering other propagation logic)
    Object.values(normalizedPrefs.workflows || {}).forEach((wf) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wfAny = wf as any;
      const wfChannels = wfAny?.channel_types as
        | Record<PreferencesChannel, boolean>
        | undefined;
      const isStrategyReplace = wfAny?.__strategy__ === 'replace';

      if (wfChannels?.[channel]) {
        if (isStrategyReplace) {
          // Force top-level visible as true & readonly even if previously false
          shouldPromote = true;
          forceReadonly = true;
        } else if (!alreadyTrue) {
          // Non strategy replace workflow only promotes (old behavior)
          shouldPromote = true;
        }
      }
    });

    if (shouldPromote) {
      promoted[channel] = true;
      alreadyTrue = true;
    }
    if (forceReadonly) {
      readonlyTopLevel[channel] = true;
    }
  });

  // If no promotions happened, avoid object churn
  const changed = enabledChannels.some((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return promoted[c] !== (normalizedPrefs.channel_types as any)[c];
  });
  const readonlyChanged = Object.keys(readonlyTopLevel).some((c) => {
    const existing = (
      normalizedPrefs as unknown as {
        __readonly_channel_types?: Record<string, boolean>;
      }
    ).__readonly_channel_types;

    return !(existing || {})[c];
  });

  if (!changed && !readonlyChanged) {
    return normalizedPrefs;
  }

  return {
    ...normalizedPrefs,
    channel_types: promoted,
    ...(Object.keys(readonlyTopLevel).length
      ? { __readonly_channel_types: readonlyTopLevel }
      : {}),
  } as PreferencesSet & { __readonly_channel_types?: Record<string, boolean> };
}
