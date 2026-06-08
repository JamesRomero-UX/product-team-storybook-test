import { isNil } from 'lodash';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  StringDateSchema,
} from '../../../schemas/global';

const message = 'Required';

const checkForRequiredResult = (
  {
    targetValueNum,
    targetValueTxt,
  }: { targetValueTxt?: null | string; targetValueNum?: null | number },
  ctx: z.RefinementCtx
) => {
  if (isNil(targetValueNum) && isNil(targetValueTxt)) {
    ctx.addIssue({
      message,
      code: z.ZodIssueCode.custom,
      path: ['TargetValueTxt'],
    });
    ctx.addIssue({
      message,
      code: z.ZodIssueCode.custom,
      path: ['TargetValueNum'],
    });
  }
};

export const indicatorResultSchema = z
  .object({
    Description: z.string().nullish(),
    ResultDate: StringDateSchema,
    TargetValueNum: z.number().nullish(),
    TargetValueTxt: z.string().nullish(),
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema)
  .superRefine((values, ctx) => {
    checkForRequiredResult(
      {
        targetValueNum: values.TargetValueNum,
        targetValueTxt: values.TargetValueTxt,
      },
      ctx
    );
  });

export type IndicatorResultFormFields = z.infer<typeof indicatorResultSchema>;

export const defaultValues: IndicatorResultFormFields = {
  Description: '',
  ResultDate: '',
  TargetValueNum: null,
  TargetValueTxt: null,
  CustomAttributeData: null,
  files: [],
};
