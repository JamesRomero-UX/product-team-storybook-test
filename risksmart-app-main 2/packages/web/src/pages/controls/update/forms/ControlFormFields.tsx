import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { PromptId } from '@risksmart-app/shared/ai/PromptId';
import {
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import TagSelector from 'src/components/form/tag-selector';
import { useGetControlsByUserId } from 'src/hooks/queries/control/useGetControlsByUserId';
import type { ControlFormFieldData } from 'src/pages/controls/update/forms/controlSchema';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useLibrary } from '@/hooks/useLibrary';

import TestScheduleFields from './TestScheduleFields';

type SuggestedTitle = {
  value: string;
  label: string;
  type: 'existing' | 'library';
};

type Props = {
  readOnly?: boolean;
  latestTestDate: null | string;
};

const ControlFormFields: FC<Props> = ({ readOnly, latestTestDate }) => {
  const { control, watch, setValue } = useFormContext<ControlFormFieldData>();

  const controlLibrary = useLibrary('controls');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controls' });

  const { user } = useRisksmartUser();

  const { data: userControls } = useGetControlsByUserId({
    queryArgs: { userId: user?.userId || '' },
    shouldSkip: !user,
  });

  const autoPopulateDescription = (
    selectedTitleOption?: SelectProps.Option
  ) => {
    if (!selectedTitleOption) {
      return;
    }
    const selectedOption = selectedTitleOption as SuggestedTitle;
    if (selectedOption.type === 'library') {
      const description = controlLibrary.find(
        (control) => control.title === selectedOption?.value
      )?.description;
      if (description) {
        setValue('Description', description);
      }
    } else if (selectedOption?.type === 'existing') {
      const control = userControls?.control.find(
        (c) => c.Title === selectedOption?.value
      );
      if (control?.Description) {
        setValue('Description', control.Description);
      }
    }
  };

  const existingControlOptions: SuggestedTitle[] =
    userControls?.control.map((c) => ({
      value: c.Title || '-',
      label: c.Title || '-',
      type: 'existing',
    })) || [];

  const controlLibraryOptions: SuggestedTitle[] = controlLibrary.map((c) => ({
    value: c.title,
    label: c.title,
    type: 'library',
  }));
  const types = st('type');
  const typeOptions = Object.keys(types).map((value) => ({
    value,
    label: types[value as keyof typeof types],
  }));

  const title = watch('Title');
  const controlFormConfig = useFormConfig(Parent_Type_Enum.Control);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledSelect
        forceRequired={false}
        key={'type'}
        testId={'type'}
        filteringType={'auto'}
        label={controlFormConfig.Type.formLabel}
        name={controlFormConfig.Type.fieldId}
        description={st('fields.Type_help')}
        addEmptyOption={true}
        // todo: translation
        placeholder={'Select'}
        control={control}
        options={typeOptions}
        disabled={readOnly}
      />
      <ControlledAutosuggest
        key={'title'}
        forceRequired={true}
        testId={'title'}
        name={controlFormConfig.Title.fieldId}
        label={controlFormConfig.Title.formLabel}
        description={st('fields.Title_help')}
        placeholder={st('fields.Title_placeholder')}
        control={control}
        onSelect={(e) => {
          autoPopulateDescription(e.detail.selectedOption);
        }}
        options={[
          {
            // TODO: missing translation
            value: 'Created controls',
            label: st('title_groups.createdControls'),
            options: existingControlOptions,
          },
          {
            // TODO: missing translation
            value: 'Library',
            label: st('title_groups.library'),
            options: controlLibraryOptions,
          },
        ]}
        disabled={readOnly}
      />
      <ControlledTextarea
        defaultRequired={true}
        key={'description'}
        name={controlFormConfig.Description.fieldId}
        testId={'description'}
        label={controlFormConfig.Description.formLabel}
        description={st('fields.Description_help')}
        placeholder={st('fields.Description_placeholder')}
        control={control}
        disabled={readOnly}
        additionalPrompts={[
          {
            id: PromptId.GenerateAControlDescription,
            text: t('textInference.general.generateAControlDescription'),
            altPromptText: title,
          },
        ]}
      />
      <ControlledGroupAndUserContributorMultiSelect
        key={'owners'}
        forceRequired={true}
        control={control}
        includeGroups={true}
        label={controlFormConfig.Owners.formLabel}
        description={st('fields.Owner_help')}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        name={controlFormConfig.Owners.fieldId}
        testId={'owners'}
        placeholder={t('fields.Owner_placeholder')}
        disabled={readOnly}
      />
      <ControlledGroupAndUserContributorMultiSelect
        key={'contributors'}
        testId={'contributors'}
        control={control}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Contributor}
        label={controlFormConfig.Contributors.formLabel}
        description={st('fields.Contributor_help')}
        name={controlFormConfig.Contributors.fieldId}
        placeholder={t('fields.Contributor_placeholder')}
        disabled={readOnly}
      />

      <TagSelector
        name={controlFormConfig.tags.fieldId}
        label={controlFormConfig.tags.formLabel}
        key={'tags'}
        testId={'tags'}
        control={control}
        disabled={readOnly}
      />
      <DepartmentSelector
        key={'departments'}
        testId={'departments'}
        name={controlFormConfig.departments.fieldId}
        label={controlFormConfig.departments.formLabel}
        control={control}
        disabled={readOnly}
      />

      <TestScheduleFields
        key={'testConfigFields'}
        control={control}
        readOnly={false}
        latestTestDate={latestTestDate ?? null}
        manualNextTestDueName={'schedule.ManualDueDate'}
        testFrequencyName={'schedule.Frequency'}
        testTimeToCompleteValueName={'schedule.TimeToCompleteValue'}
        testScheduleStartDateName={'schedule.StartDate'}
        testTimeToCompleteUnitName={'schedule.TimeToCompleteUnit'}
      />
    </CustomisableFieldWrapper>
  );
};

export default ControlFormFields;
