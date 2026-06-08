import z from 'zod';

export const ENABLED_CHANNELS = ['in_app_feed', 'email', 'chat'] as const;
export type EnabledChannel = (typeof ENABLED_CHANNELS)[number];

export const channelType = z.enum([
  'chat',
  'email',
  'in_app_feed',
  'sms',
  'push',
  'http',
]);

export const category = z.enum([
  'actions',
  'controls',
  'issues',
  'policy',
  'risks',
  'requests',
  'attestations',
  'indicators',
  'third-party',
]);

export const channelTypesSchema = z.object({
  channel_types: z.record(channelType, z.boolean()).default(
    ENABLED_CHANNELS.reduce(
      (acc, channel) => {
        acc[channel] = true;

        return acc;
      },
      // Standard reduce seed pattern — TypeScript cannot infer the accumulator type from {}, so the assertion is required.
      {} as Record<PreferencesChannel, boolean>
    )
  ),
});

export const preferencesSetSchema = channelTypesSchema.extend({
  id: z.string().default('default'),
  workflows: z.record(z.string(), channelTypesSchema),
  categories: z.record(z.string(), channelTypesSchema),
});

export type PreferencesSet = z.infer<typeof preferencesSetSchema>;
export type PreferencesChannel = z.infer<typeof channelType>;
export type PreferenceCategory = z.infer<typeof category>;
export type ChannelTypes = z.infer<typeof channelTypesSchema>['channel_types'];

export const EMPTY_PREFERENCES_SET: PreferencesSet = {
  id: 'default',
  channel_types: {
    chat: false,
    email: false,
    in_app_feed: false,
  },
  workflows: {},
  categories: {},
};

export const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: 'Europe/London',
  weekday: undefined,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const DATE_TIME_FORMAT_WITH_TIME: Intl.DateTimeFormatOptions = {
  ...DATE_TIME_FORMAT,
  hour: 'numeric',
  minute: 'numeric',
};
