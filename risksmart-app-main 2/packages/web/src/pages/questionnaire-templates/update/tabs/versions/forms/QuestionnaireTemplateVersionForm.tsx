import {
  defaultSchema,
  defaultUISchema,
  useFormBuilderStore,
} from '@risksmart-app/components/src/form-builder/store/useFormBuilderStore';
import type { CustomUISchema } from '@risksmart-app/components/src/form-builder/types';
import {
  Questionnaire_Template_Version_Status_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormContext } from 'src/components/form/form/FormContext';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';
import { useShallow } from 'zustand/react/shallow';

import QuestionnaireTemplateVersionFormFields from './QuestionnaireTemplateVersionFormFields';
import type { QuestionnaireTemplateVersionFormFieldData } from './questionnaireTemplateVersionSchema';
import { QuestionnaireTemplateVersionFormSchema } from './questionnaireTemplateVersionSchema';

type Props = Omit<
  FormContextProps<QuestionnaireTemplateVersionFormFieldData>,
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
  | 'submitActions'
> & {
  readOnly?: boolean;
  isCreatingNewEntity: boolean;
  savedStatus: Questionnaire_Template_Version_Status_Enum;
  parentId: string;
  disableStatus: boolean;
  onPublish?: (
    data: QuestionnaireTemplateVersionFormFieldData
  ) => Promise<void>;
};

const QuestionnaireTemplateVersionForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);
  const { t: qt } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_template_versions',
  });

  const { values, defaultValues } = props;
  const { schema, setSchema, uiSchema, setUISchema, setIsFormCustomisable } =
    useFormBuilderStore(
      useShallow((state) => ({
        schema: state.schema,
        setSchema: state.setSchema,
        uiSchema: state.uiSchema,
        setUISchema: state.setUISchema,
        setIsFormCustomisable: state.setIsFormCustomisable,
      }))
    );

  const isDraft =
    props.savedStatus === Questionnaire_Template_Version_Status_Enum.Draft;
  const isPublished =
    props.savedStatus === Questionnaire_Template_Version_Status_Enum.Published;
  const allowStatusChange = !props.readOnly && props.isCreatingNewEntity;

  useEffect(() => {
    // pick schema from saved values (edit) or from defaults (create), else use store defaults
    const initialSchema =
      values?.Schema ?? defaultValues.Schema ?? defaultSchema;
    setSchema(initialSchema);

    // same for uischema
    const initialUISchema =
      (values?.UISchema as CustomUISchema) ??
      (defaultValues.UISchema as CustomUISchema) ??
      defaultUISchema;
    setUISchema(initialUISchema);

    setIsFormCustomisable(isDraft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = (data: QuestionnaireTemplateVersionFormFieldData) => {
    return props.onSave({
      ...data,
      Schema: schema,
      UISchema: uiSchema,
    });
  };

  return (
    <FormContext
      {...props}
      header={qt('details')}
      i18n={t('questionnaire_template_versions')}
      schema={QuestionnaireTemplateVersionFormSchema}
      formId={'questionnaire-template-version-form'}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      submitActions={[
        ...(isDraft
          ? [
              {
                label: qt('save_draft'),
                action: onSave,
              },
            ]
          : []),
        ...(allowStatusChange && isDraft && !!props.onPublish
          ? [
              {
                label: qt('status.publish_present'),
                action: (data: QuestionnaireTemplateVersionFormFieldData) => {
                  if (!props.onPublish) {
                    return Promise.resolve();
                  }

                  return props.onPublish({
                    ...data,
                    Schema: schema,
                    UISchema: uiSchema,
                  });
                },
              },
            ]
          : []),
        ...(allowStatusChange && isPublished
          ? [
              {
                label: qt('status.archive_present'),
                action: (data: QuestionnaireTemplateVersionFormFieldData) =>
                  props.onSave({
                    ...data,
                    Status: Version_Status_Enum.Archived,
                  }),
              },
            ]
          : []),
      ]}
    >
      <QuestionnaireTemplateVersionFormFields
        readOnly={props.readOnly}
        savedStatus={props.savedStatus}
      />
    </FormContext>
  );
};

export default QuestionnaireTemplateVersionForm;
