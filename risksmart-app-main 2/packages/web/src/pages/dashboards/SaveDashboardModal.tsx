import { useMutation, useQuery } from '@apollo/client';
import {
  DeleteDashboardDocument,
  GetDashboardByIdDocument,
  InsertDashboardDocument,
  namedOperations,
  UpdateDashboardDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { contributorIds } from 'src/components/form';
import { ButtonVariant } from 'src/components/form/form/types';
import { getContributors } from 'src/rbac/contributorHelper';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import DashboardForm from './forms/DashboardForm';
import type { DashboardFormFieldData } from './forms/dashboardSchema';
import { defaultValues } from './forms/dashboardSchema';
import type { OverallDashboardState } from './useDashboardStore';
import { useDashboardStore } from './useDashboardStore';

interface Props {
  onDismiss: () => void;
  onDelete: () => void;
  dashboardContent: OverallDashboardState;
  isEditing: boolean;
}

export const SaveDashboardModal: FC<Props> = ({
  onDismiss,
  dashboardContent,
  onDelete,
  isEditing,
}) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteDashboard, deleteResult] = useMutation(DeleteDashboardDocument, {
    refetchQueries: [namedOperations.Query.getDashboards],
  });
  const [insertDashboard] = useMutation(InsertDashboardDocument, {
    refetchQueries: [namedOperations.Query.getDashboards],
  });
  const [updateDashboard] = useMutation(UpdateDashboardDocument, {
    refetchQueries: [
      namedOperations.Query.getDashboards,
      namedOperations.Query.getDashboardById,
    ],
  });

  const { setId, id } = useDashboardStore();
  const { data: currentDashboard } = useQuery(GetDashboardByIdDocument, {
    variables: { Id: id! },
    skip: !id || !isEditing,
  });
  const { t } = useTranslation('common', { keyPrefix: 'dashboard' });
  const { t: st } = useTranslation('common');

  const handleDelete = useDeleteResultNotification({
    entityName: 'Dashboard',
    asyncAction: async () => {
      if (!id) {
        return false;
      }
      await deleteDashboard({
        variables: { Id: id },
      });
      onDelete();
      onDismiss();

      return true;
    },
  });
  const onSave = async (data: DashboardFormFieldData) => {
    if (isEditing && id) {
      await updateDashboard({
        variables: {
          ...data,
          Id: id,
          Name: data.name,
          Description: data.description || null,
          Sharing: data.sharing,
          Content: {
            filters: dashboardContent.filters,
            widgets: dashboardContent.widgets,
          },
          ...contributorIds(data),
        },
      });
    } else {
      const res = await insertDashboard({
        variables: {
          ...data,
          Name: data.name,
          Description: data.description || null,
          Sharing: data.sharing,
          Content: {
            filters: dashboardContent.filters,
            widgets: dashboardContent.widgets,
          },
          ...contributorIds(data),
        },
      });
      if (res.data?.insertChildDashboard?.Id) {
        setId(res.data?.insertChildDashboard?.Id);
      }
    }
  };

  if (isEditing && !currentDashboard) {
    return null;
  }

  const dashboard = currentDashboard?.dashboard_by_pk;

  return (
    <>
      <DashboardForm
        onSave={onSave}
        header={isEditing ? t('edit_dashboard') : t('save_dashboard')}
        values={
          dashboard
            ? {
                name: dashboard.Name,
                sharing: dashboard.Sharing ?? defaultValues.sharing,
                description: dashboard.Description ?? defaultValues.description,
                Contributors: getContributors(dashboard),
              }
            : undefined
        }
        secondaryActions={
          isEditing
            ? [
                {
                  label: st('delete'),
                  action: async () => setIsDeleteModalVisible(true),
                  variant: ButtonVariant.Danger,
                },
              ]
            : []
        }
        onDismiss={onDismiss}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete_dashboard')}
        onDelete={handleDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};
