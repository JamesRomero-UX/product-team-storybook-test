import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Action_Status_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FieldGroup from 'src/components/form/form/customisable-form/FieldGroup';
import TagSelector from 'src/components/form/tag-selector';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { TestIds } from './ActionFormFieldsTestIds';
import type { ActionFormFieldData } from './actionsSchema';

type Props = {
  readonly?: boolean;
};

const ActionFormFields: FC<Props> = ({ readonly }) => {
  const { control, watch, setValue } = useFormContext<ActionFormFieldData>();

  const actionFormConfig = useFormConfig(Parent_Type_Enum.Action);
  const { options } = useRating('action_status');
  const statusOptions = options
    .filter(
      (option) =>
        option.value &&
        Object.values(Action_Status_Enum).includes(
          option.value as Action_Status_Enum
        )
    )
    .map((option) => ({
      ...option,
      value: String(option.value),
    }));
  const status = watch('Status');

  const { t: st } = useTranslation(['common'], { keyPrefix: 'actions' });
  const { t } = useTranslation(['common']);

  return (
    <CustomisableFieldWrapper readOnly={readonly}>
      <ControlledInput
        testId={TestIds.Title}
        forceRequired={true}
        key={'title'}
        name={actionFormConfig.Title.fieldId}
        label={actionFormConfig.Title.formLabel}
        control={control}
        placeholder={st('fields.Title_placeholder') ?? ''}
        description={st('fields.Title_help')}
        disabled={readonly}
      />

      <ControlledTextarea
        testId={TestIds.Description}
        key={'description'}
        name={actionFormConfig.Description.fieldId}
        defaultRequired={true}
        label={actionFormConfig.Description.formLabel}
        placeholder={st('fields.Description_placeholder') ?? ''}
        control={control}
        description={st('fields.Description_help')}
        disabled={readonly}
      />
      <ControlledGroupAndUserContributorMultiSelect
        key={'owners'}
        testId={TestIds.Owners}
        forceRequired={true}
        control={control}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        includeGroups={true}
        label={actionFormConfig.Owners.formLabel}
        name={actionFormConfig.Owners.fieldId}
        placeholder={t('fields.Owner_placeholder')}
        description={st('fields.Owner_help')}
        disabled={readonly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        key={'contributors'}
        testId={TestIds.Contributors}
        control={control}
        contributorType={Contributor_Type_Enum.Contributor}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        label={actionFormConfig.Contributors.formLabel}
        name={actionFormConfig.Contributors.fieldId}
        placeholder={t('fields.Contributor_placeholder')}
        description={st('fields.Contributor_help')}
        disabled={readonly}
      />

      <FieldGroup key={'statusAndDates'}>
        <ControlledRadioGroup
          key={'status'}
          testId={TestIds.Status}
          forceRequired={true}
          label={actionFormConfig.Status.formLabel}
          description={st('fields.Status_help')}
          name={actionFormConfig.Status.fieldId}
          onChange={(value) => {
            if (value != Action_Status_Enum.Closed) {
              setValue('ClosedDate', null);
            }
          }}
          control={control}
          transform={noTransform}
          items={statusOptions}
          disabled={readonly}
        />

        <ControlledDatePicker
          key={'dateRaised'}
          testId={TestIds.DateRaised}
          forceRequired={true}
          name={actionFormConfig.DateRaised.fieldId}
          label={actionFormConfig.DateRaised.formLabel}
          description={st('fields.DateRaised_help')}
          control={control}
          disabled={readonly}
        />

        <ControlledDatePicker
          key={'dateDue'}
          testId={'targetCloseDate'}
          forceRequired={true}
          name={actionFormConfig.DateDue.fieldId}
          label={actionFormConfig.DateDue.formLabel}
          description={st('fields.TargetCloseDate_help')}
          control={control}
          disabled={readonly}
        />

        <ConditionalField
          condition={status === Action_Status_Enum.Closed}
          key={'closedDate'}
        >
          <ControlledDatePicker
            key={'closedDate'}
            name={actionFormConfig.ClosedDate.fieldId}
            testId={'closedDate'}
            forceRequired
            label={actionFormConfig.ClosedDate.formLabel}
            description={st('fields.ClosedDate_help')}
            control={control}
            disabled={readonly}
          />
        </ConditionalField>
      </FieldGroup>

      <ControlledRating
        key={'priority'}
        addEmptyOption={true}
        testId={TestIds.Priority}
        defaultRequired
        name={actionFormConfig.Priority.fieldId}
        label={actionFormConfig.Priority.formLabel}
        type={actionFormConfig.Priority.displayType.ratingKey}
        placeholder={'Select'}
        control={control}
        description={st('fields.Priority_help')}
        disabled={readonly}
      />

      <ControlledFileUpload
        key={'attachFiles'}
        testId={TestIds.AttachFiles}
        label={actionFormConfig.files.formLabel}
        description={t('fields.newFiles_help')}
        control={control}
        name={actionFormConfig.files.fieldId}
        disabled={readonly}
      />

      <TagSelector
        key={'tags'}
        name={actionFormConfig.tags.fieldId}
        label={actionFormConfig.tags.formLabel}
        testId={TestIds.Tags}
        control={control}
        disabled={readonly}
      />
      <DepartmentSelector
        key={'departments'}
        label={actionFormConfig.departments.formLabel}
        testId={TestIds.Departments}
        name={actionFormConfig.departments.fieldId}
        control={control}
        disabled={readonly}
      />
    </CustomisableFieldWrapper>
  );
};

export default ActionFormFields;
