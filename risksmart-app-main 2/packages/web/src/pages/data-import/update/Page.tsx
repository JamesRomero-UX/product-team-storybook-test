import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button/Button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetOptionalGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteDataImportByIdDocument,
  GetDataImportByIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { PageLayout } from 'src/layouts';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';
import { dataImportUrl } from '@/utils/urls';

import { useTabs } from './useTabs';

type Props = {
  selectedTabId: 'details' | 'results';
};

const Page: FC<Props> = ({ selectedTabId }) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteDataImport, deleteResult] = useMutation(
    DeleteDataImportByIdDocument,
    {
      update: (cache) => {
        evictField(cache, 'data_import');
      },
    }
  );
  const dataImportId = useGetOptionalGuidParam('dataImportId');
  const { data, error } = useQuery(GetDataImportByIdDocument, {
    variables: {
      id: dataImportId!,
    },
    skip: !dataImportId,
  });
  if (error) {
    throw error;
  }
  const { t: st } = useTranslation(['common'], { keyPrefix: 'dataImport' });
  const dataImport = data?.data_import[0];

  const tabs = useTabs(dataImport);
  const navigate = useNavigate();

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!dataImportId) {
        throw new Error('Missing data import id');
      }
      await deleteDataImport({
        variables: {
          id: dataImportId,
        },
      });

      setIsDeleteModalVisible(false);
      navigate(dataImportUrl());

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  if (deleteResult.data?.delete_data_import?.affected_rows === 1) {
    return <></>;
  }

  if (data?.data_import.length === 0) {
    throw new PageNotFound(`Data import with id ${dataImportId} not found`);
  }

  return (
    <PageLayout
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          {dataImport && (
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {st('deleteButton')}
            </Button>
          )}
        </SpaceBetween>
      }
      title={dataImport?.Id ?? 'Add Data Import'}
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={selectedTabId}
        variant={'container'}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => {
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirmDeleteMessage')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
