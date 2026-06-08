import { useMutation } from '@apollo/client';
import type { GetApprovalByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateApprovalDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';

import { evictField } from '@/utils/graphqlUtils';

import ApprovalForm from '../forms/ApprovalForm';
import type { ApprovalFormValues } from '../forms/approvalFormSchema';

type Props = {
  approval: GetApprovalByIdQuery['approval'];
  onDismiss?: () => void;
  onDelete?: () => Promise<void>;
  readOnly?: boolean;
  parentId?: string;
};

const UpdateModal: FC<Props> = ({
  approval,
  onDismiss,
  onDelete,
  readOnly,
  parentId,
}) => {
  const [updateApproval] = useMutation(UpdateApprovalDocument, {
    update: (cache) => {
      evictField(cache, 'approval');
      evictField(cache, 'approval_by_pk');
    },
  });

  const onSave = async (data: ApprovalFormValues) => {
    if (!approval) {
      return;
    }
    const deleteLevelIds = approval.levels
      .map((l) => l.Id)
      .filter((id) => !data.levels.map((l) => l.Id).includes(id));
    const deleteApproverIds = approval.levels
      .flatMap((l) => l.approvers.map((a) => a.Id))
      .filter(
        (id) =>
          !data.levels.flatMap((l) => l.approvers.map((a) => a.Id)).includes(id)
      );
    const updateLevels = data.levels.filter((l) => l.Id);
    const insertLevels = data.levels
      .map((level, i) => ({ ...level, SequenceOrder: i }))
      .filter((l) => !l.Id);
    const insertApprovers = data.levels
      .map((level) => ({
        LevelId: level.Id,
        approvers: level.approvers.filter((a) => !a.Id),
      }))
      .filter((l) => l.LevelId);
    await updateApproval({
      variables: {
        deleteLevelIds,
        deleteApproverIds,
        Id: approval.Id,
        approval: {
          InFlightEditRule: data.InFlightEditRule,
          Workflow: data.Workflow,
        },
        updateLevels: updateLevels.map((level) => ({
          where: { Id: { _eq: level.Id } },
          _set: {
            Description: 'Approval Level',
            SequenceOrder: data.levels.findIndex((l) => l.Id === level.Id),
            ApprovalRuleType: level.ApprovalRuleType,
          },
        })),
        insertLevels: insertLevels.map((level) => ({
          ApprovalId: approval.Id,
          SequenceOrder: level.SequenceOrder,
          Description: 'Approval Level',
          ApprovalRuleType: level.ApprovalRuleType,
          approvers: {
            data: level.approvers.map((approver) => ({
              UserId: approver.UserId,
              UserGroupId: approver.UserGroupId,
              OwnerApprover: approver.OwnerApprover,
            })),
          },
        })),
        insertApprovers: insertApprovers.flatMap((level) =>
          level.approvers.map((approver) => ({
            LevelId: level.LevelId,
            UserId: approver.UserId,
            UserGroupId: approver.UserGroupId,
            OwnerApprover: approver.OwnerApprover,
          }))
        ),
      },
    });
  };

  return (
    <ApprovalForm
      onSave={onSave}
      onDismiss={onDismiss}
      values={approval ?? undefined}
      onDelete={onDelete}
      readOnly={readOnly}
      parentId={parentId}
    />
  );
};

export default UpdateModal;
