import { TestFrequencyEnum, UnitOfTimeEnum } from 'generated/graphql';
import { z } from 'zod';

export const ContributorsSchema = {
  ContributorUserIds: z.array(z.string()),
  ContributorGroupIds: z.array(z.string().uuid()),
};

export const OwnersSchema = {
  OwnerGroupIds: z.array(z.string().uuid()),
  OwnerUserIds: z.array(z.string()),
};

export const TagsAndDepartmentsSchema = {
  TagTypeIds: z.array(z.string().uuid()),
  DepartmentTypeIds: z.array(z.string().uuid()),
};
export const CustomAttributeDataFieldSchema = z.any().nullable();

export const CustomAttributeDataSchema = z.object({
  CustomAttributeData: CustomAttributeDataFieldSchema,
});

export const UserOrGroupSchema = z.object({
  type: z.enum(['user', 'userGroup']),
  value: z.string(),
});

const regexDate = /\d{4}-\d{2}-\d{2}/;

export const StringDateSchema = z
  .string({ invalid_type_error: 'Required' })
  .regex(regexDate, 'Required')
  .refine((date) => new Date(date) > new Date('1900-01-01'), 'Invalid date');

export const NullableStringDateSchema = StringDateSchema.or(z.string().max(0))
  .transform((value) => (value === '' ? null : value))
  .nullable();

export const ScheduleSchema = z.object({
  schedule: z.object({
    StartDate: NullableStringDateSchema.nullish(),
    ManualDueDate: NullableStringDateSchema.nullish(),
    Frequency: z.nativeEnum(TestFrequencyEnum).nullish(),
    TimeToCompleteValue: z.number().int().min(1).nullish(),
    TimeToCompleteUnit: z.nativeEnum(UnitOfTimeEnum).nullish(),
  }),
});
