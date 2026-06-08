import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteEnterpriseRiskDocument,
  namedOperations,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import InstantiateEnterpriseRiskModal from 'src/components/instantiate-enterprise-risk-modal/InstantiateEnterpriseRiskModal';
import { useGetEnterpriseRiskById } from 'src/hooks/queries/enterprise-risk/useGetEnterpriseRiskById';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';
import { enterpriseRiskDetailsUrl } from '@/utils/urls';

type Props = {
  selectedTabId: 'details' | 'risks';
  showDeleteButton?: boolean;
};

const Page: FC<Props> = ({ selectedTabId, showDeleteButton }) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [showInstantiateModal, setShowInstantiateModal] = useState(false);
  const navigate = useNavigate();
  const enterpriseRiskId = useGetGuidParam('id');
  const parentUrl = useGetDetailParentPath(enterpriseRiskId);
  const [mutate, deleteResult] = useMutation(DeleteEnterpriseRiskDocument, {
    update: (cache) => {
      evictField(cache, 'enterprise_risk');
    },
    refetchQueries: [
      namedOperations.Query.getEnterpriseRiskById,
      namedOperations.Query.getEnterpriseRisks,
    ],
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'enterpriseRisks',
  });
  const { data, loading } = useGetEnterpriseRiskById({
    queryArgs: { id: enterpriseRiskId },
  });

  const enterpriseRisk = data?.enterprise_risk[0];

  const tabs = useTabs({
    parentType: Parent_Type_Enum.EnterpriseRisk,
    parent: null,
    hrefRoot: enterpriseRiskDetailsUrl(enterpriseRiskId),
  });

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!enterpriseRisk) {
        return false;
      }
      await mutate({
        variables: {
          Id: enterpriseRisk.Id,
        },
      });
      await navigate(parentUrl);

      return true;
    },
  });

  if (deleteResult.data?.deleteChildEnterpriseRisk?.affected_rows === 1) {
    return <></>;
  }

  if (data?.enterprise_risk.length === 0) {
    throw new PageNotFound(
      `Enterprise risk with id ${enterpriseRiskId} not found`
    );
  }

  const counter =
    enterpriseRisk &&
    `(${getFriendlyId(Parent_Type_Enum.EnterpriseRisk, enterpriseRisk.SequentialId)})`;

  const fallbackTitle = st('fallback_title');
  // Check if the enterprise risk has child enterprise risks, which would prevent deletion
  const hasChildren = !!enterpriseRisk?.children?.length;

  return (
    <PageLayout
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          {!loading && !hasChildren && showDeleteButton && (
            <Permission permission={'delete:enterprise_risk'}>
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
          )}
          <Permission permission={'update:enterprise_risk'}>
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setShowInstantiateModal(true);
              }}
            >
              {st('instantiateButton')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
      meta={{
        title: fallbackTitle,
      }}
      title={enterpriseRisk?.Title}
      counter={counter}
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={selectedTabId}
        variant={'container'}
        parentType={Parent_Type_Enum.EnterpriseRisk}
      />

      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>

      <InstantiateEnterpriseRiskModal
        isVisible={showInstantiateModal}
        onDismiss={() => {
          setShowInstantiateModal(false);
        }}
        enterpriseRiskIds={[enterpriseRiskId]}
      />
    </PageLayout>
  );
};

export default Page;
