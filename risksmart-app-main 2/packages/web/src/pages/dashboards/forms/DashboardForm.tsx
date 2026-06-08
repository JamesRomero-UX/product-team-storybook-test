import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import { DashboardFormFields } from './DashboardFormFields';
import type { DashboardFormFieldData } from './dashboardSchema';
import { DashboardSchema, defaultValues } from './dashboardSchema';

export type Props = Omit<
  FormContextProps<DashboardFormFieldData>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
>;

const DashboardForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);

  return (
    <CustomisableForm
      {...props}
      schema={DashboardSchema}
      defaultValues={defaultValues}
      i18n={t('dashboard')}
      formId={'save-dashboard-form'}
      renderTemplate={(renderProps) => (
        <ModalWrapper {...renderProps} visible={true} />
      )}
    >
      <DashboardFormFields />
    </CustomisableForm>
  );
};

export default DashboardForm;
