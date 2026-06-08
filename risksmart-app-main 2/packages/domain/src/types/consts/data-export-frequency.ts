export const DataExportFrequency = {
  Daily: 'daily',
  Monthly: 'monthly',
  Weekly: 'weekly',
} as const;

export type DataExportFrequency =
  (typeof DataExportFrequency)[keyof typeof DataExportFrequency];
