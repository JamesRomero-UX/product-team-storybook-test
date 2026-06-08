import { useMutation } from '@apollo/client';
import {
  LinkItemsDocument,
  type Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import type { LinkedItemFields } from 'src/schemas/linkedItemSchema';
import { defaultValues, LinkedItem } from 'src/schemas/linkedItemSchema';

import { evictField } from '@/utils/graphqlUtils';

import LinkedItemForm from '../forms/LinkedItemForm';

interface Props {
  onDismiss: (saved?: boolean) => void;
  sourceId: string;
  excludeIds: string[];
  includeAssessments?: boolean;
  restrictTypesTo?: Parent_Type_Enum;
}

const LinkItemModal: FC<Props> = ({
  sourceId,
  excludeIds,
  onDismiss,
  includeAssessments,
  restrictTypesTo,
}) => {
  const { t } = useTranslation('common');
  const [insert] = useMutation(LinkItemsDocument, {
    update: (cache) => {
      evictField(cache, 'linked_item');
      evictField(cache, 'control');
      evictField(cache, 'action');
      evictField(cache, 'issue');
      evictField(cache, 'appetite');
      evictField(cache, 'risk');
    },
  });

  const onSave = async (data: LinkedItemFields) => {
    await insert({
      variables: {
        Source: sourceId,
        Targets: data.Target.map((c) => c.value),
      },
    });
  };

  return (
    <ModalForm
      formId={'link-item'}
      onSave={onSave}
      schema={LinkedItem}
      i18n={t('linkedItems')}
      defaultValues={defaultValues}
      visible={true}
      onDismiss={onDismiss}
    >
      <LinkedItemForm
        excludeIds={excludeIds}
        includeAssessments={includeAssessments}
        restrictTypeTo={restrictTypesTo}
      />
    </ModalForm>
  );
};

export default LinkItemModal;
