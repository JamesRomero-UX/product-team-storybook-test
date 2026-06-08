import {
  Document_File_Type_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  CustomAttributeDataSchema,
  FileOrRelationSchema,
  NullableStringDateSchema,
  UserOptionSchema,
} from 'src/schemas/global';
import { z } from 'zod';

const Link = z.object({
  Type: z.literal(Document_File_Type_Enum.Link),
  Link: z.string({ invalid_type_error: 'Required' }).url(),
});
const Html = z.object({
  Type: z.literal(Document_File_Type_Enum.Html),
  Content: z.string({ invalid_type_error: 'Required' }),
});

const FileDoc = z.object({
  Type: z.literal(Document_File_Type_Enum.File),
  files: z.array(FileOrRelationSchema),
});

const Types = z.discriminatedUnion('Type', [Link, Html, FileDoc]);

export const DocumentFileFormSchema = z
  .object({
    Version: z.string().min(1, { message: 'Required' }),
    Summary: z.string().nullish(),
    Status: z.nativeEnum(Version_Status_Enum),
    ReasonForReview: z.string().nullish(),
    ReviewedBy: UserOptionSchema.nullish(),
    ReviewDate: NullableStringDateSchema,
    NextReviewDate: NullableStringDateSchema,
  })
  .and(Types)
  .and(CustomAttributeDataSchema)
  .superRefine((values, ctx) => {
    if (values.Type === Document_File_Type_Enum.File) {
      const newFiles =
        values.files?.filter((f): f is File => f instanceof File) || [];
      const existingFiles =
        values.files?.filter((f) => !(f instanceof File)) || [];
      if (newFiles.length !== 1 && existingFiles.length !== 1) {
        ctx.addIssue({
          message: 'Required',
          code: z.ZodIssueCode.custom,
          path: ['files'],
        });
      }
    }
  });

export type DocumentVersionFormFieldData = z.infer<
  typeof DocumentFileFormSchema
>;

export const defaultValues: DocumentVersionFormFieldData = {
  Version: '',
  Summary: null,
  Status: Version_Status_Enum.Draft,
  ReasonForReview: null,
  ReviewedBy: null,
  ReviewDate: null,
  NextReviewDate: null,
  Type: Document_File_Type_Enum.File,
  files: [],
};
