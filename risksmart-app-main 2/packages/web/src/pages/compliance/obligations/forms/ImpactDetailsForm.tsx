import {
  type InsertObligationImpactMutationVariables,
  Parent_Type_Enum,
  type UpdateObligationImpactMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

interface Props {
  readOnly?: boolean;
}

const ImpactDetailsForm: FC<Props> = ({ readOnly }) => {
  const { control } = useFormContext<
    | InsertObligationImpactMutationVariables
    | UpdateObligationImpactMutationVariables
  >();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'impacts',
  });
  const formConfig = useFormConfig(Parent_Type_Enum.ObligationImpact);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledTextarea
        key={'description'}
        forceRequired={true}
        name={formConfig.Description.fieldId}
        label={formConfig.Description.formLabel}
        placeholder={t('placeholders.Description')}
        control={control}
        disabled={readOnly}
        testId={'impactOfNonAdherence'}
      />
      <ControlledRating
        forceRequired={true}
        key={'rating'}
        testId={'impactRating'}
        name={formConfig.ImpactRating.fieldId}
        label={formConfig.ImpactRating.formLabel}
        type={formConfig.ImpactRating.displayType.ratingKey}
        control={control}
        addEmptyOption={true}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default ImpactDetailsForm;
