import { TRPCError } from '@trpc/server';

import type { KnockConfig } from './knock-client';
import { fetchWithRetry } from './knock-client';
import type {
  TenantPreferenceSetInput,
  TenantPreferenceSetOutput,
} from './types/preferences';
import { tenantPreferenceSetOutputSchema } from './types/preferences';

interface KnockPreferenceEntry {
  __strategy__?: string;
  channel_types: Record<string, boolean>;
}

interface KnockTenantResponse {
  settings?: {
    preference_set?: {
      id?: string;
      channel_types?: Record<string, boolean>;
      categories?: Record<string, KnockPreferenceEntry>;
      workflows?: Record<string, KnockPreferenceEntry>;
    };
  };
}

/**
 * Fetch tenant notification preferences from the Knock API.
 *
 * Calls `GET /v1/tenants/{tenant}` and extracts the `settings.preference_set`
 * from the response. Each workflow and category entry is enriched with an
 * `enforced` flag derived from the presence of `__strategy__: 'replace'`.
 */
export const getTenantPreferences = async (
  config: KnockConfig,
  tenant: string
): Promise<TenantPreferenceSetOutput> => {
  const url = `${config.apiBase}/v1/tenants/${encodeURIComponent(tenant)}`;

  const data = await fetchWithRetry<KnockTenantResponse>(url, config);

  const prefSet = data.settings?.preference_set;

  const categories: TenantPreferenceSetOutput['categories'] = {};
  if (prefSet?.categories) {
    for (const [key, entry] of Object.entries(prefSet.categories)) {
      categories[key] = {
        channel_types: entry.channel_types,
        enforced: entry.__strategy__ === 'replace',
      };
    }
  }

  const workflows: TenantPreferenceSetOutput['workflows'] = {};
  if (prefSet?.workflows) {
    for (const [key, entry] of Object.entries(prefSet.workflows)) {
      workflows[key] = {
        channel_types: entry.channel_types,
        enforced: entry.__strategy__ === 'replace',
      };
    }
  }

  const result = {
    id: prefSet?.id ?? 'default',
    channel_types: prefSet?.channel_types ?? {},
    categories,
    workflows,
  };

  const parsed = tenantPreferenceSetOutputSchema.safeParse(result);
  if (!parsed.success) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected response from notification service',
    });
  }

  return parsed.data;
};

/**
 * Update tenant notification preferences via the Knock API.
 *
 * Calls `PUT /v1/tenants/{tenant}` with a payload that includes
 * `__persistence_strategy__: 'replace'` at the preference set level.
 * For each workflow or category where `enforced` is true, the entry
 * includes `__strategy__: 'replace'` to prevent user overrides.
 *
 * If top-level `channel_types` is not explicitly provided, it is computed
 * as the union (OR) of all workflow channel_types.
 */
export const setTenantPreferences = async (
  config: KnockConfig,
  tenant: string,
  input: TenantPreferenceSetInput
): Promise<void> => {
  const url = `${config.apiBase}/v1/tenants/${encodeURIComponent(tenant)}`;

  const { preferences } = input;

  const knockWorkflows: Record<string, Record<string, unknown>> = {};
  if (preferences.workflows) {
    for (const [key, entry] of Object.entries(preferences.workflows)) {
      const workflowEntry: Record<string, unknown> = {
        channel_types: entry.channel_types,
      };
      if (entry.enforced) {
        workflowEntry.__strategy__ = 'replace';
      }
      knockWorkflows[key] = workflowEntry;
    }
  }

  const knockCategories: Record<string, Record<string, unknown>> = {};
  if (preferences.categories) {
    for (const [key, entry] of Object.entries(preferences.categories)) {
      const categoryEntry: Record<string, unknown> = {
        channel_types: entry.channel_types,
      };
      if (entry.enforced) {
        categoryEntry.__strategy__ = 'replace';
      }
      knockCategories[key] = categoryEntry;
    }
  }

  // Compute top-level channel_types: use explicit value if provided, otherwise
  // aggregate from workflows AND categories (OR of all channel values per
  // channel type).
  let channelTypes: Record<string, boolean> = {};
  if (preferences.channel_types) {
    channelTypes = preferences.channel_types;
  } else {
    const sources = [
      ...(preferences.workflows ? Object.values(preferences.workflows) : []),
      ...(preferences.categories ? Object.values(preferences.categories) : []),
    ];
    for (const entry of sources) {
      for (const [channel, enabled] of Object.entries(entry.channel_types)) {
        if (enabled) {
          channelTypes[channel] = true;
        } else if (channelTypes[channel] === undefined) {
          channelTypes[channel] = false;
        }
      }
    }
  }

  const payload = {
    settings: {
      preference_set: {
        __persistence_strategy__: 'replace',
        channel_types: channelTypes,
        ...(preferences.categories ? { categories: knockCategories } : {}),
        ...(preferences.workflows ? { workflows: knockWorkflows } : {}),
      },
    },
  };

  await fetchWithRetry(url, config, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};
