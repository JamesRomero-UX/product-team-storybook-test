import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import type { LinkedItemFields } from '../../../../schemas/linkedItemSchema';
import {
  defaultValues,
  LinkedItem,
} from '../../../../schemas/linkedItemSchema';
import LinkedItemForm from '../../../linked-items/forms/LinkedItemForm';

export type TLinkedItem = {
  Id: string;
  Type: Parent_Type_Enum;
  Label: string;
};

interface Props {
  onDismiss: () => void;
  excludeIds: string[];
  onSelect: (selected: TLinkedItem[]) => void;
}

export const LinkItemModal: FC<Props> = ({
  excludeIds,
  onDismiss,
  onSelect,
}) => {
  const onSave = async (data: LinkedItemFields) => {
    onSelect(
      data.Target.map((t) => ({
        Id: t.value,
        Type: data.Type || '',
        Label: t.label,
      }))
    );
  };
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities.linkedItems',
  });
  const { t: tt } = useTranslation(['common']);

  const defaultSubmitActions = [
    {
      label: t('add'),
      action: onSave,
    },
  ];

  return (
    <ModalForm
      formId={'link-item'}
      header={t('modal_title')}
      onSave={onSave}
      schema={LinkedItem}
      i18n={tt('assessmentActivities.linkedItems')}
      defaultValues={defaultValues}
      visible={true}
      onDismiss={onDismiss}
      submitActions={defaultSubmitActions}
    >
      <LinkedItemForm excludeIds={excludeIds} />
    </ModalForm>
  );
};
