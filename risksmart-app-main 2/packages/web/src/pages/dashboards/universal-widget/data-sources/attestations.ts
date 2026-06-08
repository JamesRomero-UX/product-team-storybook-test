import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import i18n from '@risksmart-app/i18n/src/i18n';
import {
  GetPolicyAttestationRecordsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useGetAttestationSmartWidgetTableProps } from 'src/pages/policy/update/tabs/files/update/tabs/attestations/config';
import type { AttestationRegisterFields } from 'src/pages/policy/update/tabs/files/update/tabs/attestations/types';

import { dateRangeFilter } from '../../gigawidget/util/filterHelpers';
import { createDataSource } from '../createDataSource';
import { dashboardDateRangeClickthroughFilter } from '../dataSourceHelpers';

export default createDataSource<
  AttestationRegisterFields,
  VariablesOf<typeof GetPolicyAttestationRecordsDocument>,
  ResultOf<typeof GetPolicyAttestationRecordsDocument>
>({
  parentTypes: [Parent_Type_Enum.AttestationRecord],
  hasAccess: (_, isModuleEnabled) =>
    isModuleEnabled('document.subModules.attestation'),
  documentNode: GetPolicyAttestationRecordsDocument,
  trpcQuery: (trpc) => {
    const queryOptions = trpc.frontend.attestation.register.queryOptions();

    return queryOptions as UseQueryOptions<unknown, Error>;
  },
  useDefaultVariables: () => ({
    where: {},
  }),
  useTablePropsHook: (data, options) =>
    useGetAttestationSmartWidgetTableProps(data?.attestation_record, options),
  dashboardFilterConfig: {
    dateFilter: (dateRange, precision) => ({
      where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
    }),
    ownershipFilter: (myItemsFilters, userId) => {
      if (myItemsFilters.owner) {
        return {
          where: {
            _and: [
              { UserId: { _eq: userId } },
              { AttestationStatus: { _eq: 'pending' } },
            ],
          },
        };
      }

      return { where: undefined };
    },
    dateClickthroughFilter:
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp'),
  },
  entityNamePlural: 'attestation_other',
  entityNameSingular: 'attestation_one',
  fields: 'policy.fields',
  categoryGetters: [
    {
      id: 'status',
      name: () => i18n.t('columns.status'),
      categoryGetter: (data) => ({
        key: data.AttestationStatus,
        label: data.AttestationStatusLabel,
      }),
      ratingColourKey: 'document_file_status',
    },
    {
      id: 'user',
      name: () => i18n.t('columns.user'),
      categoryGetter: (data) => data.User,
    },
    {
      id: 'document',
      name: () => i18n.t('document_one'),
      categoryGetter: (data) => data.Document,
    },
    {
      id: 'active',
      name: () => i18n.t('active'),
      categoryGetter: (data) => data.ActiveLabel,
    },
    {
      id: 'attestedDate',
      name: () => i18n.t('columns.attested_at'),
      categoryGetter: (data) =>
        data.AttestedAt ? new Date(data.AttestedAt) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { AttestedAt: dateRangeFilter(dateRange, precision) },
      }),
    },
    {
      id: 'expiresDate',
      name: () => i18n.t('columns.expires_at'),
      categoryGetter: (data) =>
        data.ExpiresAt ? new Date(data.ExpiresAt) : null,
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { ExpiresAt: dateRangeFilter(dateRange, precision) },
      }),
    },
    {
      id: 'createdDate',
      name: () => i18n.t('columns.created_on'),
      categoryGetter: (data) => new Date(data.CreatedAtTimestamp),
      date: true,
      dashboardDateFilterOverride: (dateRange, precision) => ({
        where: { CreatedAtTimestamp: dateRangeFilter(dateRange, precision) },
      }),
    },
  ],
});
