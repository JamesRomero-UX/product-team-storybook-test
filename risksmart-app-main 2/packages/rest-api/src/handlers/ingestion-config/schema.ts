import { z } from 'zod';

export const PostSchema = z.object({
  object: z.object({
    IngestionConfig: z.record(z.unknown()).nullish(),
    ApiKey: z.string().nullish(),
  }),
});

export const PutSchema = z.object({
  object: z.object({
    Id: z.string().uuid(),
    IngestionConfig: z.record(z.unknown()).nullish(),
    OriginalTimestamp: z.string(),
    ApiKey: z.string().nullish(),
  }),
});

export const DeleteSchema = z.object({
  object: z.object({
    Id: z.string().uuid(),
  }),
});
