import { useQuery } from '@apollo/client';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import {
  GetImpactListDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledImpactSelect from 'src/components/form/controlled-impact-select';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledRiskSelect from 'src/components/form/controlled-risk-select';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { TestIds } from './ImpactRatingFormFieldsTestIds';
import type { ImpactRatingFormFieldData } from './impactRatingFormSchema';

type Props = {
  readOnly?: boolean;
  hideImpact: boolean;
  hideRatedItem: boolean;
};

const ImpactRatingFormFields: FC<Props> = ({
  readOnly,
  hideImpact,
  hideRatedItem,
}) => {
  const { control, watch } = useFormContext<ImpactRatingFormFieldData>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impactRatings',
  });

  const impactId = watch('ImpactId');
  const { data: impacts } = useQuery(GetImpactListDocument);
  const selectedImpact = impacts?.impact.find(
    (impact) => impact.Id === impactId
  );
  const showImpact = !hideImpact;
  const formConfig = useFormConfig(Parent_Type_Enum.ImpactRating);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ConditionalField condition={showImpact} key={'impactId'}>
        <ControlledImpactSelect
          name={formConfig.ImpactId.fieldId}
          testId={TestIds.ImpactId}
          forceRequired={true}
          label={formConfig.ImpactId.formLabel}
          description={st('fields.Impact_help')}
          control={control}
          disabled={readOnly}
        />
        {selectedImpact && (
          <div className={'pb-6'}>
            <FormField label={st('fields.Rationale')}>
              <Textarea
                value={selectedImpact.Rationale ?? ''}
                readOnly={true}
              />
            </FormField>
          </div>
        )}
      </ConditionalField>

      <ConditionalField
        condition={!hideRatedItem && !!impactId}
        key={'ratedItemId'}
      >
        <ControlledRiskSelect
          name={formConfig.RatedItemId.fieldId}
          testId={TestIds.RatedItemId}
          forceRequired={true}
          label={formConfig.RatedItemId.formLabel}
          description={st('fields.Risk_help')}
          control={control}
          disabled={readOnly}
        />
      </ConditionalField>

      <ConditionalField condition={!!impactId} key={'completion-by'}>
        <ControlledGroupAndUserSelect
          testId={TestIds.CompletedBy}
          disabled={readOnly}
          defaultRequired={true}
          name={formConfig.CompletedBy.fieldId}
          label={formConfig.CompletedBy.formLabel}
          description={st('fields.CompletedBy_help')}
          control={control}
          includeGroups={false}
          addEmptyOption={true}
        />
      </ConditionalField>

      <ConditionalField condition={!!impactId} key={'testDate'}>
        <ControlledDatePicker
          testId={TestIds.TestDate}
          forceRequired={true}
          name={formConfig.TestDate.fieldId}
          label={formConfig.TestDate.formLabel}
          description={st('fields.TestDate_help')}
          control={control}
          disabled={readOnly}
        />
      </ConditionalField>

      <ConditionalField condition={!!impactId} key={'likelihood'}>
        <ControlledRating
          testId={TestIds.Likelihood}
          forceRequired={true}
          control={control}
          name={formConfig.Likelihood.fieldId}
          type={formConfig.Likelihood.displayType.ratingKey}
          label={formConfig.Likelihood.formLabel}
          showValue={true}
          description={st('fields.Likelihood_help')}
          disabled={readOnly}
        />
      </ConditionalField>

      <ConditionalField condition={!!impactId} key={'rating'}>
        <ControlledRating
          testId={TestIds.Rating}
          forceRequired={true}
          control={control}
          name={formConfig.Rating.fieldId}
          type={formConfig.Rating.displayType.ratingKey}
          label={formConfig.Rating.formLabel}
          showValue={true}
          description={st('fields.Rating_help')}
          disabled={readOnly}
        />
      </ConditionalField>
    </CustomisableFieldWrapper>
  );
};

export default ImpactRatingFormFields;
