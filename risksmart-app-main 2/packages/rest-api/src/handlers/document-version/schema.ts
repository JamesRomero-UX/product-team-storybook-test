import { DocumentFileTypeEnum, VersionStatusEnum } from 'generated/graphql';
import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

const Link = z.object({
  Type: z.literal(DocumentFileTypeEnum.Link),
  Link: z.string({ invalid_type_error: 'Required' }).url(),
});
const Html = z.object({
  Type: z.literal(DocumentFileTypeEnum.Html),
  Content: z.string({ invalid_type_error: 'Required' }),
});

const File = z.object({
  Type: z.literal(DocumentFileTypeEnum.File),
  FileId: z.string().uuid(),
});

const Types = z.discriminatedUnion('Type', [Link, Html, File]);

const Published = z.object({
  Status: z.literal(VersionStatusEnum.Published),
});

const Draft = z.object({
  Status: z.literal(VersionStatusEnum.Draft),
});

const PendingApproval = z.object({
  Status: z.literal(VersionStatusEnum.PendingApproval),
});

const Archived = z.object({
  Status: z.literal(VersionStatusEnum.Archived),
});

const Statuses = z.discriminatedUnion('Status', [
  Published,
  Draft,
  Archived,
  PendingApproval,
]);

const SharedSchema = z
  .object({
    ReasonForReview: z.string().nullable(),
    ReviewedBy: z.string().nullable(),
    ReviewDate: NullableStringDateSchema,
    NextReviewDate: NullableStringDateSchema,
    Version: z.string().min(1, { message: 'Required' }),
    Summary: z.string().nullable(),
  })
  .and(CustomAttributeDataSchema)
  .and(Types);
export const PostSchema = SharedSchema.and(
  z.object({
    ParentDocumentId: z.string().uuid(),
  })
);

export type PostDocumentVersion = z.infer<typeof PostSchema>;

export const PutSchema = SharedSchema.and(
  z
    .object({
      Id: z.string().uuid(),
      Status: z.nativeEnum(VersionStatusEnum),
    })
    .and(Statuses)
);

export type PutDocumentVersion = z.infer<typeof PutSchema>;
