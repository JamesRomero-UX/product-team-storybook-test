import { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import { z } from 'zod';

import type { UserOption } from '../../../../schemas/global';
import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  StringDateSchema,
  UserOptionSchema,
} from '../../../../schemas/global';
const effectiveness = z
  .number({
    invalid_type_error: 'Required',
  })
  .min(0)
  .max(4);

export const TestResultFormSchema = z
  .object({
    Title: z.string().nullish(),
    TestType: z
      .nativeEnum(TestType, {
        required_error: 'Required',
        invalid_type_error: 'Required',
      })
      .nullish(),
    Description: z.string().nullish(),
    DesignEffectiveness: effectiveness.nullish(),
    PerformanceEffectiveness: effectiveness.nullish(),
    OverallEffectiveness: effectiveness.nullish(),
    Id: z.string().uuid().optional(),
    ParentControlIds: z
      .array(
        z.object({
          value: z
            .string({ required_error: 'Required' })
            .uuid({ message: 'Required' }),
        })
      )
      .min(1),
    Submitter: UserOptionSchema,
    TestDate: StringDateSchema,
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type TestResultFormFieldsData = z.infer<typeof TestResultFormSchema>;

export const defaultValues: TestResultFormFieldsData = {
  OverallEffectiveness: undefined as unknown as number,
  ParentControlIds: [],
  TestDate: '',
  TestType: undefined as unknown as TestType,
  Title: null,
  Description: '',
  DesignEffectiveness: null,
  PerformanceEffectiveness: null,
  files: [],
  Submitter: null as unknown as UserOption,
  CustomAttributeData: null,
};
