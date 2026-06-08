import { useMutation, useQuery } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risk-smart/themed-cloudscape-components/table';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  DeleteScimDomainDocument,
  DeleteScimTokenDocument,
  GetScimConfigDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import TabHeader from 'src/components/tab-header';
import { Permission } from 'src/rbac/Permission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import type { ScimDomainFields, ScimTokenFields } from './config';
import {
  useGetScimDomainTableProps,
  useGetScimTokenTableProps,
} from './config';
import ScimDomainModal from './ScimDomainModal';
import ScimTokenModal from './ScimTokenModal';

export const ScimConfig = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings',
  });
  const { addNotification } = useNotifications();
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [isDeleteDomainModalVisible, setIsDeleteDomainModalVisible] =
    useState(false);
  const [selectedDomain, setSelectedDomain] = useState<null | ScimDomainFields>(
    null
  );
  const [isDeleteTokenModalVisible, setIsDeleteTokenModalVisible] =
    useState(false);
  const [selectedToken, setSelectedToken] = useState<null | ScimTokenFields>(
    null
  );

  const { data, loading, refetch } = useQuery(GetScimConfigDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });
  const domains = (data?.getScimConfig.domains ?? []).map((domain) => ({
    Domain: domain.domain,
    CreatedOn: domain.createdOn,
  }));
  const tokens = data?.getScimConfig.tokens ?? [];
  const hasActiveTokens = tokens.some((token) => token.status === 'active');
  const legacyTokens = data?.getScimConfig.legacyTokens;

  const scimDomainTableProps = useGetScimDomainTableProps(domains);
  const scimTokenTableProps = useGetScimTokenTableProps(tokens);

  const [deleteDomain, deleteDomainResult] = useMutation(
    DeleteScimDomainDocument,
    {
      update: (cache) => {
        evictField(cache, 'getScimConfig');
      },
    }
  );

  const [deleteToken, deleteTokenResult] = useMutation(
    DeleteScimTokenDocument,
    {
      update: (cache) => {
        evictField(cache, 'getScimConfig');
      },
    }
  );

  const onDeleteDomain = useDeleteResultNotification({
    entityName: t('scimDomains.entityName'),
    asyncAction: async () => {
      if (!selectedDomain) {
        throw new Error('Missing domain');
      }
      await deleteDomain({
        variables: {
          domain: selectedDomain.Domain,
        },
      });
      setSelectedDomain(null);
      setIsDeleteDomainModalVisible(false);
      refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteDomainModalVisible(false);
    },
  });

  const onDeleteToken = useDeleteResultNotification({
    entityName: t('scimTokens.entityName'),
    asyncAction: async () => {
      if (!selectedToken) {
        throw new Error('Missing domain');
      }
      await deleteToken({
        variables: {
          keyId: selectedToken.keyId,
        },
      });
      setSelectedToken(null);
      setIsDeleteTokenModalVisible(false);
      refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteTokenModalVisible(false);
    },
  });

  const handleAddDomainModalClose = () => {
    setIsAddDomainModalOpen(false);
    refetch();
  };

  const handleAddTokenModalClose = (saved: boolean) => {
    if (!saved) {
      setIsAddTokenModalOpen(false);
    }
    refetch();
  };

  const handleTokenResponseModalClose = () => {
    setIsAddTokenModalOpen(false);
    refetch();
  };

  return (
    <>
      <Table
        {...scimDomainTableProps}
        {...(domains.length < 5
          ? { pagination: undefined, filter: undefined, preferences: undefined }
          : {})}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    formAction={'none'}
                    variant={'normal'}
                    disabled={!selectedDomain}
                    onClick={() => setIsDeleteDomainModalVisible(true)}
                  >
                    {t('scimDomains.deleteButton')}
                  </Button>
                  <Button
                    formAction={'none'}
                    variant={'primary'}
                    disabled={loading}
                    onClick={() => setIsAddDomainModalOpen(true)}
                  >
                    {t('scimDomains.addButton')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('scimDomains.header')}
            </TabHeader>
          </SpaceBetween>
        }
        empty={
          <EmptyEntityCollection
            entityLabel={t('scimDomains.entity_name')}
            action={
              <Permission permission={'insert:scim_configuration'}>
                <Button
                  formAction={'none'}
                  disabled={loading}
                  onClick={() => setIsAddDomainModalOpen(true)}
                >
                  {t('scimDomains.addButton')}
                </Button>
              </Permission>
            }
          />
        }
        variant={'container'}
        trackBy={'Domain'}
        loading={loading}
        selectionType={'single'}
        selectedItems={selectedDomain ? [selectedDomain] : []}
        onSelectionChange={({ detail }) => {
          setSelectedDomain(detail.selectedItems[0]);
        }}
      />
      {isAddDomainModalOpen && (
        <ScimDomainModal onDismiss={handleAddDomainModalClose} />
      )}
      <DeleteModal
        header={t('scimDomains.deleteModalHeader')}
        loading={deleteDomainResult.loading}
        isVisible={isDeleteDomainModalVisible}
        onDelete={onDeleteDomain}
        onDismiss={() => {
          refetch();
          setSelectedDomain(null);
          setIsDeleteDomainModalVisible(false);
        }}
      >
        {t('scimDomains.confirmDeleteMessage')}
      </DeleteModal>
      <Table
        {...scimTokenTableProps}
        {...(tokens.length < 5
          ? { pagination: undefined, filter: undefined, preferences: undefined }
          : {})}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    formAction={'none'}
                    variant={'normal'}
                    disabled={!selectedToken}
                    onClick={() => setIsDeleteTokenModalVisible(true)}
                  >
                    {t('scimTokens.deleteButton')}
                  </Button>
                  <Button
                    formAction={'none'}
                    variant={'primary'}
                    disabled={hasActiveTokens || loading}
                    onClick={() => setIsAddTokenModalOpen(true)}
                  >
                    {t('scimTokens.addButton')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('scimTokens.header')}
            </TabHeader>
          </SpaceBetween>
        }
        empty={
          legacyTokens && !tokens.length ? (
            <Alert type={'warning'}>{t('scimTokens.legacyTokenWarning')}</Alert>
          ) : (
            <EmptyEntityCollection
              entityLabel={t('scimTokens.entity_name')}
              action={
                <Permission permission={'insert:scim_configuration'}>
                  <Button
                    formAction={'none'}
                    disabled={loading}
                    onClick={() => setIsAddTokenModalOpen(true)}
                  >
                    {t('scimTokens.addButton')}
                  </Button>
                </Permission>
              }
            />
          )
        }
        variant={'container'}
        trackBy={'keyId'}
        loading={loading}
        selectionType={'single'}
        selectedItems={selectedToken ? [selectedToken] : []}
        onSelectionChange={({ detail }) => {
          setSelectedToken(detail.selectedItems[0]);
        }}
      />
      {isAddTokenModalOpen && (
        <ScimTokenModal
          onDismiss={handleAddTokenModalClose}
          onClose={handleTokenResponseModalClose}
        />
      )}
      <DeleteModal
        header={t('scimTokens.deleteModalHeader')}
        loading={deleteTokenResult.loading}
        isVisible={isDeleteTokenModalVisible}
        onDelete={onDeleteToken}
        onDismiss={() => {
          refetch();
          setSelectedToken(null);
          setIsDeleteTokenModalVisible(false);
        }}
      >
        {t('scimTokens.confirmDeleteMessage')}
      </DeleteModal>
    </>
  );
};
