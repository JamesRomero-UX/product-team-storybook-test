import { useMutation, useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  DeleteApprovalDocument,
  GetApprovalByIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';

type Props = {
  open: boolean;
  onClose?: () => void;
  approvalId: null | string;
  parentId?: string;
  readOnly?: boolean;
};

const ApprovalModal: FC<Props> = ({
  open,
  onClose,
  approvalId,
  parentId,
  readOnly,
}) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation(['common'], { keyPrefix: 'approvals' });
  const [deleteApproval] = useMutation(DeleteApprovalDocument, {
    update: (cache) => evictField(cache, 'approval'),
  });

  const { data, loading } = useQuery(GetApprovalByIdDocument, {
    variables: {
      Id: approvalId!,
    },
    skip: !approvalId,
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const approval = data?.approval;

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      if (!approvalId) {
        return false;
      }
      await deleteApproval({
        variables: {
          Id: approvalId,
        },
      });
      onClose?.();

      return true;
    },
  });

  return (
    <>
      {loading || !open ? null : approval ? (
        <UpdateModal
          approval={approval}
          onDismiss={onClose}
          onDelete={
            approval
              ? async () => {
                  await onDelete();
                }
              : undefined
          }
          readOnly={readOnly}
          parentId={parentId}
        />
      ) : (
        <CreateModal
          onDismiss={onClose}
          parentId={parentId}
          readOnly={readOnly}
        />
      )}
    </>
  );
};

export default ApprovalModal;
