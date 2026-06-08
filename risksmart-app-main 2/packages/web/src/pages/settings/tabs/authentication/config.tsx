import type { ScimTokenOutput } from '@risksmart-app/web-graphql-client/derived-types';
import { useTranslation } from 'react-i18next';

import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

export type ScimDomainFields = {
  Domain: string;
  CreatedOn: string;
};

export const useGetScimDomainTableProps = (domains: ScimDomainFields[]) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimDomains',
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimDomains.columns',
  });
  const fields: TableFields<ScimDomainFields> = {
    Domain: {
      header: st('domain'),
    },
    CreatedOn: dateColumnFromConfig({
      header: { header: st('createdOn') },
      dateField: 'CreatedOn',
    }),
  };

  return useGetTableProps({
    tableId: 'scimDomains',
    data: domains,
    entityLabel: t('entityName'),
    fields,
    initialColumns: ['Domain', 'CreatedOn'],
    preferencesStorageKey: 'ScimDomainSettingsTable-Preferences',
    customAttributeFormIds: [],
  });
};

export type ScimTokenFields = Omit<ScimTokenOutput, '__typename'>;

export const useGetScimTokenTableProps = (domains: ScimTokenFields[]) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimTokens',
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'authenticationSettings.scimTokens.columns',
  });
  const fields: TableFields<ScimTokenFields> = {
    keyId: {
      header: st('keyId'),
    },
    createdOn: dateColumnFromConfig({
      header: { header: st('createdOn') },
      dateField: 'createdOn',
      includeTime: true,
    }),
    expiresOn: dateColumnFromConfig({
      header: { header: st('expiresOn') },
      dateField: 'expiresOn',
      includeTime: true,
    }),
    status: {
      header: st('status'),
    },
  };

  return useGetTableProps({
    customAttributeFormIds: [],
    tableId: 'scimTokens',
    data: domains,
    entityLabel: t('entityName'),
    fields,
    initialColumns: ['keyId', 'createdOn', 'expiresOn', 'status'],
    preferencesStorageKey: 'ScimTokenSettingsTable-Preferences',
    defaultSortingState: {
      sortingColumn: 'status',
      sortingDirection: 'asc',
    },
  });
};
