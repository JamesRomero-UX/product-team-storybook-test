import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Box from '@risk-smart/themed-cloudscape-components/box';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateClientResponse } from 'src/providers/ExternalApiProvider';
import { useExternalApi } from 'src/providers/ExternalApiProvider';

import ApiClientForm from '../forms/ApiClientForm';

interface Props {
  onDismiss: () => void;
}

const CreateClientModal: FC<Props> = ({ onDismiss }) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'externalApi.create_modal',
  });
  const { createClient, allowedScopes } = useExternalApi();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    scopes: [] as string[],
  });
  const [createdCredentials, setCreatedCredentials] =
    useState<CreateClientResponse | null>(null);

  // Function to expand wildcard scopes into individual scopes
  const expandWildcardScopes = (scopes: string[]): string[] => {
    const hasReadWildcard = scopes.includes('*:read');
    const hasWriteWildcard = scopes.includes('*:write');

    // If no wildcards, return as is
    if (!hasReadWildcard && !hasWriteWildcard) {
      return scopes;
    }

    // Start with non-wildcard scopes
    const expandedScopes = scopes.filter(
      (scope) => scope !== '*:read' && scope !== '*:write'
    );

    // Expand *:read to all :read scopes
    if (hasReadWildcard) {
      const readScopes = allowedScopes
        .filter((scope) => scope.name.endsWith(':read'))
        .map((scope) => scope.name);
      expandedScopes.push(...readScopes);
    }

    // Expand *:write to all :write scopes
    if (hasWriteWildcard) {
      const writeScopes = allowedScopes
        .filter((scope) => scope.name.endsWith(':write'))
        .map((scope) => scope.name);
      expandedScopes.push(...writeScopes);
    }

    // Return unique scopes
    return Array.from(new Set(expandedScopes));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.name) {
        return;
      }

      if (formData.scopes.length === 0) {
        addNotification({
          type: 'error',
          content: t('error_scopes_required'),
        });

        return;
      }

      // Expand wildcard scopes before submitting
      const expandedScopes = expandWildcardScopes(formData.scopes);

      const response = await createClient(formData.name, expandedScopes);

      // Instead of closing, show the credentials
      setCreatedCredentials(response);

      addNotification({
        type: 'success',
        content: t('success_message'),
      });
    } catch (error) {
      addNotification({
        type: 'error',
        content: error instanceof Error ? error.message : t('error_message'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Show credentials view after successful creation
  if (createdCredentials) {
    return (
      <Modal
        visible
        onDismiss={onDismiss}
        header={t('credentials_created_title')}
        size={'medium'}
        footer={
          <Box float={'right'}>
            <Button variant={'primary'} onClick={onDismiss}>
              {t('close_button')}
            </Button>
          </Box>
        }
      >
        <SpaceBetween size={'l'}>
          <Alert type={'warning'} header={t('secret_warning_title')}>
            {t('secret_warning_message')}
          </Alert>

          <FormField label={t('credential_name_label')} stretch>
            <Input value={createdCredentials.clientName} readOnly />
          </FormField>

          <FormField label={t('client_key_label')} stretch>
            <Input value={createdCredentials.clientKey} readOnly />
          </FormField>

          <FormField label={t('client_secret_label')} stretch>
            <Input
              value={createdCredentials.clientSecret}
              readOnly
              type={'text'}
            />
          </FormField>
        </SpaceBetween>
      </Modal>
    );
  }

  // Show form view
  return (
    <Modal
      visible
      onDismiss={onDismiss}
      header={t('title')}
      size={'medium'}
      footer={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button variant={'link'} onClick={onDismiss}>
            {t('cancel_button')}
          </Button>
          <Button
            variant={'primary'}
            onClick={handleSubmit}
            loading={loading}
            disabled={!formData.name || formData.scopes.length === 0}
          >
            {t('submit_button')}
          </Button>
        </SpaceBetween>
      }
    >
      <ApiClientForm formData={formData} onChange={setFormData} />
    </Modal>
  );
};

export default CreateClientModal;
