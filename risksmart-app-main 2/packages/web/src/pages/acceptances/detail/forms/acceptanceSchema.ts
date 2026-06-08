import { Acceptance_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  StringDateSchema,
  UserOrGroupSchema,
} from '../../../../schemas/global';

export const AcceptanceSchema = z
  .object({
    Id: z.string().uuid().optional(),
    Status: z.nativeEnum(Acceptance_Status_Enum, {
      errorMap: () => ({ message: 'Required' }),
    }),
    DateAcceptedFrom: StringDateSchema,
    DateAcceptedTo: StringDateSchema,
    Details: z.string().nullish(),
    Title: z.string().min(1, { message: 'Required' }),
    approvedBy: UserOrGroupSchema.nullish(),
    requestedBy: UserOrGroupSchema.nullish(),
    files: z.array(FileOrRelationSchema),
  })
  .and(CustomAttributeDataSchema);

export type AcceptanceFormDataFields = z.infer<typeof AcceptanceSchema>;

export const defaultValues: AcceptanceFormDataFields = {
  Details: '',
  DateAcceptedTo: '',
  DateAcceptedFrom: '',
  Status: Acceptance_Status_Enum.Pending,
  Title: '',
  files: [],
  approvedBy: null,
  requestedBy: null,
  CustomAttributeData: null,
};
