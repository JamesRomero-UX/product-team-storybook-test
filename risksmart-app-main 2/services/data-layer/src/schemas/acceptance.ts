import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import { z } from 'zod';

/** Schema for POST /acceptances */
export const createAcceptanceRequestSchema = z
  .object({
    ParentId: z.string().uuid('ParentId must be a valid UUID'),
    DateAcceptedFrom: z.string().min(1, 'DateAcceptedFrom is required'),
    DateAcceptedTo: z.string().min(1, 'DateAcceptedTo is required'),
    Title: z.string().min(1, 'Title is required'),
    Details: z.string().min(1, 'Details are required'),
    Status: z.nativeEnum(AcceptanceStatus),
    ApprovedByUser: z.string().nullable().optional(),
    ApprovedByUserGroup: z
      .string()
      .uuid('ApprovedByUserGroup must be a valid UUID')
      .nullable()
      .optional(),
    RequestedByUser: z.string().nullable().optional(),
    RequestedByUserGroup: z
      .string()
      .uuid('RequestedByUserGroup must be a valid UUID')
      .nullable()
      .optional(),
    CustomAttributeData: z
      .record(z.string(), z.unknown())
      .nullable()
      .optional(),
  })
  .refine((d) => d.ApprovedByUser == null || d.ApprovedByUserGroup == null, {
    message: 'ApprovedByUser and ApprovedByUserGroup are mutually exclusive',
    path: ['ApprovedByUserGroup'],
  })
  .refine((d) => d.RequestedByUser == null || d.RequestedByUserGroup == null, {
    message: 'RequestedByUser and RequestedByUserGroup are mutually exclusive',
    path: ['RequestedByUserGroup'],
  });

export type CreateAcceptanceRequest = z.infer<
  typeof createAcceptanceRequestSchema
>;

/** Schema for PUT /acceptances/{id} */
export const updateAcceptanceRequestSchema = z
  .object({
    DateAcceptedFrom: z.string().min(1, 'DateAcceptedFrom is required'),
    DateAcceptedTo: z.string().min(1, 'DateAcceptedTo is required'),
    Title: z.string(),
    Details: z.string(),
    Status: z.nativeEnum(AcceptanceStatus),
    ApprovedByUser: z.string().nullable().optional(),
    ApprovedByUserGroup: z
      .string()
      .uuid('ApprovedByUserGroup must be a valid UUID')
      .nullable()
      .optional(),
    RequestedByUser: z.string().nullable().optional(),
    RequestedByUserGroup: z
      .string()
      .uuid('RequestedByUserGroup must be a valid UUID')
      .nullable()
      .optional(),
    CustomAttributeData: z
      .record(z.string(), z.unknown())
      .nullable()
      .optional(),
  })
  .refine((d) => d.ApprovedByUser == null || d.ApprovedByUserGroup == null, {
    message: 'ApprovedByUser and ApprovedByUserGroup are mutually exclusive',
    path: ['ApprovedByUserGroup'],
  })
  .refine((d) => d.RequestedByUser == null || d.RequestedByUserGroup == null, {
    message: 'RequestedByUser and RequestedByUserGroup are mutually exclusive',
    path: ['RequestedByUserGroup'],
  });

export type UpdateAcceptanceRequest = z.infer<
  typeof updateAcceptanceRequestSchema
>;
