import Alert from '@risk-smart/themed-cloudscape-components/alert';
import { getIsActionAllowed } from '@risksmart-app/shared/third-party/responses/responseUtils';
import type { Third_Party_Response_Enum_Action } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { ButtonVariant } from 'src/components/form/form/types';

import type { ThirdPartyResponseRegisterFields } from '../types';
import type { UpdateStatusSchemaFields } from './schema';
import { translationKeyMap } from './schema';
import { UpdateStatusSchema } from './schema';
import { UpdateStatusModalForm } from './UpdateStatusModalForm';

interface Props {
  onDismiss: () => void;
  onUpdateStatus: (data: UpdateStatusSchemaFields) => Promise<void>;
  action: Third_Party_Response_Enum_Action;
  isVisible: boolean;
  loading?: boolean;
  selectedItems: ThirdPartyResponseRegisterFields[];
  setSelectedItems?: (items: ThirdPartyResponseRegisterFields[]) => void;
}

export const UpdateStatusModal: FC<Props> = ({
  onDismiss,
  onUpdateStatus,
  isVisible,
  action,
  loading,
  selectedItems,
  setSelectedItems,
}) => {
  const translationKey = translationKeyMap[action];
  const { t: rt } = useTranslation('common', {
    keyPrefix: 'third_party_responses.updateStatus',
  });

  const warning = rt(`${translationKey}.warning`);

  const onSave = async (data: UpdateStatusSchemaFields) => {
    await onUpdateStatus(data);
  };

  const cannotPerformActionList = selectedItems.filter((item) => {
    if (!action) {
      return true;
    }

    return !getIsActionAllowed(action, item.Status);
  });

  const cannotPerformAction = cannotPerformActionList.length > 0;

  const submitActions = [
    ...(cannotPerformAction
      ? []
      : [
          {
            label: rt(`${translationKey}.confirm`),
            action: onSave,
            variant: ButtonVariant.Primary,
            loading,
          },
        ]),
  ];

  const secondaryActions = [
    ...(cannotPerformAction && setSelectedItems !== undefined
      ? [
          {
            label: rt('deselectButtonLabel'),
            action: (): Promise<void> => {
              const afterDeselectionList = selectedItems.filter((item) =>
                getIsActionAllowed(action, item.Status)
              );

              if (afterDeselectionList.length === 0) {
                onDismiss();
              }

              setSelectedItems(afterDeselectionList);

              return Promise.resolve();
            },
            variant: ButtonVariant.Normal,
            loading,
          },
        ]
      : []),
  ];

  const modalTitle = rt(
    cannotPerformAction
      ? `${translationKey}.cannotPerformActionModalTitle`
      : `${translationKey}.header`,
    {
      count: selectedItems?.length || 0,
    }
  );

  const defaultValues = {
    RequestType: '',
    Reason: '',
    ShareWithRespondents: true,
  };

  return (
    <ModalForm<UpdateStatusSchemaFields>
      onDismiss={onDismiss}
      visible={isVisible}
      size={'large'}
      formId={'update-status-modal'}
      defaultValues={defaultValues}
      values={defaultValues}
      schema={UpdateStatusSchema}
      onSave={onSave}
      submitActions={submitActions}
      secondaryActions={secondaryActions}
      header={modalTitle}
      i18n={{
        entity_name: rt('entityName'),
        edit_modal_title: modalTitle,
      }}
    >
      {cannotPerformAction ? (
        <>
          {selectedItems.length === 1
            ? rt(`${translationKey}.cannotPerformActionOneDescription`)
            : rt(`${translationKey}.cannotPerformActionSomeDescription`, {
                cannotPerformActionListCount:
                  cannotPerformActionList?.length || 0,
                selectedItemsCount: selectedItems.length,
              })}
        </>
      ) : (
        <>
          {warning ? (
            <Alert type={'warning'}>
              {rt(`${translationKey}.warning`, {
                selectedItemsCount: selectedItems.length,
              })}
            </Alert>
          ) : null}
          <UpdateStatusModalForm action={action} />
        </>
      )}
    </ModalForm>
  );
};
