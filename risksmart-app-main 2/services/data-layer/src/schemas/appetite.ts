import { AppetiteType } from '@risksmart-app/domain/src/types/consts/index';
import { z } from 'zod';

const ImpactAppetiteSchema = z.object({
  ImpactAppetite: z.number().int(),
  ImpactId: z.string().uuid(),
  AppetiteType: z.literal(AppetiteType.Impact),
});

const LikelihoodAppetiteSchema = z.object({
  LikelihoodAppetite: z.number().int().nullish(),
  AppetiteType: z.literal(AppetiteType.Likelihood),
});

const RiskAppetiteSchema = z.object({
  AppetiteType: z.literal(AppetiteType.Risk),
  LowerAppetite: z.number().int().min(1).max(5).nullish(),
  UpperAppetite: z.number().int().min(1).max(5).nullish(),
});

const AppetiteTypeUnion = z.discriminatedUnion('AppetiteType', [
  ImpactAppetiteSchema,
  LikelihoodAppetiteSchema,
  RiskAppetiteSchema,
]);

/**
 * Schema for POST /appetites
 * Validates the request body for creating a new appetite
 * Uses discriminated union on AppetiteType to enforce type-specific fields
 */
export const createAppetiteRequestSchema = z
  .object({
    ParentIds: z.array(z.string().uuid()).min(1),
    Statement: z.string().nullish(),
    EffectiveDate: z.string().nullish(),
    CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
  })
  .and(AppetiteTypeUnion);

export type CreateAppetiteRequest = z.infer<typeof createAppetiteRequestSchema>;

/**
 * Schema for PUT /appetites/{id}
 * Validates the request body for updating an existing appetite
 * AppetiteType is required (NOT NULL in DB); other fields are nullable
 */
export const updateAppetiteRequestSchema = z.object({
  AppetiteType: z.nativeEnum(AppetiteType),
  Statement: z.string().nullish(),
  EffectiveDate: z.string().nullish(),
  LowerAppetite: z.number().int().nullish(),
  UpperAppetite: z.number().int().nullish(),
  ImpactAppetite: z.number().int().nullish(),
  LikelihoodAppetite: z.number().int().nullish(),
  ImpactId: z.string().uuid().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

export type UpdateAppetiteRequest = z.infer<typeof updateAppetiteRequestSchema>;
