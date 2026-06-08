import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteImpactDocument,
  GetImpactByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';
import { impactDetailsUrl } from '@/utils/urls';

type Props = {
  activeTabId: 'details' | 'ratings';
};

const Page: FC<Props> = ({ activeTabId }) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const impactId = useGetGuidParam('impactId');
  const navigate = useNavigate();
  const { t: st } = useTranslation(['common'], { keyPrefix: 'impacts' });
  const defaultTitle = st('fallback_title');
  const [deleteImpact, deleteResult] = useMutation(DeleteImpactDocument, {
    update: (cache) => {
      evictField(cache, 'impact');
      evictField(cache, 'impact_rating');
      evictField(cache, 'impact_aggregate');
      evictField(cache, 'impact_rating_aggregate');
    },
  });
  const { data, error } = useQuery(GetImpactByIdDocument, {
    variables: {
      id: impactId,
    },
  });
  if (error) {
    throw error;
  }
  const impact = data?.impact?.[0];
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Impact,
    parent: impact,
    hrefRoot: impactDetailsUrl(impactId),
  });
  const parentPath = useGetDetailParentPath(impactId);
  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteImpact({
        variables: {
          Id: impactId,
        },
      });
      setIsDeleteModalVisible(false);
      navigate(parentPath);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  if (data?.impact.length === 0) {
    throw new PageNotFound(`Impact with id ${impactId} not found`);
  }
  const counter =
    impact &&
    `(${getFriendlyId(Parent_Type_Enum.Impact, impact.SequentialId)})`;

  return (
    <PageLayout
      title={impact?.Name ?? defaultTitle}
      meta={{
        title: defaultTitle,
      }}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Permission permission={'delete:impact'} parentObject={impact}>
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
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Impact}
        parent={impact}
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
    </PageLayout>
  );
};

export default Page;
