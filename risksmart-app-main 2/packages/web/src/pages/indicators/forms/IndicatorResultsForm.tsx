import {
  Indicator_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FieldGroup from 'src/components/form/form/customisable-form/FieldGroup';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { IndicatorResultFormFields } from './indicatorResultSchema';

interface Props {
  readOnly?: boolean;
  indicatorType: Indicator_Type_Enum | undefined;
}

const enum TestIds {
  Files = 'files',
}

const IndicatorResultsForm: FC<Props> = ({ readOnly, indicatorType }) => {
  const { control } = useFormContext<IndicatorResultFormFields>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'indicator_results.fields',
  });
  const formConfig = useFormConfig(Parent_Type_Enum.IndicatorResult);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <FieldGroup key={'resultsValuesGroup'}>
        {indicatorType === Indicator_Type_Enum.Text && (
          <ControlledInput
            forceRequired={true}
            key={'targetValueTxt'}
            testId={'result'}
            name={formConfig.TargetValueTxt.fieldId}
            label={formConfig.TargetValueTxt.formLabel}
            control={control}
            placeholder={st('result_placeholder')}
            disabled={readOnly}
          />
        )}
        {indicatorType === Indicator_Type_Enum.Number && (
          <ControlledInput
            forceRequired={true}
            key={'targetValueNum'}
            testId={'result'}
            name={formConfig.TargetValueNum.fieldId}
            label={formConfig.TargetValueNum.formLabel}
            control={control}
            placeholder={st('result_placeholder')}
            disabled={readOnly}
            type={'number'}
          />
        )}
      </FieldGroup>
      <ControlledDatePicker
        forceRequired={true}
        key={'resultDate'}
        testId={'resultDate'}
        name={formConfig.ResultDate.fieldId}
        label={formConfig.ResultDate.formLabel}
        control={control}
        disabled={readOnly}
      />
      <ControlledTextarea
        key={'description'}
        name={formConfig.Description.fieldId}
        testId={'description'}
        label={formConfig.Description.formLabel}
        placeholder={st('description_placeholder')}
        control={control}
        disabled={readOnly}
      />

      <ControlledFileUpload
        key={'attachFiles'}
        label={formConfig.files.formLabel}
        control={control}
        name={formConfig.files.fieldId}
        testId={TestIds.Files}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default IndicatorResultsForm;
