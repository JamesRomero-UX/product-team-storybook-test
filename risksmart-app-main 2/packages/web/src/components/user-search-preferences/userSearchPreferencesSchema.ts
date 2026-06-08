import { z } from 'zod';

export const UserSearchPreferencesSchema = z.object({
  ShowGroups: z.boolean(),
  ShowUserPlatformRole: z.boolean(),
  FilterByActivePlatformUsers: z.boolean(),
  ShowUserJobTitle: z.boolean(),
  ShowDirectoryDepartment: z.boolean(),
  ShowUserLocation: z.boolean(),
  ShowUserEmail: z.boolean(),
  ShowArchivedUsers: z.boolean(),
  ShowInheritedContributors: z.boolean(),
});

export type UserSearchPreferencesSchemaFieldData = z.infer<
  typeof UserSearchPreferencesSchema
>;

export const defaultValues: UserSearchPreferencesSchemaFieldData = {
  ShowGroups: true,
  FilterByActivePlatformUsers: false,
  ShowUserPlatformRole: true,
  ShowUserJobTitle: false,
  ShowDirectoryDepartment: false,
  ShowUserLocation: false,
  ShowUserEmail: true,
  ShowArchivedUsers: false,
  ShowInheritedContributors: false,
};
