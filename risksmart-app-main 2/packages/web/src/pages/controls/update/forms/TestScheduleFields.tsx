import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import SimpleDateInput from '@risksmart-app/components/src/form/simple-date-input/SimpleDateInput';
import {
  getDueDate,
  getOverdueDate,
} from '@risksmart-app/shared/date/scheduleUtils';
import {
  Test_Frequency_Enum,
  Unit_Of_Time_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledSelect from 'src/components/form/controlled-select';

type Props<
  T extends FieldValues = FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
> = {
  control: Control<T>;
  testScheduleStartDateName: TName;
  manualNextTestDueName: TName;
  testFrequencyName: TName;
  testTimeToCompleteValueName: TName;
  testTimeToCompleteUnitName: TName;
  readOnly: boolean;
  latestTestDate: null | string;
};

const TestScheduleFields = <
  T extends FieldValues = FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
>({
  control,
  testFrequencyName,
  manualNextTestDueName,
  testTimeToCompleteValueName,
  testTimeToCompleteUnitName,
  readOnly,
  testScheduleStartDateName,
  latestTestDate,
}: Props<T, TName>) => {
  const { watch } = useFormContext<FieldValues>();
  const manualNextTestDate = watch(manualNextTestDueName);
  const testFrequencyValue = watch(testFrequencyName);
  const testScheduleStartValue = watch(testScheduleStartDateName);
  const testTimeToCompleteValue = watch(testTimeToCompleteValueName);
  const timeToCompleteUnitValue = watch(testTimeToCompleteUnitName);
  const { t: sst } = useTranslation(['common'], { keyPrefix: 'testSchedule' });
  const { t } = useTranslation(['common']);
  const frequency = t('frequency');
  const frequencyOptions = Object.keys(frequency).map((key) => ({
    value: key,
    label: frequency[key as keyof typeof frequency],
  }));
  const isAdHoc = testFrequencyValue === Test_Frequency_Enum.Adhoc;

  const nextTestDate = isAdHoc
    ? dayjs(manualNextTestDate).isValid()
      ? dayjs(manualNextTestDate).utc().toISOString()
      : undefined
    : getDueDate({
        startDate: testScheduleStartValue,
        frequency: testFrequencyValue,
        latestDate: latestTestDate,
      });

  const overDue = getOverdueDate({
    nextTestDate,
    timeToCompleteValue: testTimeToCompleteValue,
    timeToCompleteUnit: timeToCompleteUnitValue,
  });

  return (
    <div>
      <h3>{sst('headings.title')}</h3>
      {!isAdHoc && (
        <ControlledDatePicker
          testId={'testScheduleStartDate'}
          control={control}
          name={testScheduleStartDateName}
          label={sst('fields.startDate')}
          description={sst('fields.startDateHelp')}
          disabled={readOnly}
        />
      )}

      <ControlledSelect
        filteringType={'auto'}
        label={sst('fields.testFrequency')}
        name={testFrequencyName}
        description={sst('fields.testFrequencyHelp')}
        placeholder={sst('fields.testFrequencyPlaceholder')}
        control={control}
        addEmptyOption={true}
        options={frequencyOptions}
        testId={'testFrequency'}
        disabled={readOnly}
      />
      <ControlledInput
        label={sst('fields.timeToCompleteValue')}
        description={sst('fields.timeToCompleteValueHelp')}
        type={'number'}
        stretch={false}
        name={testTimeToCompleteValueName}
        control={control}
        forceRequired={true}
        disabled={readOnly}
        testId={'timeToCompleteValue'}
      />
      <ControlledSelect
        label={sst('fields.timeToCompleteUnit')}
        description={sst('fields.timeToCompleteUnitHelp')}
        name={testTimeToCompleteUnitName}
        control={control}
        forceRequired={true}
        disabled={readOnly}
        options={[
          { value: Unit_Of_Time_Enum.Day, label: t('unitOfTime.day_other') },
          {
            value: Unit_Of_Time_Enum.Week,
            label: t('unitOfTime.week_other'),
          },
        ]}
        testId={'timeToCompleteUnit'}
      />

      <div key={'nextTestDates'} className={'pb-5'}>
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          {!isAdHoc && (
            <FormField
              label={sst('fields.nextTestDue')}
              data-testid={'form-field-nextTestDue'}
            >
              <SimpleDateInput
                testId={'nextTestDue'}
                value={nextTestDate ?? ''}
                disabled={true}
              />
            </FormField>
          )}
          {isAdHoc && (
            <ControlledDatePicker
              control={control}
              name={manualNextTestDueName}
              testId={'nextTestDue'}
              label={sst('fields.nextTestDue')}
              description={sst('fields.nextTestDueHelp')}
              disabled={readOnly}
            />
          )}
          <FormField
            key={'nextTestOverdue'}
            data-testid={'form-field-nextTestOverdue'}
            label={sst('fields.nextTestOverdue')}
          >
            <SimpleDateInput
              testId={'nextTestOverdue'}
              value={overDue ?? ''}
              disabled={true}
            />
          </FormField>
        </SpaceBetween>
      </div>
    </div>
  );
};

export default TestScheduleFields;
