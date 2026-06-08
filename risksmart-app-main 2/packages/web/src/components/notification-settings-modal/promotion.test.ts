import type { PreferencesSet } from '@risksmart-app/shared/knock/schemas';
import { describe, expect, it } from 'vitest';

import { applyChildPromotions } from './promotion';

const ENABLED_CHANNELS: Array<'in_app_feed' | 'email' | 'chat'> = [
  'in_app_feed',
  'email',
  'chat',
];

describe('applyChildPromotions', () => {
  it('promotes top-level channel when any workflow enables it (no categories)', () => {
    const input: PreferencesSet = {
      id: 'org_X',
      channel_types: {
        chat: false,
        email: false,
        in_app_feed: false,
        push: false,
        sms: false,
      },
      categories: null as unknown as PreferencesSet['categories'],
      workflows: {
        'action-delete': {
          channel_types: {
            chat: false,
            email: false,
            in_app_feed: true,
          },
        },
      },
    };

    const result = applyChildPromotions(input, ENABLED_CHANNELS);

    // Should NOT mutate original
    expect(input.channel_types.in_app_feed).toBe(false);

    // Result should have promoted in_app_feed
    expect(result.channel_types.in_app_feed).toBe(true);

    // Other channels unchanged
    expect(result.channel_types.email).toBe(false);
    expect(result.channel_types.chat).toBe(false);
  });

  it('returns original object reference when no promotions occur', () => {
    const input: PreferencesSet = {
      id: 'org_X',
      channel_types: {
        chat: false,
        email: false,
        in_app_feed: false,
        push: false,
        sms: false,
      },
      categories: {},
      workflows: {},
    };

    const result = applyChildPromotions(input, ENABLED_CHANNELS);
    expect(result).toBe(input); // no changes
  });

  it('is idempotent: running twice does not further change object', () => {
    const input: PreferencesSet = {
      id: 'org_X',
      channel_types: {
        chat: false,
        email: false,
        in_app_feed: false,
        push: false,
        sms: false,
      },
      categories: {
        actions: {
          channel_types: {
            in_app_feed: true,
          },
        },
      },
      workflows: {},
    };

    const once = applyChildPromotions(input, ENABLED_CHANNELS);
    const twice = applyChildPromotions(once, ENABLED_CHANNELS);

    expect(once.channel_types.in_app_feed).toBe(true);
    expect(twice.channel_types.in_app_feed).toBe(true);
    // Second call should return the same reference (already promoted)
    expect(twice).toBe(once);
  });

  it('promotes multiple channels independently (workflow + category)', () => {
    const input: PreferencesSet = {
      id: 'org_X',
      channel_types: {
        chat: false,
        email: false,
        in_app_feed: false,
        push: false,
        sms: false,
      },
      categories: {
        actions: {
          channel_types: { email: true },
        },
      },
      workflows: {
        'action-delete': {
          channel_types: { in_app_feed: true },
        },
      },
    };

    const result = applyChildPromotions(input, ENABLED_CHANNELS);
    expect(result.channel_types.email).toBe(true);
    expect(result.channel_types.in_app_feed).toBe(true);
    expect(result.channel_types.chat).toBe(false);
  });

  it('promotes channels from strategy replace workflows but marks them readonly', () => {
    const input: PreferencesSet = {
      id: 'org_X',
      channel_types: {
        chat: false,
        email: false,
        in_app_feed: false, // Top-level disabled
        push: false,
        sms: false,
      },
      categories: {},
      workflows: {
        'action-due': {
          __strategy__: 'replace', // Organization-controlled workflow
          channel_types: {
            in_app_feed: true, // Enabled in read-only workflow
            email: false,
          },
        } as { __strategy__: string; channel_types: Record<string, boolean> },
        'normal-workflow': {
          channel_types: {
            email: true, // Should promote email
          },
        },
      },
    };

    const result = applyChildPromotions(input, ENABLED_CHANNELS);

    // Strategy replace workflow now promotes in_app_feed (visible true) but should be readonly metadata
    expect(result.channel_types.in_app_feed).toBe(true);
    // Normal workflow promotes email
    expect(result.channel_types.email).toBe(true);
    // Chat remains unchanged
    expect(result.channel_types.chat).toBe(false);
    // Readonly metadata present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (result as any).__readonly_channel_types;
    expect(meta.in_app_feed).toBe(true);
  });
});
