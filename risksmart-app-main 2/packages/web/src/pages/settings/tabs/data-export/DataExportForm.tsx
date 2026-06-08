import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FormContext } from 'src/components/form/form/FormContext';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import DataExportFormFields from './DataExportFormFields';
import type { DataExportFormDataFields } from './dataExportSchema';
import { defaultValues, useDataExportSchema } from './dataExportSchema';

type Props = Omit<
  FormContextProps<DataExportFormDataFields>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
>;

const DataExportForm: FC<Props> = (props) => {
  const { t } = useTranslation('common');
  const dataExportFormSchema = useDataExportSchema();

  return (
    <div className={'mt-6'}>
      <FormContext
        {...props}
        formId={'data-export-form'}
        defaultValues={defaultValues}
        i18n={t('dataExport')}
        schema={dataExportFormSchema}
        renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      >
        <DataExportFormFields />
      </FormContext>
    </div>
  );
};

export default DataExportForm;
