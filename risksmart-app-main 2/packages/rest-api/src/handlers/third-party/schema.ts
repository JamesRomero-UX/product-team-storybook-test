import {
  ContributorsSchema,
  CustomAttributeDataSchema,
  OwnersSchema,
  TagsAndDepartmentsSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

export const InviteSchema = z.object({
  OrgKey: z.string(),
  Tenant: z.string(),
  Inviter: z.string(),
  QuestionnaireInviteId: z.string(),
  ThirdPartyId: z.string().uuid(),
  UserEmail: z.string().email(),
  Message: z.string().optional().nullable(),
  QuestionnaireTemplateVersionId: z.string().uuid(),
});

export type InviteSchemaData = z.infer<typeof InviteSchema>;

const BaseSchema = z
  .object({
    Title: z.string().min(1, 'Required'),
    Description: z.string().nullish(),
    CompanyName: z.string().nullish(),
    CompaniesHouseNumber: z.string().nullish(),
    Address: z.string().nullish(),
    CityTown: z.string().nullish(),
    Postcode: z.string().nullish(),
    Country: z.string().nullish(),
    PrimaryContactName: z.string().nullish(),
    ContactName: z.string().nullish(),
    ContactEmail: z.string().nullish(),
    CompanyDomain: z.string().nullish(),
    Type: z.string().min(1, 'Required'),
    Status: z.string().min(1, 'Required'),
    Criticality: z.number({ required_error: 'Required' }).nullish(),
  })
  .extend(ContributorsSchema)
  .extend(OwnersSchema)
  .extend(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export const PostSchema = z.object({ object: BaseSchema });

export const PutSchema = z.object({
  object: BaseSchema.and(
    z.object({
      Id: z.string().uuid(),
    })
  ),
});
