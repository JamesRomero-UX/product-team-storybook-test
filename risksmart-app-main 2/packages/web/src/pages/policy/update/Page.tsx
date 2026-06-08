import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { IssueTaxonomyKeys } from '@risksmart-app/shared/forms/issues/types';
import {
  DeleteDocumentDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
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

import { useGetDocumentById } from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';

import useExporter from './useExporter';

type Props = {
  activeTabId:
    | 'actions'
    | 'approvals'
    | 'attestations'
    | 'details'
    | 'files'
    | 'linkedItems'
    | 'notificationHistory'
    | 'ratings'
    | IssueTaxonomyKeys;
};

const Page: FC<Props> = ({ activeTabId }) => {
  const documentId = useGetGuidParam('documentId');
  const navigate = useNavigate();

  const detailsPath = useGetDetailPath(documentId);
  const parentUrl = useGetDetailParentPath(documentId);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy' });
  const defaultTitle = st('fallback_title');

  const { data, error } = useGetDocumentById({ queryArgs: { documentId } });
  if (error) {
    throw error;
  }
  const document = data?.document?.[0];
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', document);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', document);
  const [exportItem, { loading: exporting }] = useExporter(
    documentId,
    internalAuditEnabled &&
      canViewInternalAudit &&
      !canViewInternalAuditLoading,
    complianceMonitoringEnabled &&
      canViewCompliance &&
      !canViewComplianceLoading
  );

  const tabs = useTabs({
    parentType: Parent_Type_Enum.Document,
    parent: document,
    hrefRoot: detailsPath,
    disabled: false,
  });
  const [deleteDocuments, deleteResult] = useMutation(DeleteDocumentDocument, {
    update: (cache) => evictField(cache, 'document'),
  });

  const onDelete = useDeleteResultNotification({
    asyncAction: async () => {
      if (!document) {
        throw new Error('Document not selected');
      }

      await deleteDocuments({
        variables: {
          id: document.Id,
        },
      });

      await navigate(parentUrl);
      setIsDeleteModalVisible(false);

      return true;
    },
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  if (data?.document.length === 0) {
    throw new PageNotFound(`Document with id ${documentId} not found`);
  }

  const title = document?.Title;
  const counter =
    document &&
    `(${getFriendlyId(Parent_Type_Enum.Document, document.SequentialId)})`;

  return (
    <PageLayout
      title={title}
      meta={{ title: defaultTitle }}
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
          <Permission permission={'delete:document'} parentObject={document}>
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
        parentType={Parent_Type_Enum.Document}
        parent={document}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
