import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { IssueTaxonomyKeys } from '@risksmart-app/shared/forms/issues/types';
import {
  DeleteObligationDocument,
  namedOperations,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Paperclip } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useGetObligationById } from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { evictField } from '@/utils/graphqlUtils';

import useExporter from './useExporter';

type Props = {
  selectedTabId:
    | 'actions'
    | 'controls'
    | 'details'
    | 'impacts'
    | 'linkedItems'
    | 'ratings'
    | IssueTaxonomyKeys;
};

const Page: FC<Props> = ({ selectedTabId }) => {
  const obligationId = useGetGuidParam('obligationId');

  const navigate = useNavigate();

  const detailsPath = useGetDetailPath(obligationId);
  const parentPath = useGetDetailParentPath(obligationId);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { t } = useTranslation(['common']);
  const defaultTitle = t('obligations.fallback_title');

  const { data, error } = useGetObligationById({
    queryArgs: { id: obligationId },
  });
  if (error) {
    throw error;
  }
  const [obligation] = data?.obligation || [];
  const tabs = useTabs({
    parent: obligation,
    parentType: Parent_Type_Enum.Obligation,
    hrefRoot: detailsPath,
  });
  const [mutate, deleteResult] = useMutation(DeleteObligationDocument, {
    update: (cache) => {
      evictField(cache, 'obligation');
      evictField(cache, 'obligation_impact');
    },
    refetchQueries: [
      namedOperations.Query.getObligationById,
      namedOperations.Query.getObligationsByType,
    ],
  });
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery(
    'read:compliance_monitoring_assessment',
    obligation
  );
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', obligation);
  const [exportItem, { loading: exporting }] = useExporter(
    obligationId,
    internalAuditEnabled &&
      canViewInternalAudit &&
      !canViewInternalAuditLoading,
    complianceMonitoringEnabled &&
      canViewCompliance &&
      !canViewComplianceLoading
  );

  const onDelete = useDeleteResultNotification({
    entityName: t('obligations.entity_name'),
    asyncAction: async () => {
      // do nothing if obligation isn't present yet.
      if (!obligation) {
        return false;
      }
      await mutate({
        variables: { id: obligation.Id },
      });
      navigate(parentPath);

      return true;
    },
  });
  if (deleteResult.data?.delete_obligation?.affected_rows === 1) {
    return <></>;
  }

  if (data?.obligation.length === 0) {
    throw new PageNotFound(`Obligation with id ${obligationId} not found`);
  }
  const title = obligation?.Title;
  const counter = obligation && `(O-${obligation.SequentialId})`;

  return (
    <PageLayout
      title={title}
      meta={{
        title: defaultTitle,
        icon: obligation?.ExternalId ? <Paperclip /> : undefined,
      }}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <Button
            iconName={'download'}
            disabled={exporting}
            onClick={exportItem}
          >
            {t('export.export')}
          </Button>
          <Permission
            permission={'delete:obligation'}
            parentObject={obligation}
          >
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {t('obligations.delete_button')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <ControlledTabs
        activeTabId={selectedTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Obligation}
        parent={obligation}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {t('obligations.confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
