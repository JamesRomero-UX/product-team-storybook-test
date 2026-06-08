import z from 'zod';

export const documentIdSchema = z.string().uuid().brand('DocumentId');
export type DocumentId = z.infer<typeof documentIdSchema>;
