import { useTranslation } from 'react-i18next';
import { FormContext } from 'src/components/form/form/FormContext';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import {
  ButtonVariant,
  type FormContextProps,
} from 'src/components/form/form/types';

import { InvitationFormFields } from './InvitationFormFields';
import type { InvitationFields } from './invitationSchema';
import { defaultValues, invitationSchema } from './invitationSchema';

export type Props = Omit<
  FormContextProps<InvitationFields>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'mapPreviewedChanges'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
>;

export const InvitationForm = ({ ...props }: Props) => {
  const { t } = useTranslation();

  return (
    <FormContext
      {...props}
      values={props.values}
      formId={'questionnaire-invite-form'}
      defaultValues={defaultValues}
      i18n={t('third_party')}
      header={t('plan_questionnaire.form_title')}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      schema={invitationSchema}
      submitActions={[
        {
          label: 'Send',
          action: props.onSave,
          variant: ButtonVariant.Standard,
        },
      ]}
    >
      <InvitationFormFields />
    </FormContext>
  );
};
