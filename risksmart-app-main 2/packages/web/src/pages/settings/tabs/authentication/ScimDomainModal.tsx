import { useMutation } from '@apollo/client';
import { InsertScimDomainDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { evictField } from '@/utils/graphqlUtils';

import ScimDomainForm from './forms/ScimDomainForm';
import type { ScimDomainFormFields } from './forms/ScimDomainFormSchema';
import {
  defaultValues,
  ScimDomainFormSchema,
} from './forms/ScimDomainFormSchema';

type Props = {
  onDismiss: () => void;
};

const ScimDomainModal: FC<Props> = ({ onDismiss }) => {
  const { t } = useTranslation();

  const [insert] = useMutation(InsertScimDomainDocument, {
    update: (cache) => {
      evictField(cache, 'getScimConfig');
    },
  });

  const onSave = async (values: ScimDomainFormFields) => {
    const { domain } = values;
    await insert({
      variables: {
        domain,
      },
    });
  };

  return (
    <ModalForm
      i18n={t('authenticationSettings')}
      defaultValues={defaultValues}
      schema={ScimDomainFormSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={'scim-domain-form'}
      visible={true}
    >
      <ScimDomainForm />
    </ModalForm>
  );
};

export default ScimDomainModal;
