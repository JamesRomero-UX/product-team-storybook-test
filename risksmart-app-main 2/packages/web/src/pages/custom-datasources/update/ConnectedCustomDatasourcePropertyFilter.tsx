import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { FieldDefinitionWithDataSourceIndex } from './customDatasourceModel';
import CustomDatasourcePropertyFilter from './CustomDatasourcePropertyFilter';
import type { TreeDataSource } from './customDatasourceSchema';
import { getFlattenedDataSources } from './datasourceTreeMapping';

const ConnectedCustomDatasourcePropertyFilter: FC<{
  allFields: FieldDefinitionWithDataSourceIndex[];
  rootDataSource: TreeDataSource;
}> = ({ allFields, rootDataSource }) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customDatasources.fields',
  });
  const { watch, setValue } = useFormContext();
  const filters = watch('filters');

  return (
    <FormField label={t('filters')} data-testid={'form-field-filters'}>
      <CustomDatasourcePropertyFilter
        allFields={allFields}
        datasources={getFlattenedDataSources(rootDataSource)}
        query={filters}
        onChange={(filters) => {
          setValue('filters', filters);
        }}
      />
    </FormField>
  );
};

export default ConnectedCustomDatasourcePropertyFilter;
