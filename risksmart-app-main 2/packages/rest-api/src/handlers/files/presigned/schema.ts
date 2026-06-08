import { ParentTypeEnum } from 'generated/graphql';
import { z } from 'zod';

export const postSchema = z.object({
  parentIds: z.array(z.string()).min(1),
  parentType: z.nativeEnum(ParentTypeEnum),
  fileNames: z.array(z.string()),
});

export type PostSchema = z.infer<typeof postSchema>;
