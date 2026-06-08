import { useMutation } from '@apollo/client';
import { LinkItemsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { evictField } from '@/utils/graphqlUtils';

import type { LinkedItemFields } from '../../../schemas/linkedItemSchema';
import { defaultValues, LinkedItem } from '../../../schemas/linkedItemSchema';
import LinkRisksForm from '../forms/LinkRisksForm';

interface Props {
  onDismiss: () => void;
  sourceId: string;
  excludeIds: string[];
  isVisible: boolean;
}

const LinkRisksModal: FC<Props> = ({
  isVisible,
  sourceId,
  excludeIds,
  onDismiss,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'internalAudits',
  });
  const [insert] = useMutation(LinkItemsDocument, {
    update: (cache) => {
      evictField(cache, 'linked_item');
      evictField(cache, 'risk');
      evictField(cache, 'internal_audit_entity');
    },
    refetchQueries: [],
  });

  const onSave = async (data: LinkedItemFields) => {
    await insert({
      variables: {
        Source: sourceId,
        Targets: data.Target.map((c) => c.value),
      },
    });
  };
  const defaultSubmitActions = [
    {
      label: t('linkRisksModal.linkButton'),
      action: onSave,
    },
  ];

  return (
    <ModalForm
      formId={'link-item'}
      header={t('linkRisksModal.header')}
      onSave={onSave}
      schema={LinkedItem}
      i18n={t('linkRisksModal')}
      defaultValues={defaultValues}
      visible={isVisible}
      onDismiss={onDismiss}
      submitActions={defaultSubmitActions}
    >
      <LinkRisksForm excludedRiskIds={excludeIds} />
    </ModalForm>
  );
};

export default LinkRisksModal;
