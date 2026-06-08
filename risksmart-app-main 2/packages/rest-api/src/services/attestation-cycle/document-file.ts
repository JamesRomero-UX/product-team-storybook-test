import z from 'zod';

export const documentFileIdSchema = z.string().uuid().brand('DocumentFileId');
export type DocumentFileId = z.infer<typeof documentFileIdSchema>;
