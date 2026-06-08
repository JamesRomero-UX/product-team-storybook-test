import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  InheritedContributorSchema,
  StringDateSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from '../../../../schemas/global';

export const IssueFormSchema = z
  .object({
    Id: z.string().optional(),
    Title: z.string().min(1, { message: 'Required' }),
    Details: z.string().nullish(),
    ImpactsCustomer: z.boolean().nullish(),
    IsExternalIssue: z.boolean().nullish(),
    DateOccurred: StringDateSchema,
    DateIdentified: StringDateSchema,
    Type: z.nativeEnum(Parent_Type_Enum),
    Contributors: UserOrGroupsSchema.nullable(),
    Owners: UserOrGroupsSchema.nullable(),
    ancestorContributors: InheritedContributorSchema,
    files: z.array(FileOrRelationSchema),
  })
  .and(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export type IssueFormDataFields = z.infer<typeof IssueFormSchema>;

export const defaultValues: IssueFormDataFields = {
  DateIdentified: '',
  DateOccurred: '',
  ImpactsCustomer: null,
  IsExternalIssue: null,
  Title: '',
  Details: '',
  Type: Parent_Type_Enum.Issue,
  tags: [],
  departments: [],
  files: [],
  CustomAttributeData: null,
  Contributors: [],
  Owners: [],
  ancestorContributors: [],
};
