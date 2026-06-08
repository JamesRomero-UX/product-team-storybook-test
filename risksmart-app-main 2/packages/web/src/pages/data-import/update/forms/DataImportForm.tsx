import { useMutation } from '@apollo/client';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  DataImportValidateDocument,
  InsertDataImportDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { FormContext } from 'src/components/form/form/FormContext';
import { PageWrapper } from 'src/components/form/form/PageWrapper';

import { evictField } from '@/utils/graphqlUtils';
import { dataImportResultsUrl } from '@/utils/urls';

import type { DataImport } from '../../types';
import { supportedCsvFiles } from '../csvFiles';
import DataImportFormFields from './DataImportFormFields';
import type { DataImportDataFields } from './dataImportSchema';
import { DataImportSchema, defaultValues } from './dataImportSchema';
import TemplateLink from './TemplateLink';

export const DataImportForm: FC<{
  dataImport: DataImport | undefined;
}> = ({ dataImport }) => {
  const { updateFiles } = useFileUpdate();

  const [insertDataImport] = useMutation(InsertDataImportDocument, {
    update: (cache) => {
      evictField(cache, 'data_import');
    },
  });
  const [validate] = useMutation(DataImportValidateDocument, {
    update: (cache) => {
      evictField(cache, 'data_import');
    },
  });

  const { t: st } = useTranslation(['common'], { keyPrefix: 'dataImport' });
  const navigate = useNavigate();

  return (
    <FormContext<DataImportDataFields>
      formId={''}
      header={st('tabTitle')}
      values={
        dataImport
          ? {
              ...dataImport,
              files: dataImport?.files.map((f) => f.file) || [],
            }
          : undefined
      }
      onDismiss={(saved) => {
        if (!saved) {
          navigate('..');
        }
      }}
      defaultValues={defaultValues}
      onSave={async (data) => {
        let dataImportId = dataImport?.Id;
        if (!dataImport) {
          const { data: insertDataImportResult } = await insertDataImport();
          dataImportId = insertDataImportResult?.insert_data_import_one?.Id;
        }
        if (!dataImportId) {
          throw new Error('Missing data import id');
        }

        await updateFiles({
          parentType: Parent_Type_Enum.DataImport,
          parentId: dataImportId,
          originalFiles: dataImport?.files.map((f) => f.file),
          selectedFiles: data.files,
        });

        await validate({ variables: { Id: dataImportId } });
        navigate(dataImportResultsUrl(dataImportId));
      }}
      schema={DataImportSchema}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      i18n={{
        entity_name: st('entity_name'),
      }}
    >
      {supportedCsvFiles.sort().map((csvFile, i) => (
        <TemplateLink csvFile={csvFile} key={i} />
      ))}

      <DataImportFormFields />
    </FormContext>
  );
};
