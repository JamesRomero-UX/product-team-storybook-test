import { RiskStatusTypeEnum, RiskTreatmentTypeEnum } from 'generated/graphql';
import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  ScheduleSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

export const DeleteSchema = z.object({
  Id: z.string().uuid(),
});

const BaseRiskSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string().nullish(),
    Treatment: z.nativeEnum(RiskTreatmentTypeEnum).nullish(),
    Status: z.nativeEnum(RiskStatusTypeEnum).nullish(),
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema)
  .and(ScheduleSchema);

const Tier1 = z.object({
  Tier: z.literal(1),
  ParentRiskId: z.null().or(z.undefined()),
});
const Tier2 = z.object({
  Tier: z.literal(2),
  ParentRiskId: z.string({ invalid_type_error: 'Required' }).uuid(),
});
const Tier3 = z.object({
  Tier: z.literal(3),
  ParentRiskId: z.string({ invalid_type_error: 'Required' }).uuid(),
});

const TierSchema = z.discriminatedUnion('Tier', [Tier1, Tier2, Tier3]);

export const PostSchema = z.object({ object: BaseRiskSchema.and(TierSchema) });
export const PutSchema = z.object({
  object: BaseRiskSchema.and(TierSchema).and(
    z.object({
      Id: z.string().uuid(),
    })
  ),
});
