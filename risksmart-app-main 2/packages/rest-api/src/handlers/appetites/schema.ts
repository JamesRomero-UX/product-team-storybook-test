import { AppetiteTypeEnum } from 'generated/graphql';
import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const ImpactAppetiteSchema = z.object({
  ImpactAppetite: z.number().int(),
  ImpactId: z.string().uuid(),
  AppetiteType: z.literal(AppetiteTypeEnum.Impact),
});

const LikelihoodAppetiteSchema = z.object({
  LikelihoodAppetite: z.number().int().nullish(),
  AppetiteType: z.literal(AppetiteTypeEnum.Likelihood),
});

const RiskAppetiteSchema = z.object({
  AppetiteType: z.literal(AppetiteTypeEnum.Risk),
  LowerAppetite: z.number().int().nullish(),
  UpperAppetite: z.number().int().nullish(),
});

const AppetiteTypeUnion = z.discriminatedUnion('AppetiteType', [
  ImpactAppetiteSchema,
  LikelihoodAppetiteSchema,
  RiskAppetiteSchema,
]);

export const PostSchema = z
  .object({
    ParentIds: z.array(z.string().uuid()),
    Id: z.string().uuid().optional(),
    Statement: z.string().nullish(),
    EffectiveDate: NullableStringDateSchema,
  })
  .and(AppetiteTypeUnion)
  .and(CustomAttributeDataSchema);
