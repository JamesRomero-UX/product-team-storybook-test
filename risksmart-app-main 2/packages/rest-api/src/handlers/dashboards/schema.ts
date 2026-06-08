import { DashboardSharingTypeEnum } from 'generated/graphql';
import { z } from 'zod';

export const PostSchema = z.object({
  Name: z.string(),
  Description: z.string().nullish(),
  Sharing: z.nativeEnum(DashboardSharingTypeEnum),
  ContributorUserIds: z.array(z.string()),
  ContributorGroupIds: z.array(z.string().uuid()),
  Content: z.any(),
});

export const PutSchema = PostSchema.extend({
  Id: z.string().uuid(),
});
