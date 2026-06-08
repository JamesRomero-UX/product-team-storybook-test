import { humanFileSize } from '@risksmart-app/components/src/file/fileUtils';
import { allowedFileExtensions } from '@risksmart-app/shared/src/allowedFileExtensions';
import { FileSchema } from '@risksmart-app/shared/src/forms/shared-schemas/fileSchema';
import { z } from 'zod';

const regexDate = /\d{4}-\d{2}-\d{2}/;

export const StringDateSchema = z
  .string({ invalid_type_error: 'Required' })
  .regex(regexDate, 'Required')
  .refine((date) => new Date(date) > new Date('1900-01-01'), 'Invalid date');

export const NullableStringDateSchema = StringDateSchema.or(z.string().max(0))
  .transform((value) => (value === '' ? null : value))
  .nullish();

export const FileOrRelationSchema = z
  .union([z.instanceof(File), FileSchema.nullish()])
  .superRefine((values, ctx) => {
    validateNewFilesSizeAndExtension([values], ctx);
  });

export type FileOrRelation = z.infer<typeof FileOrRelationSchema>;

export const UserOrGroupSchema = z.object({
  type: z.enum(['user', 'userGroup']),
  value: z.string(),
});

export const UserOptionSchema = z.object(
  {
    type: z.enum(['user']),
    value: z.string(),
  },
  { invalid_type_error: 'Required' }
);

export type UserOption = z.infer<typeof UserOptionSchema>;

export type UserOrGroup = z.infer<typeof UserOrGroupSchema>;

const validateNewFilesSizeAndExtension = (
  files: FileOrRelation[],
  ctx: z.RefinementCtx
) => {
  const ONE_GB = 1024 * 1024 * 1024;
  for (const file of files.filter((f) => f instanceof File) || ([] as File[])) {
    const fileParts = file.name.split('.');
    const extension = fileParts[fileParts.length - 1];
    if (!allowedFileExtensions.includes(`.${extension.toLowerCase()}`)) {
      ctx.addIssue({
        message: `${file.name} is an unsupported file type`,
        code: z.ZodIssueCode.custom,
        path: ['files'],
      });
    }
    if (file.size > ONE_GB) {
      ctx.addIssue({
        message: `${file.name} must be less then ${humanFileSize(
          ONE_GB,
          0
        )} in size`,
        code: z.ZodIssueCode.custom,
        path: ['files'],
      });
    }
  }
};

export const InheritedContributorSchema = z.array(
  z.object({
    UserId: z.string().nullish(),
    Id: z.string().nullish(),
    AncestorId: z.string().nullish(),
  })
);

export const UserOrGroupsSchema = z.array(UserOrGroupSchema);

const TagSchema = z.object({
  TagTypeId: z.string(),
});

const DepartmentSchema = z.object({
  DepartmentTypeId: z.string(),
});

const TagsSchema = z.object({
  tags: z.array(TagSchema).nullable(),
});

const DepartmentsSchema = z.object({
  departments: z.array(DepartmentSchema).nullable(),
});

export const TagsAndDepartmentsSchema = TagsSchema.and(DepartmentsSchema);

const CustomAttributeDataFieldSchema = z.any().nullish();

export const CustomAttributeDataSchema = z.object({
  CustomAttributeData: CustomAttributeDataFieldSchema,
});
