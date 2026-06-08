import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import ImpactFormFields from './ImpactFormFields';
import type { ImpactFormFieldData } from './impactFormSchema';
import { defaultValues, ImpactFormSchema } from './impactFormSchema';

export type Props = Omit<
  FormContextProps<ImpactFormFieldData>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
>;

const ImpactForm: FC<Props> = (props) => {
  const { t } = useTranslation('common');

  return (
    <CustomisableForm
      {...props}
      schema={ImpactFormSchema}
      defaultValues={defaultValues}
      i18n={t('impacts')}
      formId={'impact-form'}
      parentType={Parent_Type_Enum.Impact}
    >
      <ImpactFormFields readOnly={props.readOnly} />
    </CustomisableForm>
  );
};

export default ImpactForm;
