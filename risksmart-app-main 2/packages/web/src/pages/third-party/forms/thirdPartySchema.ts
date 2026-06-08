import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  InheritedContributorSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from '../../../schemas/global';

export const thirdPartyFormSchema = z
  .object({
    title: z.string().min(1, 'Required'),
    description: z.string().nullish(),
    companyName: z.string().nullish(),
    companiesHouseNumber: z.string().nullish(),
    address: z.string().nullish(),
    cityTown: z.string().nullish(),
    postcode: z.string().nullish(),
    country: z.string().nullish(),
    primaryContactName: z.string().nullish(),
    contactName: z.string().nullish(),
    contactEmail: z.string().nullish(),
    companyDomain: z.string().nullish(),
    type: z.string().min(1, 'Required'),
    status: z.string().min(1, 'Required'),
    criticality: z
      .string()
      // Pipe used to fix coercion validation issue:
      // https://zod.dev/?id=you-can-use-pipe-to-fix-common-issues-with-zcoerce
      .pipe(z.coerce.number({ required_error: 'Required' }).min(1))
      .nullish(),
    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
    ancestorContributors: InheritedContributorSchema,
    files: z.array(FileOrRelationSchema),
  })
  .and(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export type ThirdPartyFormData = z.infer<typeof thirdPartyFormSchema>;

export const defaultValues: DefaultValues<ThirdPartyFormData> = {
  title: '',
  description: '',
  companyName: '',
  companiesHouseNumber: '',
  address: '',
  cityTown: '',
  postcode: '',
  country: '',
  primaryContactName: '',
  contactName: '',
  contactEmail: '',
  companyDomain: '',
  Owners: [],
  Contributors: [],
  ancestorContributors: [],
  tags: [],
  departments: [],
  CustomAttributeData: null,
  files: [],
};
