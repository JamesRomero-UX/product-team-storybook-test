import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import Container from '@risk-smart/themed-cloudscape-components/container';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetOptionalGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteCustomDatasourceDocument,
  GetAllFormsCustomisationDocument,
  GetCustomDatasourceByIdDocument,
  GetReportingDataDocument,
  InsertCustomDataSourceDocument,
  UpdateCustomDatasourceDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { type FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import DeleteModal from 'src/components/delete-modal';
import PageLayout from 'src/layouts/PageLayout';
import { useCustomAttributeLookup } from 'src/pages/dashboards/custom-data-source-widget/useCustomAttributeLookup';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import type { TypedCustomDatasource } from '../types';
import { CustomDatasourceForm } from './CustomDatasourceForm';
import type { CustomDatasourceFormData } from './customDatasourceSchema';
import CustomDatasourceTable from './CustomDatasourceTable';
import {
  mapFromDataToServerVariables,
  mapServerDataToFormData,
} from './formDataMapping';
import type { RelatedDataSource } from './types';

const Page: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    hasPermission: canUpdateDatasource,
    loading: canUpdateDatasourceLoading,
  } = useHasPermissionQuery('update:custom_datasource');
  const customDataSourceId = useGetOptionalGuidParam('customDatasourceId');
  const [preferences, setPreferences] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useState<CollectionPreferencesProps.Preferences<any>>();

  const { data: customDatasource, loading } = useQuery(
    GetCustomDatasourceByIdDocument,
    {
      variables: { Id: customDataSourceId! },
      skip: !customDataSourceId,
      fetchPolicy: 'no-cache',
    }
  );
  const savedCustomDatasource: null | TypedCustomDatasource | undefined =
    customDatasource?.custom_datasource_by_pk;

  if (!loading && !savedCustomDatasource && customDataSourceId) {
    throw new PageNotFound(
      `Custom datasource with id ${customDataSourceId} not found`
    );
  }

  const { t } = useTranslation(['common'], { keyPrefix: 'customDatasources' });
  const [definitionFormData, setDefinitionFormData] =
    useState<CustomDatasourceFormData>();
  const { data: formCustomisationData } = useQuery(
    GetAllFormsCustomisationDocument,
    {}
  );
  const { customAttributeSchemaLookup } = useCustomAttributeLookup();
  const [getReportData, getReportDataResult] = useLazyQuery(
    GetReportingDataDocument,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [insertCustomDatasource] = useMutation(
    InsertCustomDataSourceDocument,
    {}
  );
  const [updateCustomDatasource] = useMutation(
    UpdateCustomDatasourceDocument,
    {}
  );
  const [deleteCustomDatasource, deleteResult] = useMutation(
    DeleteCustomDatasourceDocument,
    {
      update: (cache) => {
        evictField(cache, 'custom_datasource');
        evictField(cache, 'custom_datasource_by_pk');
      },
    }
  );

  const pageIndex = useRef(0);
  const pageSize = 20;

  const fetchData = (formData: CustomDatasourceFormData) =>
    getReportData({
      notifyOnNetworkStatusChange: true,
      variables: {
        Input: mapFromDataToServerVariables(
          formData,
          {
            offset: pageIndex.current * pageSize,
            limit: pageSize,
          },
          undefined
        ),
      },
    });

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      if (!savedCustomDatasource) {
        return false;
      }
      await deleteCustomDatasource({
        variables: {
          Id: savedCustomDatasource.Id,
        },
      });
      await navigate('..' + location.hash);

      return true;
    },
  });

  const values = useMemo<CustomDatasourceFormData | undefined>(() => {
    return (
      definitionFormData ??
      (savedCustomDatasource
        ? mapServerDataToFormData(savedCustomDatasource)
        : undefined)
    );
  }, [savedCustomDatasource, definitionFormData]);
  const definition = definitionFormData
    ? mapFromDataToServerVariables(
        definitionFormData,
        {
          offset: pageIndex.current * pageSize,
          limit: pageSize,
        },
        undefined
      )
    : undefined;

  return (
    <PageLayout
      title={savedCustomDatasource?.Title ?? t('create_title')}
      actions={
        savedCustomDatasource && (
          <SpaceBetween direction={'horizontal'} size={'xxs'}>
            {customDataSourceId && (
              <Permission permission={'delete:custom_datasource'}>
                <Button
                  variant={'normal'}
                  formAction={'none'}
                  onClick={async () => {
                    setIsDeleteModalVisible(true);
                  }}
                >
                  {t('delete_button')}
                </Button>
              </Permission>
            )}
          </SpaceBetween>
        )
      }
    >
      <Container>
        {customAttributeSchemaLookup && (
          <CustomDatasourceForm
            formFieldConfigurations={
              formCustomisationData?.form_field_configuration ?? null
            }
            mode={customDataSourceId ? 'update' : 'create'}
            readOnly={!canUpdateDatasource || canUpdateDatasourceLoading}
            customAttributeSchemaLookup={customAttributeSchemaLookup}
            values={values}
            onPreview={async (formData) => {
              pageIndex.current = 0;
              setDefinitionFormData(formData);
              fetchData(formData);
            }}
            onDismiss={async (saved) => {
              if (!saved) {
                navigate('..' + location.hash);
              }
            }}
            onSave={async (formData) => {
              pageIndex.current = 0;
              setDefinitionFormData(formData);
              const mappedFromData = mapFromDataToServerVariables(
                formData,
                {
                  offset: pageIndex.current * pageSize,
                  limit: pageSize,
                },
                preferences?.contentDisplay?.map((c) => c.id)
              );
              if (savedCustomDatasource) {
                await updateCustomDatasource({
                  variables: {
                    Id: savedCustomDatasource.Id,
                    Data: {
                      Title: formData.title,
                      Fields: mappedFromData.fields,
                      Datasources: mappedFromData.dataSources,
                      Filters: mappedFromData.filters,
                    },
                  },
                });
              } else {
                await insertCustomDatasource({
                  variables: {
                    customDatasource: {
                      Title: formData.title,
                      Fields: mappedFromData.fields,
                      Datasources: mappedFromData.dataSources,
                      Filters: mappedFromData.filters,
                    },
                  },
                });
              }
              navigate('..' + location.hash);
            }}
          />
        )}
      </Container>

      {getReportDataResult.error && !getReportDataResult.loading && (
        <Alert type={'error'}>{t('data_request_failure_message')}</Alert>
      )}
      {customAttributeSchemaLookup && definition && (
        <CustomDatasourceTable
          formFieldConfigurations={
            formCustomisationData?.form_field_configuration ?? null
          }
          preferences={preferences}
          onSetPreferences={setPreferences}
          columnsAlwaysVisible={true}
          customAttributeSchemaLookup={customAttributeSchemaLookup}
          loading={getReportDataResult.loading}
          pageSize={pageSize}
          currentPageIndex={pageIndex.current}
          onPageChangeClick={({ requestedPageIndex }) => {
            pageIndex.current = requestedPageIndex;
            if (!definitionFormData) {
              throw new Error('Missing form data');
            }
            fetchData(definitionFormData);
          }}
          customDatasource={{
            Fields: definition.fields,
            Datasources: definition.dataSources as RelatedDataSource[],
          }}
          items={getReportDataResult.data?.reportingData ?? []}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
