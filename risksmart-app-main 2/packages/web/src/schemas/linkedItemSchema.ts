import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { z } from 'zod';

export const LinkedItem = z.object({
  Target: z.array(z.object({ value: z.string().uuid(), label: z.string() })),
  Type: z.nativeEnum(Parent_Type_Enum),
});

export type LinkedItemFields = z.infer<typeof LinkedItem>;

export const defaultValues: LinkedItemFields = {
  Target: [],
  Type: Parent_Type_Enum.Control,
};
