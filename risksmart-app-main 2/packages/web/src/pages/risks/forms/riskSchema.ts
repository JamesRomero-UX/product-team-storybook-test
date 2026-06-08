import {
  Risk_Status_Type_Enum,
  Risk_Treatment_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  defaultSchedule,
  ScheduleSchema,
} from 'src/pages/controls/update/forms/scheduleSchema';
import {
  CustomAttributeDataSchema,
  InheritedContributorSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

const Tier1 = z.object({
  Tier: z.literal(1),
  ParentRiskId: z.null().or(z.undefined()),
});
const Tier2 = z.object({
  Tier: z.literal(2),
  ParentRiskId: z.string({ invalid_type_error: 'Required' }).uuid(),
});
const Tier3 = z.object({
  Tier: z.literal(3),
  ParentRiskId: z.string({ invalid_type_error: 'Required' }).uuid(),
});

const TierSchema = z.discriminatedUnion('Tier', [Tier1, Tier2, Tier3]);

export const RiskFormSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string(),
    Treatment: z.nativeEnum(Risk_Treatment_Type_Enum).nullish(),
    Status: z.nativeEnum(Risk_Status_Type_Enum).nullish(),
    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
    ancestorContributors: InheritedContributorSchema,
  })
  .and(ScheduleSchema)
  .and(CustomAttributeDataSchema)
  .and(TagsAndDepartmentsSchema)
  .and(TierSchema);

export const EnterpriseRiskFormSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string(),
    Treatment: z.nativeEnum(Risk_Treatment_Type_Enum).nullish(),
  })
  .and(CustomAttributeDataSchema)
  .and(TierSchema);

export type RiskFormDataFields = Omit<
  z.infer<typeof RiskFormSchema>,
  'ParentRiskId'
> & {
  ParentRiskId: null | string | undefined;
};

export const defaultValues: RiskFormDataFields = {
  Title: '',
  Description: '',
  Tier: 1,
  Treatment: null,
  Status: null,
  ParentRiskId: null,
  tags: [],
  departments: [],
  CustomAttributeData: null,
  Contributors: [],
  Owners: [],
  ancestorContributors: [],
  schedule: defaultSchedule,
};
