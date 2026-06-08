import {
  CustomAttributeDataSchema,
  InheritedContributorSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

const BaseInternalAuditSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string().nullish(),
    BusinessArea: z.string().min(1, { message: 'Required' }),
    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
    ancestorContributors: InheritedContributorSchema,
  })
  .and(CustomAttributeDataSchema);

export const InternalAuditFormSchema = BaseInternalAuditSchema.and(
  TagsAndDepartmentsSchema
);

export type InternalAuditFormDataFields = z.infer<
  typeof InternalAuditFormSchema
>;

export const defaultValues: InternalAuditFormDataFields = {
  Title: '',
  Description: '',
  BusinessArea: '',
  tags: [],
  departments: [],
  CustomAttributeData: null,
  Contributors: [],
  Owners: [],
  ancestorContributors: [],
};
