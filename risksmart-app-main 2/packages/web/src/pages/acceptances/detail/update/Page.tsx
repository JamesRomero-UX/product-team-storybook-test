import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import {
  useGetGuidParam,
  useGetOptionalGuidParam,
} from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { Permission } from 'src/rbac/Permission';

import { useDeleteAcceptances } from '@/hooks/mutations/acceptance';
import { useGetAcceptanceById } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import {
  acceptanceDetailUrl,
  acceptanceRegisterUrl,
  riskDetailsUrl,
} from '@/utils/urls';

import PageLayout from '../../../../layouts/PageLayout';

const Page = () => {
  const parentId = useGetOptionalGuidParam('riskId');
  const acceptanceId = useGetGuidParam('acceptanceId');
  const navigate = useNavigate();
  const { deleteAcceptances, loading: deleteLoading } = useDeleteAcceptances();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const tabs = useTabs({
    parentType: Parent_Type_Enum.Acceptance,
    parent: null,
    hrefRoot: acceptanceDetailUrl(acceptanceId),
  });
  const { t: st } = useTranslation(['common'], { keyPrefix: 'acceptances' });
  const { data } = useGetAcceptanceById({
    queryArgs: { acceptanceId },
  });
  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!acceptanceId) {
        return false;
      }
      await deleteAcceptances([acceptanceId]);
      setIsDeleted(true);
      if (parentId) {
        navigate(riskDetailsUrl(parentId));
      } else {
        navigate(acceptanceRegisterUrl());
      }

      return true;
    },
  });
  const fallbackTitle = st('fallback_title');

  if (isDeleted) {
    return <></>;
  }
  if (data?.acceptance.length === 0) {
    throw new PageNotFound(`Acceptance with id ${acceptanceId} not found`);
  }
  const acceptance = data?.acceptance[0];
  const counter =
    acceptance &&
    `(${getFriendlyId(Parent_Type_Enum.Acceptance, acceptance?.SequentialId)})`;

  return (
    <PageLayout
      helpTranslationKey={'acceptances.help'}
      title={acceptance?.Title}
      meta={{ title: fallbackTitle }}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Permission
            permission={'delete:acceptance'}
            parentObject={acceptance}
          >
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {st('delete_button')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <ControlledTabs
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Acceptance}
        parent={acceptance}
      />
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_single_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
