import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import type { InsertCauseMutationVariables } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useLibrary } from '@/hooks/useLibrary';

type SuggestedTitle = {
  value: string;
  label: string;
  type: 'library';
};

type FormFields = InsertCauseMutationVariables;

type Props = {
  readOnly?: boolean;
};

const CauseForm: FC<Props> = ({ readOnly }) => {
  const { control, setValue } = useFormContext<FormFields>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'causes',
  });

  const causesLibrary = useLibrary('causes');
  const autoPopulateDescription = (
    selectedTitleOption?: SelectProps.Option
  ) => {
    if (!selectedTitleOption) {
      return;
    }
    const selectedOption = selectedTitleOption as SuggestedTitle;
    const description = causesLibrary?.find(
      (control) => control.title === selectedOption?.value
    )?.description;
    if (description) {
      setValue('Description', description);
    }
  };

  const causesLibraryOptions: SuggestedTitle[] = causesLibrary?.map((c) => ({
    value: c.title,
    label: c.title,
    type: 'library',
  }));

  const options =
    causesLibraryOptions.length > 0
      ? [
          {
            value: 'Library',
            label: 'Library',
            options: causesLibraryOptions,
          },
        ]
      : [];

  const causesFormConfig = useFormConfig('cause');

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledAutosuggest
        key={'title'}
        testId={'title'}
        forceRequired={true}
        name={causesFormConfig.Title.fieldId}
        label={causesFormConfig.Title.formLabel}
        description={st('fields.Title_help')}
        control={control}
        placeholder={st('fields.Title_placeholder') ?? ''}
        onSelect={(e) => {
          autoPopulateDescription(e.detail.selectedOption);
        }}
        options={options}
        disabled={readOnly}
      />
      <ControlledRating
        testId={'significance'}
        key={'significance'}
        addEmptyOption={true}
        defaultRequired={true}
        control={control}
        name={causesFormConfig.Significance.fieldId}
        type={causesFormConfig.Significance.displayType.ratingKey}
        label={causesFormConfig.Significance.formLabel}
        description={st('fields.Significance_help')}
        disabled={readOnly}
      />

      <ControlledTextarea
        key={'description'}
        testId={'description'}
        defaultRequired={true}
        name={causesFormConfig.Description.fieldId}
        label={causesFormConfig.Description.formLabel}
        placeholder={st('fields.Description_placeholder') ?? ''}
        description={st('fields.Description_help')}
        control={control}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default CauseForm;
