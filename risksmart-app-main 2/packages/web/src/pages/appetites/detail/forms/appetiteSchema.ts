import i18n from '@risksmart-app/i18n/src/i18n';
import { Appetite_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import _ from 'lodash';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  NullableStringDateSchema,
} from '../../../../schemas/global';

export const getAppetiteSchema = () =>
  z
    .object({
      ImpactId: z.string().uuid().nullish(),
      Statement: z.string().nullable().optional(),
      LowerAppetite: z.number().nullable().optional(),
      UpperAppetite: z.number().nullable().optional(),
      EffectiveDate: NullableStringDateSchema.refine(
        (e) => e === null || dayjs(e).isBefore(),
        { message: i18n.t('appetites.validation.dateCannotBeInTheFuture') }
      ),
      AppetiteType: z.nativeEnum(Appetite_Type_Enum),
      ImpactAppetite: z.number().nullable().optional(),
      LikelihoodAppetite: z.number().nullable().optional(),
      files: z.array(FileOrRelationSchema),
    })
    .superRefine((val, ctx) => {
      if (val.AppetiteType === Appetite_Type_Enum.Impact && !val.ImpactId) {
        ctx.addIssue({
          message: 'Required',
          code: z.ZodIssueCode.custom,
          path: ['ImpactId'],
        });
      }

      if (
        val.AppetiteType === Appetite_Type_Enum.Impact &&
        _.isNil(val.ImpactAppetite)
      ) {
        ctx.addIssue({
          message: 'Required',
          code: z.ZodIssueCode.custom,
          path: ['ImpactAppetite'],
        });
      }

      if (
        val.AppetiteType === Appetite_Type_Enum.Likelihood &&
        !val.LikelihoodAppetite
      ) {
        ctx.addIssue({
          message: 'Required',
          code: z.ZodIssueCode.custom,
          path: ['LikelihoodAppetite'],
        });
      }

      if (val.AppetiteType === Appetite_Type_Enum.Risk && !val.UpperAppetite) {
        ctx.addIssue({
          message: 'Required',
          code: z.ZodIssueCode.custom,
          path: ['UpperAppetite'],
        });
      }
    })
    .and(CustomAttributeDataSchema);

export type AppetiteFormFieldsData = z.infer<
  ReturnType<typeof getAppetiteSchema>
>;

export const defaultValues: AppetiteFormFieldsData = {
  files: [],
  CustomAttributeData: null,
  Statement: '',
  LowerAppetite: undefined,
  UpperAppetite: undefined,
  EffectiveDate: null,
  AppetiteType: Appetite_Type_Enum.Risk,
  ImpactAppetite: undefined,
  LikelihoodAppetite: undefined,
  ImpactId: null,
};
