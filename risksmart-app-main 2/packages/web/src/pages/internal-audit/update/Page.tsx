import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { IssueTaxonomyKeys } from '@risksmart-app/shared/forms/issues/types';
import {
  DeleteInternalAuditsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import {
  useGetInternalAuditById,
  useGetInternalAuditEntitiesRegister,
} from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';
import { internalAuditDetailsUrl } from '@/utils/urls';

type Props = {
  activeTabId: 'actions' | 'details' | 'reports' | 'risks' | IssueTaxonomyKeys;
};

const Page: FC<Props> = ({ activeTabId }) => {
  const internalAuditId = useGetGuidParam('internalAuditId');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const parentUrl = useGetDetailParentPath(internalAuditId);
  const [mutate, deleteResult] = useMutation(DeleteInternalAuditsDocument, {
    update: (cache) => {
      evictField(cache, 'internal_audit_entity');
      evictField(cache, 'internal_audit_entity_aggregate');
    },
    fetchPolicy: 'no-cache',
  });

  const { t: st } = useTranslation(['common'], { keyPrefix: 'internalAudits' });
  const { refetch: refetchInternalAuditsRegister } =
    useGetInternalAuditEntitiesRegister({ queryArgs: {} });

  const {
    data,
    error,
    loading,
    refetch: refetchInternalAudit,
  } = useGetInternalAuditById({ queryArgs: { internalAuditId } });

  if (error) {
    throw error;
  }

  const internalAudit = data?.internal_audit_entity[0];
  const tabs = useTabs({
    parentType: Parent_Type_Enum.InternalAuditEntity,
    parent: internalAudit,
    hrefRoot: internalAuditDetailsUrl(internalAuditId),
  });
  const onDelete = useDeleteResultNotification({
    entityName: st('entity'),
    asyncAction: async () => {
      if (!internalAudit) {
        return false;
      }
      await mutate({
        variables: {
          Ids: [internalAudit.Id],
        },
      });
      refetchInternalAudit();
      refetchInternalAuditsRegister();
      await navigate(parentUrl);

      return true;
    },
  });

  if (deleteResult.data?.delete_internal_audit_entity?.affected_rows === 1) {
    return <></>;
  }

  if (!loading && !internalAudit?.Id) {
    throw new PageNotFound(
      `Internal audit with id ${internalAuditId} not found`
    );
  }

  const counter =
    internalAudit &&
    `(${getFriendlyId(
      Parent_Type_Enum.InternalAuditEntity,
      internalAudit.SequentialId
    )})`;
  const fallbackTitle = st('fallback_title');

  return (
    <PageLayout
      actions={
        <Permission
          permission={'delete:internal_audit_entity'}
          parentObject={internalAudit}
        >
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {st('delete_button')}
            </Button>
          </SpaceBetween>
        </Permission>
      }
      meta={{
        title: fallbackTitle,
      }}
      title={internalAudit?.Title}
      counter={counter}
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={activeTabId}
        variant={'container'}
        parentType={Parent_Type_Enum.InternalAuditEntity}
        parent={internalAudit}
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
