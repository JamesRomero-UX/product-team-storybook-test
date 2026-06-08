import type { EnabledChannel } from '@risksmart-app/shared/knock/schemas';
import { ENABLED_CHANNELS } from '@risksmart-app/shared/knock/schemas';
import { groupBy } from 'lodash';

import type { WorkflowTemplate } from '@/components/notification-settings-modal/util';

import type { CategorySummaryRow, WorkflowPreferenceRow } from './types';

/**
 * Shape returned by the tRPC `get` endpoint for each workflow/category entry.
 * The tRPC service already translates Knock's `__strategy__: 'replace'` into
 * an `enforced` boolean, so the frontend consumes `enforced` directly.
 */
type TRPCPreferenceEntry = {
  channel_types: Partial<Record<string, boolean>>;
  enforced: boolean;
};

type TRPCPreferencePayload = {
  channel_types?: Partial<Record<string, boolean>>;
  workflows?: Record<string, TRPCPreferenceEntry>;
  categories?: Record<string, TRPCPreferenceEntry>;
};

const defaultChannels = (): Record<EnabledChannel, boolean> => {
  const channels = {} as Record<EnabledChannel, boolean>;
  for (const ch of ENABLED_CHANNELS) {
    channels[ch] = false;
  }

  return channels;
};

export const knockPayloadToGridState = (
  preferenceSet: TRPCPreferencePayload | undefined | null,
  workflows: WorkflowTemplate[]
): WorkflowPreferenceRow[] => {
  return workflows
    .filter(
      (
        w
      ): w is WorkflowTemplate & {
        category: NonNullable<WorkflowTemplate['category']>;
      } => !!w.category
    )
    .map((workflow) => {
      const channels = defaultChannels();
      const workflowData = preferenceSet?.workflows?.[workflow.key];
      const enforced = workflowData?.enforced ?? false;

      for (const ch of ENABLED_CHANNELS) {
        channels[ch] = workflowData?.channel_types?.[ch] ?? false;
      }

      return {
        workflowKey: workflow.key,
        label: workflow.label,
        category: workflow.category,
        enforced,
        channels,
      };
    });
};

type PreferenceEntry = {
  channel_types: Record<string, boolean>;
  enforced: boolean;
};

export const gridStateToKnockPayload = (
  rows: WorkflowPreferenceRow[]
): {
  workflows: Record<string, PreferenceEntry>;
  categories: Record<string, PreferenceEntry>;
} => {
  const workflows: Record<string, PreferenceEntry> = {};

  for (const row of rows) {
    const channelTypes: Record<string, boolean> = {};

    for (const ch of ENABLED_CHANNELS) {
      channelTypes[ch] = row.channels[ch];
    }

    workflows[row.workflowKey] = {
      channel_types: channelTypes,
      enforced: row.enforced,
    };
  }

  // Compute category aggregates
  const grouped = groupBy(rows, 'category');
  const categories: Record<string, PreferenceEntry> = {};

  for (const [category, categoryRows] of Object.entries(grouped)) {
    const channelTypes: Record<string, boolean> = {};

    for (const ch of ENABLED_CHANNELS) {
      const anyEnabled = categoryRows.some((r) => r.channels[ch]);
      channelTypes[ch] = anyEnabled;
    }

    // Category is enforced when ANY child workflow is enforced, so the
    // end-user preferences UI blocks the category when at least one
    // workflow default has been locked by the admin.
    const anyChildEnforced = categoryRows.some((r) => r.enforced);

    categories[category] = {
      channel_types: channelTypes,
      enforced: anyChildEnforced,
    };
  }

  return { workflows, categories };
};

export const deriveCategorySummaries = (
  rows: WorkflowPreferenceRow[]
): CategorySummaryRow[] => {
  const grouped = groupBy(rows, 'category');

  return Object.entries(grouped).map(([category, categoryRows]) => {
    const channels = {} as Record<EnabledChannel, boolean>;

    for (const ch of ENABLED_CHANNELS) {
      channels[ch] = categoryRows.some((r) => r.channels[ch]);
    }

    // Category is enforced when ANY child workflow is enforced
    const enforced = categoryRows.some((r) => r.enforced);

    return {
      category: category as WorkflowPreferenceRow['category'],
      label: category,
      enforced,
      channels,
      isExpanded: false,
    };
  });
};
