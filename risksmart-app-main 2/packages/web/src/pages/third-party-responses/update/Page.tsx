import { useMutation, useSubscription } from '@apollo/client';
import { JsonForms } from '@jsonforms/react';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { rendererRegistry } from '@risksmart-app/components/src/form-builder/renderers/registry';
import { useFormBuilderStore } from '@risksmart-app/components/src/form-builder/store/useFormBuilderStore';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Loading from '@risksmart-app/components/src/loading';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { getIsActionAllowed } from '@risksmart-app/shared/third-party/responses/responseUtils';
import {
  GetThirdPartyResponseSubscriptionByIdDocument,
  Third_Party_Response_Enum_Action,
  Third_Party_Response_Status_Enum,
  UpdateThirdPartyResponseStatusDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ActionsButton from 'src/components/actions-button';
import type { ActionItem } from 'src/components/actions-button/ActionsButton';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useGetThirdPartyById } from 'src/hooks/queries/third-party/useGetThirdPartyById';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import { useShallow } from 'zustand/react/shallow';

import type { UpdateStatusSchemaFields } from '../../third-party/update/tabs/questionnaires/modals/schema';
import { RequestTypeOptions } from '../../third-party/update/tabs/questionnaires/modals/schema';
import { UpdateStatusModal } from '../../third-party/update/tabs/questionnaires/modals/UpdateStatusModal';
import type { ThirdPartyResponseRegisterFields } from '../../third-party/update/tabs/questionnaires/types';

const Page: FC = () => {
  const Id = useGetGuidParam('responseId');
  const navigate = useNavigate();
  const { t: rt } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_invite',
  });

  const [isDisabled, setIsDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [action, setAction] = useState<Third_Party_Response_Enum_Action>(
    Third_Party_Response_Enum_Action.RequestMoreInformation
  );
  const [actions, setActions] = useState<ActionItem[]>([]);

  const thirdPartyId = useGetGuidParam('id');
  const { getByValue } = useRating('third_party_response_status');
  const { data: parent } = useGetThirdPartyById({
    queryArgs: { thirdPartyId },
  });
  const { data, loading } = useSubscription(
    GetThirdPartyResponseSubscriptionByIdDocument,
    {
      variables: { Id },
    }
  );
  const { setIsFormCustomisable } = useFormBuilderStore(
    useShallow((state) => ({
      setIsFormCustomisable: state.setIsFormCustomisable,
    }))
  );

  useEffect(() => {
    setIsFormCustomisable(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const status = data?.third_party_response_by_pk?.Status;
    const isDisabled =
      status !== Third_Party_Response_Status_Enum.AwaitingReview;

    setIsDisabled(isDisabled);

    setActions([
      {
        text: rt('actions.recall'),
        id: 'recall',
        disabled: !getIsActionAllowed(
          Third_Party_Response_Enum_Action.Recall,
          status
        ),
        onItemClick: () => {
          setAction(Third_Party_Response_Enum_Action.Recall);
          setIsModalVisible(true);
        },
      },
      {
        text: rt('actions.reject'),
        id: 'reject',
        disabled: !getIsActionAllowed(
          Third_Party_Response_Enum_Action.Reject,
          status
        ),
        onItemClick: () => {
          setAction(Third_Party_Response_Enum_Action.Reject);
          setIsModalVisible(true);
        },
      },
      {
        text: rt('actions.moreInformation'),
        id: 'moreInformation',
        disabled: !getIsActionAllowed(
          Third_Party_Response_Enum_Action.RequestMoreInformation,
          status
        ),
        onItemClick: () => {
          setAction(Third_Party_Response_Enum_Action.RequestMoreInformation);
          setIsModalVisible(true);
        },
      },
    ]);
  }, [data, rt]);

  const { Title } =
    data?.third_party_response_by_pk?.questionnaireTemplateVersion?.parent ||
    {};

  const { Schema, UISchema } =
    data?.third_party_response_by_pk?.questionnaireTemplateVersion || {};

  const [handleUpdateStatus, { loading: handleUpdateStatusLoading }] =
    useMutation(UpdateThirdPartyResponseStatusDocument);

  const onUpdateStatus = async (data: UpdateStatusSchemaFields) => {
    await handleUpdateStatus({
      variables: {
        Action: action,
        ResponseIds: [Id],
        Reason: data.Reason,
        RequestType: data.RequestType
          ? RequestTypeOptions[data.RequestType]
          : '',
        ShareWithRespondents: data.ShareWithRespondents,
        ThirdPartyId: thirdPartyId,
      },
    });
  };

  const onApprove = () => {
    setAction(Third_Party_Response_Enum_Action.Approve);
    setIsModalVisible(true);
  };

  if (loading) {
    return (
      <PageLayout title={Title}>
        <Loading />
      </PageLayout>
    );
  }

  const selectedItems: ThirdPartyResponseRegisterFields[] =
    !data?.third_party_response_by_pk
      ? []
      : ([
          { Id, ...data.third_party_response_by_pk },
        ] as unknown as ThirdPartyResponseRegisterFields[]);

  const jsonFormsData = {
    ...data?.third_party_response_by_pk?.ResponseData,
    files: data?.third_party_response_by_pk?.files,
  };

  return (
    <PageLayout title={Title}>
      <Container>
        <SpaceBetween size={'m'} direction={'vertical'}>
          <SpaceBetween size={'s'} direction={'horizontal'}>
            <Header variant={'h2'}>{'Status:'}</Header>
            <div className={'flex h-full items-center justify-center'}>
              <SimpleRatingBadge
                rating={getByValue(data?.third_party_response_by_pk?.Status)}
              />
            </div>
          </SpaceBetween>
          <JsonForms
            schema={Schema}
            uischema={UISchema}
            data={jsonFormsData}
            renderers={rendererRegistry}
            readonly={true}
          />
          <SpaceBetween size={'s'} direction={'horizontal'}>
            <Permission
              permission={'update:questionnaire_template_version'}
              parentObject={parent?.third_party || null}
              canHaveAccessAsContributor={true}
            >
              <SpaceBetween size={'s'} direction={'horizontal'}>
                <Button
                  disabled={isDisabled}
                  variant={'primary'}
                  onClick={onApprove}
                >
                  {rt('actions.approve')}
                </Button>
                <ActionsButton
                  disabled={actions.every((action) => action.disabled)}
                  buttonText={rt('actions.moreActions')}
                  items={actions}
                />
              </SpaceBetween>
            </Permission>
            <Button
              disabled={false}
              variant={'normal'}
              onClick={() => {
                navigate(-1);
              }}
            >
              {'Cancel'}
            </Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
      <UpdateStatusModal
        onDismiss={() => setIsModalVisible(false)}
        onUpdateStatus={onUpdateStatus}
        action={action}
        loading={handleUpdateStatusLoading}
        isVisible={isModalVisible}
        selectedItems={selectedItems}
      />
    </PageLayout>
  );
};

export default Page;
