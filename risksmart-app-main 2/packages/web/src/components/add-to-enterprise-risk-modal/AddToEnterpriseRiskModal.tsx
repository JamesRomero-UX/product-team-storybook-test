import { useMutation } from '@apollo/client';
import { AddRiskToEnterpriseRiskDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalForm } from '../form/form/ModalForm';
import InstantiateEnterpriseRiskForm from './AddToEnterpriseRiskForm';
import type { SchemaFields } from './schema';
import { schema } from './schema';

interface Props {
  riskId: string;
  entityId: null | string | undefined;
  enterpriseRiskId: null | string | undefined;
  riskTier: number;
  isVisible: boolean;
  onDismiss: () => void;
  modalSubType: 'enterpriseRisk' | 'entity';
}

const AddToEnterpriseRiskModal: FC<Props> = ({
  isVisible,
  onDismiss,
  riskId,
  riskTier,
  enterpriseRiskId,
  entityId,
  modalSubType,
}) => {
  const { t } = useTranslation(['common']);
  const [addRiskToEnterpriseRisk] = useMutation(
    AddRiskToEnterpriseRiskDocument
  );

  const onSubmit = async (data: SchemaFields) => {
    await addRiskToEnterpriseRisk({
      variables: {
        objects: [
          {
            EnterpriseRiskId: data.EnterpriseRiskId,
            EntityId: data.EntityId,
            RiskId: riskId,
          },
        ],
      },
    });
  };

  return (
    <ModalForm<SchemaFields>
      onDismiss={onDismiss}
      visible={isVisible}
      values={{ EntityId: '', EnterpriseRiskId: '' }}
      onSave={onSubmit}
      formId={'instantiateEnterpriseRisk'}
      schema={schema({
        currentEnterpriseRiskId: enterpriseRiskId,
        currentEntityId: entityId,
        errorMessage: t(
          'enterpriseRisks.addRiskToEnterpriseRisk.duplicate_error'
        ),
      })}
      i18n={t('enterpriseRisks')}
      defaultValues={{ EntityId: '', EnterpriseRiskId: '' }}
    >
      <InstantiateEnterpriseRiskForm
        riskTier={riskTier}
        entityId={entityId}
        enterpriseRiskId={enterpriseRiskId}
        modalSubType={modalSubType}
      />
    </ModalForm>
  );
};

export default AddToEnterpriseRiskModal;
