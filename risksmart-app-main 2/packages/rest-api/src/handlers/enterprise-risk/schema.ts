import { RiskTreatmentTypeEnum } from 'generated/graphql';
import { CustomAttributeDataSchema } from 'src/sharedSchemas';
import { z } from 'zod';

const Tier1 = z.object({
  Tier: z.literal(1),
  ParentId: z.null().or(z.undefined()),
});
const Tier2 = z.object({
  Tier: z.literal(2),
  ParentId: z.string({ invalid_type_error: 'Required' }).uuid(),
});
const Tier3 = z.object({
  Tier: z.literal(3),
  ParentId: z.string({ invalid_type_error: 'Required' }).uuid(),
});

const TierSchema = z.discriminatedUnion('Tier', [Tier1, Tier2, Tier3]);

const BaseSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string(),
    Treatment: z.nativeEnum(RiskTreatmentTypeEnum).nullish(),
    Meta: z.any().nullable(),
  })
  .and(CustomAttributeDataSchema)
  .and(TierSchema);

export const PostSchema = z.object({ object: BaseSchema });
export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().uuid(),
    })
  ),
});
export const DeleteSchema = z.object({ Id: z.string().uuid() });

export const InstantiateSchema = z.object({
  object: z.object({
    EnterpriseRiskIds: z.array(z.string().uuid()).nonempty(),
    Entities: z.array(z.string().uuid()).nonempty(),
  }),
});

export const LinkSchema = z.object({
  objects: z.array(
    z.object({
      RiskId: z.string().uuid(),
      EnterpriseRiskId: z.string().nullish(),
      EntityId: z.string().uuid(),
    })
  ),
});
