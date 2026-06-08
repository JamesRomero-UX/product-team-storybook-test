import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { z } from 'zod';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export const thirdPartyIdSchema = z.coerce.string().min(1);
export const nullableThirdPartyIdSchema = z.coerce.string().nullable();
export const dateTimeString = z
  .string()
  .datetime({ offset: true })
  .or(
    z
      .string()
      .refine((v) => {
        try {
          return !!dayjs.utc(v, 'DD/MM/YYYY').toISOString();
        } catch {
          return false;
        }
      })
      .transform((v) => dayjs.utc(v, 'DD/MM/YYYY').toISOString())
  )
  .or(
    z
      .string()
      .refine((v) => {
        try {
          return !!dayjs.utc(v).toISOString();
        } catch {
          return false;
        }
      })
      .transform((v) => dayjs.utc(v).toISOString())
  );

export const CustomAttributeData = z.any().nullable();
