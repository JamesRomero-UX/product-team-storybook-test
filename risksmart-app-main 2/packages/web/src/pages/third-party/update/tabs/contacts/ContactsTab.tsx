import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import { RevokeThirdPartyContactAccessDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TabHeader from 'src/components/tab-header';
import { useGetThirdPartyContacts } from 'src/hooks/queries/third-party/useGetThirdPartyContacts';

import { evictField } from '@/utils/graphqlUtils';

import { useGetContactsTableProps } from './config';
import { AddContactModal } from './modals/AddContactModal';
import RevokeContactsModal from './modals/RevokeContactsModal';
import { ViewContactModal } from './modals/ViewContactModal';
import type {
  ThirdPartyContactFields,
  ThirdPartyContactWithStatus,
} from './types';
import { useContactsWithStatus } from './useContactsWithStatus';
import { useRevokeContacts } from './useRevokeContacts';

const ContactsTab = () => {
  const thirdPartyId = useGetGuidParam('id');
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts',
  });
  const { addNotification } = useNotifications();

  // State for modals
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<ThirdPartyContactWithStatus | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  // State for multiselect
  const [selectedContacts, setSelectedContacts] = useState<
    ThirdPartyContactWithStatus[]
  >([]);

  // Revoke mutation
  const [revokeContacts, { loading: isRevoking }] = useMutation(
    RevokeThirdPartyContactAccessDocument,
    {
      update: (cache) => {
        evictField(cache, 'third_party_contact');
      },
    }
  );

  // Query contacts using wrapper hook (handles tRPC/GraphQL switching)
  const {
    data: contactsResult,
    loading: contactsLoading,
    refetch: refetchContacts,
  } = useGetThirdPartyContacts({
    queryArgs: { thirdPartyId, includeRevoked: true },
  });

  const contactsData =
    (contactsResult?.third_party_contact as ThirdPartyContactFields[]) ?? [];

  // Map contacts with status based on user's LastSeen
  const contacts = useContactsWithStatus(contactsData);

  const handleViewContact = useCallback(
    (contact: ThirdPartyContactWithStatus) => {
      setSelectedContact(contact);
    },
    []
  );

  const tableProps = useGetContactsTableProps(contacts, handleViewContact);
  const loading = contactsLoading;

  const handleAddSuccess = useCallback(() => {
    setIsAddModalVisible(false);
    refetchContacts();
  }, [refetchContacts]);

  const { revocableContacts, handleRevokeAccess } = useRevokeContacts({
    selectedContacts,
    revokeContacts,
    addNotification,
    refetchContacts,
    onSuccess: () => setSelectedContacts([]),
  });

  return (
    <div>
      <Table
        {...tableProps}
        trackBy={'Id'}
        header={
          <TabHeader
            actions={
              <SpaceBetween direction={'horizontal'} size={'xs'}>
                <Button
                  formAction={'none'}
                  variant={'normal'}
                  disabled={!revocableContacts.length || isRevoking}
                  onClick={() => setShowRevokeConfirm(true)}
                >
                  {t('revoke_access_button')}
                </Button>
                <Button
                  variant={'primary'}
                  onClick={() => setIsAddModalVisible(true)}
                >
                  {t('create_new_button')}
                </Button>
              </SpaceBetween>
            }
          >
            {t('register_title')}
          </TabHeader>
        }
        loading={loading}
        variant={'embedded'}
        selectionType={'multi'}
        selectedItems={selectedContacts}
        onSelectionChange={({ detail }) => {
          setSelectedContacts(detail.selectedItems);
        }}
      />
      <AddContactModal
        thirdPartyId={thirdPartyId}
        isVisible={isAddModalVisible}
        onDismiss={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
      {selectedContact && (
        <ViewContactModal
          contact={selectedContact}
          onDismiss={() => setSelectedContact(null)}
        />
      )}
      <RevokeContactsModal
        isVisible={showRevokeConfirm}
        loading={isRevoking}
        onRevoke={handleRevokeAccess}
        onDismiss={() => setShowRevokeConfirm(false)}
      />
    </div>
  );
};

export default ContactsTab;
