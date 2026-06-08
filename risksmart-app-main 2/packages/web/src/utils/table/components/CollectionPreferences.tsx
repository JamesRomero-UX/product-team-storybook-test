import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import CloudscapeCollectionPreferences from '@risk-smart/themed-cloudscape-components/collection-preferences';
import i18next from '@risksmart-app/i18n/src/i18n';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import useEntityInfo from 'src/hooks/getEntityInfo';

import { labelWithPlural } from '@/utils/utils';

import { useFormConfigRegistry } from '../hooks/form/useFormConfigRegistry';
import { getColumnHeader } from '../hooks/getColumnHeader';
import type { TableFields, TablePreferences, TableRecord } from '../types';

type Props<T extends TableRecord> = {
  preferences: TablePreferences<T>;
  setPreferences: (preferences: TablePreferences<T>) => void;
  // TODO: Got a max of ParseKeys and string usage and the translation keys are working correctly. Need a better solution
  entityLabel: ParseKeys<'common'> | string;
  fields: TableFields<T>;
  formConfigurations: FormConfigurationPartsFragment[] | null;
};

function CollectionPreferences<T extends TableRecord>({
  preferences,
  setPreferences,
  entityLabel,
  fields,
  formConfigurations,
}: Props<T>) {
  const { t } = useTranslation(['common']);
  const getEntityInfo = useEntityInfo();
  const formRegistry = useFormConfigRegistry();
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200].map((size) => ({
    value: size,
    label: i18next.t('tables.paging_option', {
      entity: labelWithPlural(entityLabel).plural,
      size,
    }),
  }));

  const collectionPreferencesProps: CollectionPreferencesProps = {
    title: t('tables.preferences'),
    preferences: preferences,
    confirmLabel: t('tables.confirm'),
    cancelLabel: t('tables.cancel'),
    pageSizePreference: {
      title: t('tables.page_size'),
      options: PAGE_SIZE_OPTIONS,
    },
    contentDisplayPreference: {
      title: t('tables.preferences_columns_title'),
      enableColumnFiltering: true,
      options: Object.entries(fields).map(([fieldName, fieldConfig]) => ({
        id: fieldName,
        label: getColumnHeader(
          { formRegistry, formConfigurations, getEntityInfo },
          fieldConfig
        ),
      })),
    },
    onConfirm: (preferences) => {
      setPreferences(preferences.detail);
    },
    stickyColumnsPreference: {
      firstColumns: {
        title: t('tables.stick_first_columns_title'),
        description: t('tables.stick_first_columns_description'),

        options: [
          { label: t('tables.stick_column_options.none'), value: 0 },
          { label: t('tables.stick_column_options.first'), value: 1 },
          { label: t('tables.stick_column_options.first_two'), value: 2 },
        ],
      },
      lastColumns: {
        title: t('tables.stick_last_columns_title'),
        description: t('tables.stick_last_columns_description'),

        options: [
          { label: t('tables.stick_column_options.none'), value: 0 },
          { label: t('tables.stick_column_options.last'), value: 1 },
        ],
      },
    },
    contentDensityPreference: t('tables.content_density'),
    wrapLinesPreference: t('tables.wrap_lines'),
    stripedRowsPreference: t('tables.striped_rows'),
  };

  return (
    <CloudscapeCollectionPreferences
      {...collectionPreferencesProps}
      preferences={preferences}
    />
  );
}

export default CollectionPreferences;
