import { useMutation } from '@apollo/client';
import { InstatiateEnterpriseRiskDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { evictField } from '@/utils/graphqlUtils';

import { ModalForm } from '../form/form/ModalForm';
import InstantiateEnterpriseRiskForm from './InstantiateEnterpriseRiskForm';
import type { SchemaFields } from './schema';
import { schema } from './schema';

interface Props {
  enterpriseRiskIds: string[];
  isVisible: boolean;
  onDismiss: () => void;
}

const InstantiateEnterpriseRiskModal: FC<Props> = ({
  isVisible,
  onDismiss,
  enterpriseRiskIds,
}) => {
  const { t } = useTranslation(['common']);

  const [instantiate] = useMutation(InstatiateEnterpriseRiskDocument, {
    update: (cache) => {
      evictField(cache, 'risk');
    },
  });

  const onSubmit = async (data: SchemaFields) => {
    await instantiate({
      variables: {
        EnterpriseRiskIds: enterpriseRiskIds,
        Entities: data.Entities.map((e) => e.value),
      },
    });
  };

  return (
    <ModalForm<SchemaFields>
      onDismiss={onDismiss}
      visible={isVisible}
      values={{ Entities: [] }}
      size={'max'}
      onSave={onSubmit}
      formId={'instantiateEnterpriseRisk'}
      schema={schema}
      i18n={t('enterpriseRisks')}
      defaultValues={{ Entities: [] }}
      header={t('enterpriseRisks.instantiateModal.header')}
    >
      <InstantiateEnterpriseRiskForm />
    </ModalForm>
  );
};

export default InstantiateEnterpriseRiskModal;
