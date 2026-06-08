import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Acceptance_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import type { AcceptanceFormDataFields } from './acceptanceSchema';

type Props = {
  readOnly?: boolean;
};

const AcceptanceFormFields: FC<Props> = ({ readOnly }) => {
  const { control, watch } = useFormContext<AcceptanceFormDataFields>();

  const { options } = useRating('acceptance_status');
  const acceptanceFormConfig = useFormConfig(Parent_Type_Enum.Acceptance);
  const updating = !!watch('Id');
  const approvalsEnabled = useIsModuleEnabled('approval');

  const statusOptions = options
    .map((option) => ({
      ...option,
      value: String(option.value),
    }))
    .filter((option) =>
      (
        [
          Acceptance_Status_Enum.Pending,
          Acceptance_Status_Enum.Open,
          Acceptance_Status_Enum.Closed,
          Acceptance_Status_Enum.Declined,
        ] as string[]
      ).includes(option.value)
    );
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'acceptances.fields',
  });

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        testId={'title'}
        forceRequired={true}
        disabled={readOnly}
        name={acceptanceFormConfig.Title.fieldId}
        label={acceptanceFormConfig.Title.formLabel}
        description={st('Title_help')}
        control={control}
        placeholder={st('Title_placeholder') ?? ''}
      />

      <ControlledDatePicker
        forceRequired={true}
        testId={'dateAcceptedFrom'}
        key={'dateAcceptedFrom'}
        name={acceptanceFormConfig.DateAcceptedFrom.fieldId}
        label={acceptanceFormConfig.DateAcceptedFrom.formLabel}
        description={st('DateAcceptedFrom_help')}
        control={control}
        disabled={readOnly}
      />

      <ControlledDatePicker
        forceRequired={true}
        testId={'dateAcceptedTo'}
        key={'dateAcceptedTo'}
        name={acceptanceFormConfig.DateAcceptedTo.fieldId}
        label={acceptanceFormConfig.DateAcceptedTo.formLabel}
        description={st('DateAcceptedTo_help')}
        control={control}
        disabled={readOnly}
      />
      {!approvalsEnabled && (
        <ControlledGroupAndUserSelect
          testId={'requestedBy'}
          key={'requestedBy'}
          name={acceptanceFormConfig.requestedBy.fieldId}
          label={acceptanceFormConfig.requestedBy.formLabel}
          description={st('requestedBy_help')}
          control={control}
          includeGroups={true}
          disabled={readOnly}
          addEmptyOption={true}
        />
      )}

      {!approvalsEnabled && (
        <ControlledGroupAndUserSelect
          testId={'approvedBy'}
          key={'approvedBy'}
          name={acceptanceFormConfig.approvedBy.fieldId}
          label={acceptanceFormConfig.approvedBy.formLabel}
          description={st('approvedBy_help')}
          control={control}
          includeGroups={true}
          disabled={readOnly}
          addEmptyOption={true}
        />
      )}

      <ConditionalField
        key={'status'}
        condition={updating || !approvalsEnabled}
      >
        <ControlledRadioGroup
          forceRequired={true}
          label={acceptanceFormConfig.Status.formLabel}
          testId={'status'}
          description={st('Status_help')}
          name={acceptanceFormConfig.Status.fieldId}
          control={control}
          transform={noTransform}
          items={statusOptions}
          disabled={readOnly}
        />
      </ConditionalField>

      <ControlledTextarea
        key={'details'}
        testId={'details'}
        defaultRequired={true}
        name={acceptanceFormConfig.Details.fieldId}
        label={acceptanceFormConfig.Details.formLabel}
        description={st('Details_help')}
        placeholder={st('Details_placeholder') ?? ''}
        control={control}
        disabled={readOnly}
      />

      <ControlledFileUpload
        key={'file'}
        testId={'attachFiles'}
        label={acceptanceFormConfig.files.formLabel}
        description={st('newFiles_help')}
        control={control}
        name={acceptanceFormConfig.files.fieldId}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default AcceptanceFormFields;
