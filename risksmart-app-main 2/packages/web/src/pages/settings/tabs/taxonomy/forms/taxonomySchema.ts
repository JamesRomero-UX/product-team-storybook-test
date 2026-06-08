import { z } from 'zod';

const isValidJson = (value: string) => {
  try {
    JSON.parse(value);

    return true;
  } catch (_) {
    return false;
  }
};

export const TaxonomySchema = z.object({
  Rating: z.string().refine(isValidJson, 'Invalid JSON'),
  Common: z.string().refine(isValidJson, 'Invalid JSON'),
  Taxonomy: z.string().refine(isValidJson, 'Invalid JSON'),
  Library: z.string().refine(isValidJson, 'Invalid JSON'),
  InternalAuditRating: z.string().refine(isValidJson, 'Invalid JSON'),
});

export type TaxonomyDataFields = z.infer<typeof TaxonomySchema>;

export const defaultValues: TaxonomyDataFields = {
  Rating: '{}',
  Taxonomy: '{}',
  Library: '{}',
  Common: '{}',
  InternalAuditRating: '{}',
};
