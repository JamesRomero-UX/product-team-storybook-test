import { useMutation } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import CopyToClipboard from '@risk-smart/themed-cloudscape-components/copy-to-clipboard';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import Button from '@risksmart-app/components/src/button';
import type { InsertScimTokenMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertScimTokenDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import { evictField } from '@/utils/graphqlUtils';

import ScimTokenForm from './forms/ScimTokenForm';
import type { ScimTokenFormFields } from './forms/ScimTokenFormSchema';
import {
  defaultValues,
  ScimTokenFormSchema,
} from './forms/ScimTokenFormSchema';

type Props = {
  onDismiss: (saved: boolean) => void;
  onClose: () => void;
};

type TokenResponse = Omit<
  InsertScimTokenMutation['insert_scim_token'],
  '__typename'
>;

const ScimTokenModal: FC<Props> = ({ onDismiss, onClose }) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings',
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimTokens.fields',
  });
  const [tokenResponse, setTokenResponse] = useState<TokenResponse>();

  const [insert] = useMutation(InsertScimTokenDocument, {
    update: (cache) => {
      evictField(cache, 'getScimConfig');
    },
  });

  const onSave = async (values: ScimTokenFormFields) => {
    const { expireInMonths } = values;
    const result = await insert({
      variables: {
        expireInMonths,
      },
    });
    if (result.data?.insert_scim_token) {
      setTokenResponse(result.data.insert_scim_token);
    }
  };

  return (
    <>
      {!tokenResponse && (
        <ModalForm
          i18n={t('scimTokens')}
          defaultValues={defaultValues}
          schema={ScimTokenFormSchema}
          onSave={onSave}
          onDismiss={onDismiss}
          formId={'scim-token-form'}
          visible={true}
        >
          {!tokenResponse && <ScimTokenForm />}
        </ModalForm>
      )}
      {tokenResponse && (
        <Modal
          header={t('scimTokens.entity_name')}
          visible={true}
          onDismiss={onClose}
          footer={
            <div className={'flex gap-2'}>
              <Button onClick={onClose}>{'Close'}</Button>
            </div>
          }
        >
          <div className={'flex flex-col gap-5'}>
            <div>
              <strong>{st('keyId')}</strong>
              {tokenResponse.keyId}
            </div>
            <div>
              <strong>{st('created')}</strong>
              {new Date(tokenResponse.createdOn).toLocaleString()}
            </div>
            <div>
              <strong>{st('expires')}</strong>
              {new Date(tokenResponse.expiresOn).toLocaleString()}
            </div>
            <div>
              <strong>{st('status')}</strong>
              {tokenResponse.status}
            </div>
            <div>
              <strong>{st('token')}</strong>
            </div>
            <div>
              <Alert type={'info'}>{t('scimTokens.tokenCopyWarning')}</Alert>
            </div>
            <div>
              <Textarea value={tokenResponse.token} readOnly />
            </div>
            <div>
              <CopyToClipboard
                copyButtonText={t('scimTokens.copyToClipboardButtonText')}
                textToCopy={tokenResponse.token}
                copySuccessText={t('scimTokens.copyToClipboardSuccessMessage')}
                copyErrorText={t('scimTokens.copyToClipboardErrorMessage')}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ScimTokenModal;
