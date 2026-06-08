import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import ImpactRatingFormFields from './ImpactRatingFormFields';
import type { ImpactRatingFormFieldData } from './impactRatingFormSchema';
import {
  defaultValues,
  ImpactRatingFormSchema,
} from './impactRatingFormSchema';

export type Props = Omit<
  FormContextProps<ImpactRatingFormFieldData>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  ratedItemId?: string;
  impactId?: string;
  beforeFieldsSlot?: ReactNode;
};

const ImpactRatingForm: FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <CustomisableForm
      {...props}
      schema={ImpactRatingFormSchema}
      defaultValues={{
        ...defaultValues,
        ImpactId: props.impactId as unknown as string,
        RatedItemId: props.ratedItemId as unknown as string,
      }}
      i18n={t('impactRatings')}
      formId={'impact-rating-form'}
      parentType={Parent_Type_Enum.ImpactRating}
    >
      {props.beforeFieldsSlot}
      <ImpactRatingFormFields
        readOnly={props.readOnly}
        hideImpact={!!props.impactId}
        hideRatedItem={!!props.ratedItemId}
      />
    </CustomisableForm>
  );
};

export default ImpactRatingForm;
