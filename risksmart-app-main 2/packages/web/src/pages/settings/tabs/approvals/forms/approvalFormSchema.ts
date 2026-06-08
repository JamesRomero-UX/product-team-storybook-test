import {
  Approval_In_Flight_Edit_Rule_Enum,
  Approval_Rule_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { DefaultValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGetGlobalApprovals } from 'src/hooks/queries/approval/useGetGlobalApprovals';
import z from 'zod';

const approverSchema = z
  .object({
    Id: z.string().nullish(),
    UserId: z.string().nullish(),
    UserGroupId: z.string().nullish(),
    OwnerApprover: z.boolean().nullish(),
    user: z
      .object({
        FriendlyName: z.string().nullish(),
      })
      .nullish(),
    group: z
      .object({
        Name: z.string().nullish(),
      })
      .nullish(),
  })
  .superRefine((data, ctx) => {
    if (!data.OwnerApprover && !data.UserId && !data.UserGroupId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either UserId, UserGroup, or OwnerApprover must be set',
      });
    }
  });

const approvalLevelSchema = z.object({
  Id: z.string().nullish(),
  ApprovalRuleType: z.nativeEnum(Approval_Rule_Type_Enum),
  approvers: z
    .array(approverSchema)
    .min(1, 'At least one approver is required'),
});

export const useApprovalFormSchema = (parentId: string | undefined) => {
  const { t } = useTranslation('common', { keyPrefix: 'approvals' });
  const { refetch } = useGetGlobalApprovals({
    queryArgs: {
      isGlobal: !parentId,
      parentId: parentId ?? '00000000-0000-0000-0000-000000000000',
    },
  });

  const approvalFormSchema = z
    .object({
      Id: z.string().nullish(),
      ParentId: z.string().nullish(),
      Workflow: z.string(),
      InFlightEditRule: z.nativeEnum(Approval_In_Flight_Edit_Rule_Enum),
      levels: z
        .array(approvalLevelSchema)
        .min(1, 'At least one level is required'),
    })
    .superRefine(async (values, ctx) => {
      const { data } = await refetch();

      const existingWorkflows = data?.approval.filter(
        (cg) => cg.Workflow === values.Workflow
      );
      if (
        (existingWorkflows?.length ?? 0) > 0 &&
        existingWorkflows?.every((workflow) => workflow.Id !== values.Id)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('fields.validation.duplicateWorkflow'),
          path: ['Workflow'],
        });
      }
    });

  return approvalFormSchema;
};

export type ApprovalFormValues = z.infer<
  ReturnType<typeof useApprovalFormSchema>
>;

export const defaultValues: DefaultValues<ApprovalFormValues> = {
  InFlightEditRule: Approval_In_Flight_Edit_Rule_Enum.Approvers,
  levels: [
    {
      approvers: [],
      ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
    },
  ],
};
