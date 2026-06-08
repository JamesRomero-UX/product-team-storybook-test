import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import {
  Consequence_Type_Enum,
  Cost_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import type { ConsequenceFormFields } from 'src/schemas/consequenceSchema';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useLibrary } from '@/hooks/useLibrary';

type SuggestedTitle = {
  value: string;
  label: string;
  type: 'library';
};

type Props = {
  readOnly?: boolean;
};

const ConsequenceForm: FC<Props> = ({ readOnly }) => {
  const { control, setValue } = useFormContext<ConsequenceFormFields>();
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'consequences',
  });

  const costTypes = Object.values(Cost_Type_Enum).map((key) => ({
    value: key,
    label: st('costType')[key],
  }));

  const consequencesLibrary = useLibrary('consequences');

  const autoPopulateDescription = (
    selectedTitleOption?: SelectProps.Option
  ) => {
    if (!selectedTitleOption) {
      return;
    }
    const selectedOption = selectedTitleOption as SuggestedTitle;
    const description = consequencesLibrary.find(
      (control) => control.title === selectedOption?.value
    )?.description;
    if (description) {
      setValue('Description', description);
    }
  };

  const consequencesLibraryOptions: SuggestedTitle[] = consequencesLibrary.map(
    (c) => ({
      value: c.title,
      label: c.title,
      type: 'library',
    })
  );

  const types = Object.values(Consequence_Type_Enum).map((value) => ({
    value,
    label: st('types')[value],
  }));

  const consequenceFormConfig = useFormConfig(Parent_Type_Enum.Consequence);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledAutosuggest
        key={'title'}
        forceRequired={true}
        testId={'title'}
        name={consequenceFormConfig.Title.fieldId}
        label={consequenceFormConfig.Title.formLabel}
        description={st('fields.Title_help')}
        control={control}
        placeholder={st('fields.Title_placeholder') ?? ''}
        onSelect={(e) => {
          autoPopulateDescription(e.detail.selectedOption);
        }}
        options={[
          {
            value: 'Library',
            label: 'Library',
            options: consequencesLibraryOptions,
          },
        ]}
        disabled={readOnly}
      />
      <ControlledSelect
        key={'type'}
        addEmptyOption={true}
        control={control}
        testId={'consequenceType'}
        name={consequenceFormConfig.Type.fieldId}
        label={consequenceFormConfig.Type.formLabel}
        description={st('fields.Type_help')}
        options={types}
        disabled={readOnly}
      />

      <ControlledRating
        key={'criticality'}
        filteringType={'none'}
        label={consequenceFormConfig.Criticality.formLabel}
        name={consequenceFormConfig.Criticality.fieldId}
        type={consequenceFormConfig.Criticality.displayType.ratingKey}
        placeholder={t('select') ?? ''}
        description={st('fields.Criticality_help')}
        control={control}
        testId={'criticality'}
        disabled={readOnly}
      />

      <ControlledSelect
        key={'costType'}
        testId={'costType'}
        forceRequired={true}
        control={control}
        name={consequenceFormConfig.CostType.fieldId}
        label={consequenceFormConfig.CostType.formLabel}
        description={st('fields.CostType_help')}
        options={costTypes}
        disabled={readOnly}
      />

      <ControlledInput
        key={'costValue'}
        type={'number'}
        forceRequired={true}
        name={consequenceFormConfig.CostValue.fieldId}
        testId={'costValue'}
        label={consequenceFormConfig.CostValue.formLabel}
        control={control}
        placeholder={st('fields.CostValue_placeholder') ?? ''}
        description={st('fields.CostValue_help')}
        disabled={readOnly}
      />

      <ControlledTextarea
        key={'description'}
        defaultRequired={true}
        name={consequenceFormConfig.Description.fieldId}
        testId={'description'}
        label={consequenceFormConfig.Description.formLabel}
        description={st('fields.Description_help')}
        placeholder={st('fields.Description_placeholder') ?? ''}
        control={control}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default ConsequenceForm;
