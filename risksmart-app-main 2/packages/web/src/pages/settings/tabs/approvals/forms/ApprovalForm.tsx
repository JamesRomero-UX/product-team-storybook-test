import { useLazyQuery } from '@apollo/client';
import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Modal from '@risksmart-app/components/src/modal';
import { GetChangeRequestsByApprovalDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import DeleteModal from 'src/components/delete-modal';
import { ModalForm } from 'src/components/form/form/ModalForm';
import type {
  FormContextProps,
  SaveAction,
} from 'src/components/form/form/types';
import { ButtonVariant } from 'src/components/form/form/types';

import { requestsRegisterUrl } from '@/utils/urls';

import ApprovalFormFields from './ApprovalFormFields';
import type { ApprovalFormValues } from './approvalFormSchema';
import { defaultValues, useApprovalFormSchema } from './approvalFormSchema';

export type Props = Omit<
  FormContextProps<ApprovalFormValues>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'onDelete'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
> & {
  parentId?: string;
  onDelete?: () => Promise<void>;
};

const ApprovalForm: FC<Props> = ({ onDelete, ...props }) => {
  const approvalFormSchema = useApprovalFormSchema(props.parentId);
  const { t } = useTranslation(['common']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const { getByValue: getApprovalStatus } = useRating('approval_status');
  const [inFlightChangeRequests, setInFlightChangeRequests] = useState<
    { Id: string }[]
  >([]);
  const [getInFlightChangeRequests] = useLazyQuery(
    GetChangeRequestsByApprovalDocument,
    {
      fetchPolicy: 'network-only',
    }
  );

  const checkInFlightChangeRequests = async (approvalId: string) => {
    const result = await getInFlightChangeRequests({
      variables: {
        approvalId,
      },
    });
    if ((result.data?.change_request.length ?? 0) > 0) {
      setInFlightChangeRequests(result.data!.change_request);
      throw new Error('In-flight change requests exist for this approval');
    } else {
      return true;
    }
  };

  const onSave: SaveAction<ApprovalFormValues> = async (data) => {
    if (data.Id) {
      if (await checkInFlightChangeRequests(data.Id)) {
        return props.onSave(data);
      }
    } else {
      return props.onSave(data);
    }
  };

  const beforeDelete = async () => {
    setShowDeleteModal(false);
    if (await checkInFlightChangeRequests(props.values?.Id ?? '')) {
      return onDelete?.();
    }
  };

  return (
    <ModalForm
      {...props}
      onSave={onSave}
      visible={true}
      size={'large'}
      header={t('details')}
      formId={'update-approval-form'}
      defaultValues={defaultValues}
      i18n={t('approvals')}
      schema={approvalFormSchema}
      secondaryActions={
        props.values?.Id
          ? [
              {
                label: t('delete'),
                action: async () => setShowDeleteModal(true),
                variant: ButtonVariant.Danger,
              },
            ]
          : []
      }
    >
      <ApprovalFormFields parentId={props.parentId} />
      {inFlightChangeRequests.length > 0 && (
        <Modal
          visible={true}
          header={t('approvals.approval_change_requests_in_flight.title')}
          footer={
            <div className={'gap-3 flex flex-row'}>
              <Button
                variant={'primary'}
                onClick={() =>
                  navigate(
                    requestsRegisterUrl({
                      tokens: [
                        {
                          propertyKey: 'approvalConfig',
                          value: props.values?.Id ?? '',
                          operator: '=',
                        },
                        {
                          propertyKey: 'StatusLabelled',
                          value: getApprovalStatus('pending')?.label ?? '',
                          operator: '=',
                        },
                      ],
                      operation: 'and',
                    })
                  )
                }
              >
                {'View Pending Requests'}
              </Button>
              <Button onClick={() => setInFlightChangeRequests([])}>
                {t('close')}
              </Button>
            </div>
          }
          onDismiss={(event) => {
            // don't close modal on overlay click
            if (event.detail.reason === 'overlay') {
              return;
            }
            setInFlightChangeRequests([]);
          }}
        >
          <p className={'m-0'}>
            {t('approvals.approval_change_requests_in_flight.body')}
          </p>
        </Modal>
      )}
      {showDeleteModal && (
        <DeleteModal
          isVisible={true}
          onDelete={beforeDelete}
          onDismiss={() => setShowDeleteModal(false)}
          header={t('approvals.confirm_delete_title')}
        >
          {t('approvals.confirm_delete_message')}
        </DeleteModal>
      )}
    </ModalForm>
  );
};

export default ApprovalForm;
