import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { DeleteDepartmentTypesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useGetDepartments } from 'src/hooks/queries';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import type { DepartmentsTableFields } from './config';
import { useGetCollectionTableProps } from './config';
import DepartmentTypeModal from './DepartmentTypeModal';

const DepartmentsTab: FC = () => {
  useI18NSummaryHelpContent('departments.help');
  const { t } = useTranslation(['common'], { keyPrefix: 'departments' });
  const { t: st } = useTranslation(['common']);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDepartmentTypes, setSelectedDepartmentTypes] = useState<
    DepartmentsTableFields[]
  >([]);
  const [selectedDepartmentTypeId, setSelectedDepartmentTypeId] = useState<
    string | undefined
  >(undefined);

  const { data, loading, refetch } = useGetDepartments({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(
    data?.department_type ?? [],
    (departmentType) => {
      setSelectedDepartmentTypeId(departmentType.DepartmentTypeId);
      setIsEditOpen(true);
    }
  );

  const [deleteDepartmentTypes, deleteResult] = useMutation(
    DeleteDepartmentTypesDocument,
    {
      update: (cache) => {
        evictField(cache, 'department_type');
      },
    }
  );

  const handleDepartmentTypeModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleDepartmentTypeModalClose = (saved: boolean) => {
    setSelectedDepartmentTypeId(undefined);
    setIsEditOpen(false);
    if (saved) {
      refetch();
    }
  };

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteDepartmentTypes({
        variables: {
          Ids: selectedDepartmentTypes.map((s) => s.DepartmentTypeId),
        },
      });
      setSelectedDepartmentTypes([]);
      setIsDeleteModalVisible(false);
      await refetch();

      return true;
    },
  });

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    formAction={'none'}
                    variant={'normal'}
                    disabled={!selectedDepartmentTypes.length}
                    onClick={() => setIsDeleteModalVisible(true)}
                  >
                    {t('delete')}
                  </Button>
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={handleDepartmentTypeModalOpen}
                  >
                    {t('add_button')}
                  </Button>
                  <Button
                    iconName={'download'}
                    onClick={tableProps.exportToCsv}
                  >
                    {st('export.export')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('departmentsTableTitle')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        selectionType={'multi'}
        selectedItems={selectedDepartmentTypes}
        onSelectionChange={({ detail }) => {
          setSelectedDepartmentTypes(detail.selectedItems);
        }}
        trackBy={'DepartmentTypeId'}
      />
      {isEditOpen && (
        <DepartmentTypeModal
          id={selectedDepartmentTypeId}
          onDismiss={handleDepartmentTypeModalClose}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setSelectedDepartmentTypeId(undefined);
          setSelectedDepartmentTypes([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default DepartmentsTab;
