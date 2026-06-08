import isValidDomain from 'is-valid-domain';
import { z } from 'zod';

export const ScimDomainFormSchema = z.object({
  domain: z.string().refine((value) => isValidDomain(value), {
    message: 'Please enter a valid domain',
  }),
});

export type ScimDomainFormFields = z.infer<typeof ScimDomainFormSchema>;

export const defaultValues: ScimDomainFormFields = {
  domain: '',
};
