import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const ThirdPartyResponseSchema = baseEntitySchema;

export const ThirdPartyListResponseSchema = ThirdPartyResponseSchema.extend({
  links: listLinksSchema,
}).strict();

export const ThirdPartyItemResponseSchema = ThirdPartyResponseSchema.extend({
  companyName: z
    .string()
    .openapi({ example: 'Acme Vendor Ltd', description: 'Legal company name' }),
  companyRegistration: z.string().nullable().openapi({
    example: '12345678',
    description: 'Company registration number',
  }),
  address: z
    .object({
      addressLine1: z
        .string()
        .nullable()
        .openapi({ example: '123 Main St', description: 'Street address' }),
      cityTown: z
        .string()
        .nullable()
        .openapi({ example: 'London', description: 'City or town' }),
      postcode: z
        .string()
        .nullable()
        .openapi({ example: 'EC1A 1BB', description: 'Postal code' }),
      country: z
        .string()
        .nullable()
        .openapi({ example: 'GB', description: 'ISO country code' }),
    })
    .nullable(),
  primaryContactName: z
    .string()
    .nullable()
    .openapi({ example: 'Jane Smith', description: 'Primary contact name' }),
  contactName: z
    .string()
    .nullable()
    .openapi({ example: 'John Doe', description: 'General contact name' }),
  contactEmail: z.string().nullable().openapi({
    example: 'contact@acme.com',
    description: 'Contact email address',
  }),
  companyDomain: z
    .string()
    .nullable()
    .openapi({ example: 'acme.com', description: 'Company web domain' }),
  type: z.string().openapi({
    example: 'Supplier',
    description: 'Third-party relationship type',
  }),
  status: z
    .string()
    .openapi({ example: 'Active', description: 'Current engagement status' }),
  criticality: z.number().openapi({
    example: 2,
    description: 'Criticality rating of the relationship',
  }),
  links: baseLinksSchema,
}).strict();

export type ThirdPartyItemResponse = z.infer<
  typeof ThirdPartyItemResponseSchema
>;
export type ThirdPartyListResponse = z.infer<
  typeof ThirdPartyListResponseSchema
>;
