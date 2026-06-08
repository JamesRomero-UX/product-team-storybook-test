import z from 'zod';

/**
 * CustomAttributeData type to support PostgreSQL JSONB data type
 * This allows for arbitrary key-value pairs where keys are typically identifier strings
 * and values can be primitives, arrays, or nested objects
 */
export interface JSONB {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | Array<string | number | boolean | null | JSONB>;
}

export const auditFieldSchema = z.object({
  createdByUser: z.string(),
  modifiedByUser: z.string(),
  createdAtTimestamp: z.date(), // todo should these be strings? node is a bit inconsistent with date handling
  modifiedAtTimestamp: z.date(),
});
