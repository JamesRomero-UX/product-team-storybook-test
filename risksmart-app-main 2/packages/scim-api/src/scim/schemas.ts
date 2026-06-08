import { z } from 'zod';

const ScimMeta = z.object({
  resourceType: z.string(),
  created: z.string().optional(),
  lastModified: z.string().optional(),
  version: z.string().optional(),
  location: z.string().optional(),
});

const ScimResource = z.object({
  schemas: z.array(z.string()),
  id: z.string(),
  externalId: z.string().optional(),
  meta: ScimMeta.optional(),
});

const Email = z.object({
  value: z.string(),
  type: z.string().optional(),
  primary: z.boolean().optional(),
});

const PhoneNumber = z.object({
  value: z.string(),
  type: z.string().optional(),
  primary: z.boolean().optional(),
});

const IM = z.object({
  value: z.string(),
  type: z.string().optional(),
});

const Photo = z.object({
  value: z.string(),
  type: z.string().optional(),
});

const Address = z.object({
  formatted: z.string().optional(),
  streetAddress: z.string().nullable().optional(),
  locality: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  type: z.string().optional(),
  primary: z.boolean().optional(),
});

const Group = z.object({
  value: z.string(),
  $ref: z.string().optional(),
  display: z.string().optional(),
});

const Entitlement = z.object({
  value: z.string(),
  type: z.string().optional(),
});

const Role = z.object({
  value: z.string(),
  type: z.string().optional(),
});

const X509Certificate = z.object({
  value: z.string(),
  type: z.string().optional(),
});

export const ScimUser = ScimResource.extend({
  userName: z.string().optional(),
  name: z
    .object({
      formatted: z.string().optional(),
      familyName: z.string().optional(),
      givenName: z.string().optional(),
      middleName: z.string().optional(),
      honorificPrefix: z.string().optional(),
      honorificSuffix: z.string().optional(),
    })
    .optional(),
  displayName: z.string().optional(),
  nickName: z.string().optional(),
  profileUrl: z.string().optional(),
  title: z.string().optional(),
  userType: z.string().optional(),
  preferredLanguage: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  active: z.boolean().optional(),
  emails: z.array(Email).optional(),
  phoneNumbers: z.array(PhoneNumber).optional(),
  ims: z.array(IM).optional(),
  photos: z.array(Photo).optional(),
  addresses: z.array(Address).optional(),
  groups: z.array(Group).optional(),
  entitlements: z.array(Entitlement).optional(),
  roles: z.array(Role).optional(),
  x509Certificates: z.array(X509Certificate).optional(),
});

const ManagerAssistant = z.object({
  value: z.string(),
  $ref: z.string().optional(),
  displayName: z.string().optional(),
});

export const scimEnterpriseUserSchema = ScimUser.extend({
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': z
    .object({
      employeeNumber: z.string().optional(),
      costCenter: z.string().optional(),
      organization: z.string().optional(),
      division: z.string().optional(),
      department: z.string().optional(),
      manager: ManagerAssistant.optional(),
      assistant: ManagerAssistant.optional(),
      billingInformation: z.string().optional(),
    })
    .optional(),
});

export type ScimEnterpriseUserSchema = z.infer<typeof scimEnterpriseUserSchema>;
