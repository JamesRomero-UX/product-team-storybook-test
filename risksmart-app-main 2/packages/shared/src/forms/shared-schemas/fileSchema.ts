import { z } from 'zod';

export const FileSchema = z.object({
  ContentType: z.string(),
  FileName: z.string(),
  FileSize: z.number(),
  Id: z.string(),
  CreatedAtTimestamp: z.string(),
});

export type RelationFile = z.infer<typeof FileSchema>;
