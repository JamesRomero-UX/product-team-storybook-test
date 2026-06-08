import { z } from 'zod';

export const RequestTypeOptions: { [key: string]: string } = {
  furtherInformationRequired: 'Further information required',
  informationProvidedUnclear: 'Information provided unclear',
};

export const UpdateStatusSchema = z.object({
  Reason: z.string().optional(),
  RequestType: z.string({ message: 'Please select a request type' }).optional(),
  ShareWithRespondents: z.boolean().default(false),
});

export type UpdateStatusSchemaFields = z.infer<typeof UpdateStatusSchema>;

// This has been ignored because the keys are set in snake case
// in the database and would require a migration to change
/* eslint-disable @typescript-eslint/naming-convention */
export enum translationKeyMap {
  approve = 'approve',
  recall = 'recall',
  reject = 'reject',
  request_more_information = 'moreInformation',
}
