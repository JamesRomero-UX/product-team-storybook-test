import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import type { ZodError, ZodObject, ZodRawShape } from 'zod';

import { z } from '../schemas/openapi.zod';

export const idParamSchema = z.object({ id: z.string().uuid() });

export const urlFormatString = z.string().url().openapi({
  example: 'https://example.com',
  description: 'Valid URL format',
});

export const treatmentType = z.nativeEnum(RiskTreatmentType).nullish().openapi({
  example: RiskTreatmentType.Terminate,
  description: 'Treatment types for resources, for example: tolerate a Risk',
});

export const testFrequency = z.nativeEnum(TestFrequency).nullish().openapi({
  example: TestFrequency.Daily,
  description: 'Test execution frequency daily, weekly',
});

export const unitOfTime = z.nativeEnum(UnitOfTime).nullish().openapi({
  example: UnitOfTime.Day,
  description: 'Set unit of time: day, week, etc',
});

export function extendSchema<B extends ZodRawShape, E extends ZodRawShape>(
  base: ZodObject<B>,
  extra: E
) {
  return base.extend(extra);
}

const matchNoPadBase64 = /^[A-Za-z0-9_-]+$/;

/**
 * Base64url string (RFC 7515/7517) — no padding "=" and only [A–Z a–z 0–9 _ -]
 * Also guard against impossible length (mod 4 must not be 1)
 */
export const base64urlNoPad = z
  .string()
  .min(1, 'Must be a non-empty base64url string')
  .regex(matchNoPadBase64, "Must be base64url (no '=')")
  .refine((s) => s.length % 4 !== 1, {
    message: 'Invalid base64/base64url length (length % 4 must be 0, 2, or 3)',
  });

/**
 * Returns readable zod field errors
 */
export const serializeZodError = (err: ZodError) =>
  err.issues.map((i) => ({
    field: i.path.join('.'),
    message: i.message,
  }));

export const entityIdValue = z
  .string()
  .uuid()
  .openapi({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' });

export const isoDateTimeValue = z.string().datetime({ offset: true }).openapi({
  example: '2024-01-15T10:00:00Z',
  description: 'ISO 8601 datetime with timezone offset',
});

export const providerIdOrUuid = z
  .string()
  .min(1, { message: 'id must be defined' })
  .openapi({
    example: 'b3fc2c963f66afa6',
    description: 'provider or user id value',
  });

export const providerIdOrUuidList = z.array(providerIdOrUuid);

export const tagSchema = z.object({
  name: z.string().openapi({ example: 'compliance' }),
  description: z.string().openapi({ example: 'Compliance related item' }),
});

export const createResourceHref = (example?: string) =>
  z.object({
    href: z.string().openapi({ example, description: 'Href to this resource' }),
  });

export const referencedResourceSchema = z.object({
  type: z
    .string()
    .openapi({ example: 'resource_type', description: 'Resource type' }),
  id: providerIdOrUuid,
  href: z.string().openapi({
    example: '/api/v1/resource/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'URL to the linked resource',
  }),
});

export const scheduleAndStateSchema = {
  schedule: z.object({
    frequency: z.string().nullable(),
    manualDueDate: isoDateTimeValue.nullable(),
    startDate: isoDateTimeValue.nullable(),
    timeToCompleteValue: z.number().nullable(),
    timeToCompleteUnit: z.string().nullable(),
  }),
  scheduleState: z.object({
    latestDate: isoDateTimeValue.nullable(),
    dueDate: isoDateTimeValue.nullable(),
    overdueDate: isoDateTimeValue.nullable(),
  }),
};

export const ancestorContributorSchema = z.object({
  id: entityIdValue.nullable(),
  objectType: z
    .string()
    .nullable()
    .openapi({ example: 'risk', description: 'Type of ancestor object' }),
  contributorType: z.string().nullable().openapi({
    example: 'Owner',
    description: 'How this ancestor contributes',
  }),
  ancestorId: entityIdValue.nullable(),
  userGroupId: z.string().nullable().openapi({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'ID of the user group contributor',
  }),
  user: referencedResourceSchema
    .nullable()
    .openapi({ description: 'Reference to the contributing user' }),
});

export const ownersList = z
  .array(
    providerIdOrUuid.openapi({
      description: 'User ID owners of the Resource',
      example: 'abc|1234abc567def',
    })
  )
  .min(1, 'At least one owner is required')
  .max(99, 'Max 99 owners can be added');

export const buildKindSchema = (
  kind: string,
  schemaProp: { enum?: string[] }
): z.ZodTypeAny | null => {
  const enumValues = schemaProp.enum as [string, ...string[]] | undefined;
  switch (kind) {
    case 'text':
      return z.string();
    case 'select':
      return enumValues?.length ? z.enum(enumValues) : z.string();
    case 'boolean':
      return z.boolean();
    case 'number':
      return z.number();
    case 'integer':
      return z.number().int();
    case 'date':
      return isoDateTimeValue;
    case 'link':
      return urlFormatString;
    case 'multiselect':
      return enumValues?.length
        ? z.array(z.enum(enumValues))
        : z.array(z.string());
    default:
      // no validation schema
      return null;
  }
};
