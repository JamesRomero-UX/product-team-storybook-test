import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { IssueTaxonomyKeys } from '@risksmart-app/shared/forms/issues/types';
import {
  DeleteControlsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useGetControlById } from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';

import DeleteControlModal from '../tab/delete-modal/DeleteControlModal';
import useExporter from './useExporter';

type Props = {
  activeTabId:
    | 'actions'
    | 'approvals'
    | 'details'
    | 'indicators'
    | 'issues'
    | 'linkedItems'
    | 'notificationHistory'
    | 'performance'
    | IssueTaxonomyKeys;
  showDeleteButton?: boolean;
};

const Page: FC<Props> = ({ activeTabId, showDeleteButton }) => {
  const controlId = useGetGuidParam('controlId');

  const navigate = useNavigate();

  const detailPath = useGetDetailPath(controlId);
  const parentPath = useGetDetailParentPath(controlId);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controls' });
  const defaultTitle = st('fallback_title');

  const { data, error } = useGetControlById({
    queryArgs: { controlId },
  });
  if (error) {
    throw error;
  }
  if (data?.control.length === 0) {
    throw new PageNotFound(`Control with id ${controlId} not found`);
  }
  const control = data?.control?.[0];
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', control);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', control);
  const [exportItem, { loading: exporting }] = useExporter(
    controlId,
    internalAuditEnabled &&
      canViewInternalAudit &&
      !canViewInternalAuditLoading,
    complianceMonitoringEnabled &&
      canViewCompliance &&
      !canViewComplianceLoading
  );
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Control,
    parent: control,
    hrefRoot: detailPath,
  });

  const [deleteControls, deleteResult] = useMutation(DeleteControlsDocument, {
    update: (cache) => evictField(cache, 'control'),
  });

  const onDelete = useDeleteResultNotification({
    asyncAction: async () => {
      if (!control) {
        throw new Error('Control not selected');
      }
      await deleteControls({
        variables: {
          Ids: [control.Id],
        },
      });
      navigate(parentPath);
      setIsDeleteModalVisible(false);

      return true;
    },
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });
  const counter =
    control &&
    `(${getFriendlyId(Parent_Type_Enum.Control, control.SequentialId)})`;

  return (
    <PageLayout
      title={control?.Title}
      meta={{
        title: defaultTitle,
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
          {showDeleteButton && (
            <Permission permission={'delete:control'} parentObject={control}>
              <Button
                variant={'normal'}
                formAction={'none'}
                onClick={() => {
                  setIsDeleteModalVisible(true);
                }}
              >
                {t('delete')}
              </Button>
            </Permission>
          )}
        </SpaceBetween>
      }
    >
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.Control}
        parent={control}
      />
      <DeleteControlModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
        showUnlink={false}
      />
    </PageLayout>
  );
};

export default Page;
