import type { Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { PageForm } from 'src/components/form/form/PageForm';
import type { CommonProps } from 'src/components/form/form/types';

import DocumentFormFields from './DocumentFormFields';
import type { DocumentFormFieldData } from './documentSchema';
import { defaultValues, DocumentFormSchema } from './documentSchema';

export type Props = Omit<
  CommonProps<DocumentFormFieldData>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  readOnly?: boolean;
  documentId?: string;
  docVersionStatus?: Version_Status_Enum;
  latestTestDate?: null | string;
};

const DocumentForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);

  return (
    <PageForm
      {...props}
      i18n={t('policy')}
      header={t('details')}
      schema={DocumentFormSchema}
      defaultValues={defaultValues}
      formId={'document-form'}
      parentType={Parent_Type_Enum.Document}
    >
      <DocumentFormFields
        readOnly={props.readOnly}
        latestTestDate={props.latestTestDate}
      />
    </PageForm>
  );
};

export default DocumentForm;
