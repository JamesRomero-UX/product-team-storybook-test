import z from 'zod';

/**
 * Channel types supported by Knock. Matches the enum from
 * `@risksmart-app/shared/knock/schemas` without introducing a cross-package
 * dependency.
 */
const channelType = z.enum([
  'chat',
  'email',
  'in_app_feed',
  'sms',
  'push',
  'http',
]);

const channelTypesRecord = z.record(channelType, z.boolean());

/**
 * Per-workflow or per-category preference entry for tenant set mutation.
 *
 * The `enforced` boolean controls whether the preference is locked for
 * individual users. When `enforced` is true the Knock API payload includes
 * `__strategy__: 'replace'`, which prevents users from overriding the
 * tenant-level setting.
 */
const preferenceEntryInputSchema = z.object({
  channel_types: channelTypesRecord,
  enforced: z.boolean(),
});

const MAX_RECORD_ENTRIES = 200;

export const tenantPreferenceSetInputSchema = z.object({
  preferences: z.object({
    channel_types: channelTypesRecord.optional(),
    categories: z
      .record(z.string().min(1).max(256), preferenceEntryInputSchema)
      .refine(
        (obj) => Object.keys(obj).length <= MAX_RECORD_ENTRIES,
        'Too many entries'
      )
      .optional(),
    workflows: z
      .record(z.string().min(1).max(256), preferenceEntryInputSchema)
      .refine(
        (obj) => Object.keys(obj).length <= MAX_RECORD_ENTRIES,
        'Too many entries'
      )
      .optional(),
  }),
});

export type TenantPreferenceSetInput = z.infer<
  typeof tenantPreferenceSetInputSchema
>;

/**
 * Output schema for `get` query.
 *
 * Extends the shared PreferencesSet shape with per-entry `enforced` flags
 * derived from the presence of `__strategy__: 'replace'` in the Knock
 * API response.
 */
const preferenceEntryOutputSchema = z.object({
  channel_types: channelTypesRecord,
  enforced: z.boolean(),
});

export const tenantPreferenceSetOutputSchema = z.object({
  id: z.string(),
  channel_types: z.record(z.string(), z.boolean()),
  categories: z.record(z.string(), preferenceEntryOutputSchema),
  workflows: z.record(z.string(), preferenceEntryOutputSchema),
});

export type TenantPreferenceSetOutput = z.infer<
  typeof tenantPreferenceSetOutputSchema
>;
