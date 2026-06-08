import { useMutation, useSubscription } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import {
  GetThirdPartyResponsesByThirdPartyDocument,
  Third_Party_Response_Enum_Action,
  UpdateThirdPartyResponseStatusDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ActionsButton from 'src/components/actions-button';
import TabHeader from 'src/components/tab-header';

import { useGetCollectionTableProps } from './config';
import type { UpdateStatusSchemaFields } from './modals/schema';
import { RequestTypeOptions } from './modals/schema';
import { UpdateStatusModal } from './modals/UpdateStatusModal';
import type { ThirdPartyResponseRegisterFields } from './types';

const QuestionnairesTab = () => {
  const thirdPartyId = useGetGuidParam('id');

  const { data, loading } = useSubscription(
    GetThirdPartyResponsesByThirdPartyDocument,
    {
      variables: { ThirdPartyId: thirdPartyId },
    }
  );

  const tableProps = useGetCollectionTableProps(
    data?.third_party_response,
    thirdPartyId
  );
  const { t } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_invite',
  });

  const [selectedItems, setSelectedItems] = useState<
    ThirdPartyResponseRegisterFields[]
  >([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [action, setAction] = useState<Third_Party_Response_Enum_Action>(
    Third_Party_Response_Enum_Action.RequestMoreInformation
  );

  const [handleUpdateStatus, { loading: handleUpdateStatusLoading }] =
    useMutation(UpdateThirdPartyResponseStatusDocument);

  const navigate = useNavigate();

  const onUpdateStatus = async (data: UpdateStatusSchemaFields) => {
    await handleUpdateStatus({
      variables: {
        Action: action,
        ResponseIds: selectedItems.map((item) => item.Id),
        Reason: data.Reason,
        RequestType: data?.RequestType
          ? RequestTypeOptions[data.RequestType]
          : '',
        ShareWithRespondents: data.ShareWithRespondents,
        ThirdPartyId: thirdPartyId,
      },
    });
  };

  const actions = [
    {
      text: t('actions.recall'),
      id: 'recall',
      onItemClick: () => {
        setAction(Third_Party_Response_Enum_Action.Recall);
        setIsModalVisible(true);
      },
    },
    {
      text: t('actions.reject'),
      id: 'reject',
      onItemClick: () => {
        setAction(Third_Party_Response_Enum_Action.Reject);
        setIsModalVisible(true);
      },
    },
    {
      text: t('actions.moreInformation'),
      id: 'moreInformation',
      onItemClick: () => {
        setAction(Third_Party_Response_Enum_Action.RequestMoreInformation);
        setIsModalVisible(true);
      },
    },
  ];

  return (
    <div>
      <Table
        {...tableProps}
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => {
          setSelectedItems(detail.selectedItems);
        }}
        trackBy={'Id'}
        selectionType={'multi'}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <ActionsButton
                    buttonText={t('actions.moreActions')}
                    items={actions}
                    disabled={!selectedItems.length}
                  />
                  <Button
                    variant={'primary'}
                    onClick={() => navigate('invite')}
                  >
                    {t('actions.plan')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('register_title')}
            </TabHeader>
          </SpaceBetween>
        }
        loading={loading}
        variant={'embedded'}
      />
      <UpdateStatusModal
        onDismiss={() => setIsModalVisible(false)}
        onUpdateStatus={onUpdateStatus}
        action={action}
        loading={handleUpdateStatusLoading}
        isVisible={isModalVisible}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
    </div>
  );
};

export default QuestionnairesTab;
