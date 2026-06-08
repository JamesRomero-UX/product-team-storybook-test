import {
  ancestorContributorSchema,
  referencedResourceSchema,
} from '../../utils/schemas';
import { baseEntitySchema, listLinksSchema } from '../common/base.schema';
import { z } from '../openapi.zod';

export const ImpactListResponseSchema = baseEntitySchema.extend({
  links: listLinksSchema,
});

export const ImpactItemResponseSchema = baseEntitySchema.extend({
  likelihoodAppetite: z.number().nullable().openapi({
    example: 2,
    description: 'Maximum acceptable likelihood for this impact',
  }),
  impactAppetite: z
    .number()
    .nullable()
    .openapi({ example: 3, description: 'Maximum acceptable impact score' }),
  ratingGuidance: z.string().nullable().openapi({
    example: 'High impact affects regulatory standing',
    description: 'Guidance on rating this impact',
  }),
  ancestorContributors: z.array(ancestorContributorSchema),
  links: listLinksSchema.extend({
    appetites: z.array(referencedResourceSchema),
  }),
});

export type ImpactItemResponse = z.infer<typeof ImpactItemResponseSchema>;
export type ImpactListResponse = z.infer<typeof ImpactListResponseSchema>;
