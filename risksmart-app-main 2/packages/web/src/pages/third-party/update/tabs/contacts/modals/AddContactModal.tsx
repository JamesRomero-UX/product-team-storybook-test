import { useMutation } from '@apollo/client';
import { InsertThirdPartyContactApiDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { evictField } from '@/utils/graphqlUtils';

import { AddContactForm } from './AddContactForm';
import type { AddContactSchemaFields } from './schema';
import { addContactDefaultValues, AddContactSchema } from './schema';

interface Props {
  thirdPartyId: string;
  isVisible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export const AddContactModal: FC<Props> = ({
  thirdPartyId,
  isVisible,
  onDismiss,
  onSuccess,
}) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts',
  });

  const [mutate] = useMutation(InsertThirdPartyContactApiDocument, {
    update: (cache) => {
      evictField(cache, 'third_party_contact');
    },
  });

  const onSave = async (values: AddContactSchemaFields) => {
    await mutate({
      variables: {
        ...values,
        ThirdPartyId: thirdPartyId,
      },
    });
    onSuccess();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <ModalForm<AddContactSchemaFields>
      defaultValues={addContactDefaultValues}
      i18n={{ entity_name: t('entity_name') }}
      schema={AddContactSchema}
      onSave={onSave}
      onDismiss={() => onDismiss()}
      formId={'add-contact-form'}
      visible={isVisible}
      readOnly={false}
    >
      <AddContactForm />
    </ModalForm>
  );
};
