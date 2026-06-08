import {
  ChangeRequestFileOperationEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { z } from 'zod';

const fileSchema = z.object({
  fileName: z.string(),
  fileId: z.string(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  meta: z.any().optional().nullable(),
  changeRequestFileOperation: z
    .nativeEnum(ChangeRequestFileOperationEnum)
    .nullish(),
});

export const postSchema = z.object({
  parentIds: z.array(z.string()).min(1),
  parentType: z.nativeEnum(ParentTypeEnum),
  files: z.array(fileSchema),
});

export type PostSchema = z.infer<typeof postSchema>;
