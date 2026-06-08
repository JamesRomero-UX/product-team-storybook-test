import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import MultipleImpactRatingsFormFields from './MultipleImpactRatingsFormFields';
import type { ImpactRatingsFormFieldData } from './MultipleImpactRatingsFormSchema';
import { MultipleImpactRatingsFormSchema } from './MultipleImpactRatingsFormSchema';

export type Props = Omit<
  FormContextProps<ImpactRatingsFormFieldData>,
  'formId' | 'i18n' | 'parentType' | 'schema' | 'values'
> & {
  ratedItemId?: string;
  impactId?: string;
  beforeFieldsSlot?: ReactNode;
};

const MultipleImpactRatingsForm: FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <CustomisableForm
      {...props}
      schema={MultipleImpactRatingsFormSchema}
      i18n={t('impactRatingsMultiple')}
      formId={'impact-ratings-form'}
      parentType={Parent_Type_Enum.ImpactRating}
    >
      {props.beforeFieldsSlot}
      <MultipleImpactRatingsFormFields />
    </CustomisableForm>
  );
};

export default MultipleImpactRatingsForm;
