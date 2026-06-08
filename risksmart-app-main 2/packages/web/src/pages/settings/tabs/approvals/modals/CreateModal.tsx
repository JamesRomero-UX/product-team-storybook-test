import { useMutation } from '@apollo/client';
import { InsertApprovalDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';

import { evictField } from '@/utils/graphqlUtils';

import ApprovalForm from '../forms/ApprovalForm';
import type { ApprovalFormValues } from '../forms/approvalFormSchema';

type Props = {
  parentId?: string;
  onDismiss?: () => void;
  onDelete?: () => Promise<void>;
  readOnly?: boolean;
};

const CreateModal: FC<Props> = ({
  onDismiss,
  parentId,
  onDelete,
  readOnly,
}) => {
  const [insertApproval] = useMutation(InsertApprovalDocument, {
    update: (cache) => evictField(cache, 'approval'),
  });

  const onSave = async (data: ApprovalFormValues) => {
    await insertApproval({
      variables: {
        approval: {
          Workflow: data.Workflow,
          ParentId: data.ParentId,
          InFlightEditRule: data.InFlightEditRule,
          levels: {
            data: data.levels.map((level, i) => ({
              Description: `${level} i`,
              SequenceOrder: i,
              ApprovalRuleType: level.ApprovalRuleType,
              approvers: {
                data: level.approvers.map((approver) => ({
                  UserId: approver.UserId,
                  OwnerApprover: approver.OwnerApprover,
                  UserGroupId: approver.UserGroupId,
                })),
              },
            })),
          },
        },
      },
    });
  };

  return (
    <ApprovalForm
      parentId={parentId}
      onSave={onSave}
      onDismiss={onDismiss}
      onDelete={onDelete}
      readOnly={readOnly}
    />
  );
};

export default CreateModal;
