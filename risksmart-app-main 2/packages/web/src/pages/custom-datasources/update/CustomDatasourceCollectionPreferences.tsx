import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import CollectionPreferences from '@risk-smart/themed-cloudscape-components/collection-preferences';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { FieldDefinitionWithDataSourceIndex } from './customDatasourceModel';

type Props = Pick<CollectionPreferencesProps, 'onConfirm' | 'preferences'> & {
  fields: FieldDefinitionWithDataSourceIndex[];
  columnsAlwaysVisible: boolean;
};

const CustomDatasourceCollectionPreferences: FC<Props> = ({
  fields,
  columnsAlwaysVisible,
  ...rest
}) => {
  const { t } = useTranslation(['common']);

  const collectionPreferencesProps: CollectionPreferencesProps = {
    ...rest,
    title: t('tables.preferences'),
    confirmLabel: t('tables.confirm'),
    cancelLabel: t('tables.cancel'),
    contentDisplayPreference: {
      title: t('tables.preferences_columns_title'),
      options: fields.map((cd) => ({
        id: cd.value,
        label: cd.label ?? cd.defaultLabel,
        alwaysVisible: columnsAlwaysVisible,
      })),
    },
  };

  return <CollectionPreferences {...collectionPreferencesProps} />;
};

export default CustomDatasourceCollectionPreferences;
