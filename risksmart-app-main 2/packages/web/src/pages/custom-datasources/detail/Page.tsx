import { useLazyQuery, useQuery } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import {
  arrayToCsv,
  downloadBlob,
} from '@risksmart-app/components/src/file/fileUtils';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { GetReportingDataQueryVariables } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAllFormsCustomisationDocument,
  GetCustomDatasourceByIdDocument,
  GetReportingDataDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { type FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from 'src/layouts/PageLayout';
import { useCustomAttributeLookup } from 'src/pages/dashboards/custom-data-source-widget/useCustomAttributeLookup';
import { Permission } from 'src/rbac/Permission';
import { useFeatures } from 'src/rbac/useFeatures';

import { emptyFilterQuery } from '@/utils/collectionUtils';
import { useFiltersFromUrlHash } from '@/utils/table/hooks/useFiltersFromUrlHash';
import { editCustomDatasourceUrl } from '@/utils/urls';

import type { TypedCustomDatasource } from '../types';
import { CustomDatasourceModel } from '../update/customDatasourceModel';
import CustomDatasourcePropertyFilter from '../update/CustomDatasourcePropertyFilter';
import CustomDatasourceTable from '../update/CustomDatasourceTable';
import { getFieldUniqueId } from '../update/fieldValue';
import { combinedFilters } from './combineFilters';
import { useCustomDatasourceExporterMapper } from './customDatasourceExporter';

const Page: FC = () => {
  const { addNotification } = useNotifications();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;
  const [preferences, setPreferences] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useState<CollectionPreferencesProps.Preferences<any>>();
  const customDataSourceId = useGetGuidParam('customDatasourceId');
  const { data: customDatasourceData, loading } = useQuery(
    GetCustomDatasourceByIdDocument,
    {
      variables: { Id: customDataSourceId },
      fetchPolicy: 'no-cache',
    }
  );
  const customDatasource: null | TypedCustomDatasource | undefined =
    customDatasourceData?.custom_datasource_by_pk;
  if (!loading && !customDatasource) {
    throw new PageNotFound(
      `Custom datasource with id ${customDataSourceId} not found`
    );
  }

  const filterFields = useMemo(() => {
    if (!customDatasource?.Fields) {
      return {};
    }

    return Object.fromEntries(
      customDatasource.Fields.map((f) => [getFieldUniqueId(f), { header: '' }])
    );
  }, [customDatasource?.Fields]);

  const { propertyFilter, setPropertyFilter, hash } = useFiltersFromUrlHash({
    fields: filterFields,
  });

  const { t } = useTranslation(['common'], { keyPrefix: 'customDatasources' });
  const { t: rt } = useTranslation(['common']);
  const { data: formCustomisationData } = useQuery(
    GetAllFormsCustomisationDocument,
    {}
  );
  const { customAttributeSchemaLookup } = useCustomAttributeLookup();

  const formatForExport = useCustomDatasourceExporterMapper({
    customAttributeSchemaLookup,
    customDatasource,
    formFieldConfigurations:
      formCustomisationData?.form_field_configuration ?? null,
  });
  const getVariables = (
    customDatasource: null | TypedCustomDatasource | undefined,
    paging: { offset: number; limit: number }
  ): GetReportingDataQueryVariables | undefined => {
    if (!customDatasource) {
      return undefined;
    }

    return {
      Input: {
        filters: combinedFilters(customDatasource, propertyFilter),
        dataSources: customDatasource.Datasources,
        fields: customDatasource.Fields ?? [],
        ...paging,
      },
    };
  };

  const exportToCsv = async () => {
    const results = await getReportData({
      variables: getVariables(customDatasource, { offset: 0, limit: 100000 }),
    });
    if (results.error) {
      addNotification({
        type: 'error',
        content: rt('export.export_failed_message'),
      });

      return;
    }

    const formatted = formatForExport(results.data?.reportingData);

    const csv = arrayToCsv(formatted);
    const blob = new Blob(['\ufeff', csv], {
      type: 'text/csv;charset=utf-8',
    });

    downloadBlob(`export.csv`, blob);
  };

  // TODO: potentially replace this with a new api that acceptances a customDatasourceId
  // this will avoid the need to call useGetCustomDatasourceByIdQuery first, and could offer bet security
  // if we want to look down the end point that supports any kind of query
  const {
    data: reportData,
    loading: reportDataLoading,
    error: reportDataError,
  } = useQuery(GetReportingDataDocument, {
    variables: getVariables(customDatasource, {
      offset: pageIndex * pageSize,
      limit: pageSize,
    }),
    fetchPolicy: 'no-cache',
    skip: !customDatasource,
  });
  const [getReportData, getReportDataResult] = useLazyQuery(
    GetReportingDataDocument,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const enabledFeatures = useFeatures();
  const customDatasourceModel =
    customDatasource && customAttributeSchemaLookup
      ? CustomDatasourceModel(
          customDatasource,
          customAttributeSchemaLookup,
          formCustomisationData?.form_field_configuration ?? null,
          enabledFeatures
        )
      : null;

  return (
    <PageLayout
      title={customDatasource?.Title ?? t('create_title')}
      actions={
        customDatasource && (
          <SpaceBetween direction={'horizontal'} size={'xxs'}>
            <Button
              iconName={'download'}
              disabled={getReportDataResult.loading || loading}
              onClick={exportToCsv}
            >
              {rt('export.export')}
            </Button>
            <Permission permission={'update:custom_datasource'}>
              <Button
                variant={'normal'}
                formAction={'none'}
                href={
                  customDataSourceId &&
                  editCustomDatasourceUrl(customDataSourceId) + hash
                }
              >
                {t('edit_button')}
              </Button>
            </Permission>
          </SpaceBetween>
        )
      }
    >
      {reportDataError && !reportDataLoading && (
        <Alert type={'error'}>{t('data_request_failure_message')}</Alert>
      )}
      {customDatasourceModel &&
        customAttributeSchemaLookup &&
        customDatasource && (
          <CustomDatasourceTable
            preferences={preferences}
            onSetPreferences={setPreferences}
            columnsAlwaysVisible={false}
            filter={
              customDatasource && (
                <CustomDatasourcePropertyFilter
                  query={propertyFilter ?? emptyFilterQuery}
                  onChange={(e) => {
                    setPageIndex(0);
                    setPropertyFilter(e);
                  }}
                  allFields={customDatasourceModel.fields}
                  datasources={customDatasource.Datasources}
                />
              )
            }
            formFieldConfigurations={
              formCustomisationData?.form_field_configuration ?? null
            }
            customAttributeSchemaLookup={customAttributeSchemaLookup}
            loading={reportDataLoading}
            pageSize={pageSize}
            currentPageIndex={pageIndex}
            onPageChangeClick={({ requestedPageIndex }) => {
              setPageIndex(requestedPageIndex);
            }}
            customDatasource={customDatasource}
            items={reportData?.reportingData ?? []}
          />
        )}
    </PageLayout>
  );
};

export default Page;
