// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import type { PropertyFilterOperatorForm } from '@cloudscape-design/collection-hooks';
import Calendar from '@risk-smart/themed-cloudscape-components/calendar';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import SimpleDateInput from '@risksmart-app/components/src/form/simple-date-input/SimpleDateInput';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { DatePickerInput } from '../form/controlled-date-picker/ControlledDatePicker';

export const DateTimeForm: PropertyFilterOperatorForm<null | string> = ({
  filter,
  operator,
  value,
  onChange,
}) => {
  const safeValue = useMemo(
    () => (dayjs(value).isValid() ? value : null),
    [value]
  );
  // Using the most reasonable default time per operator.
  const defaultTime =
    operator === '<' || operator === '>=' ? undefined : '23:59:59';
  const [{ dateValue, timeValue }, setState] = useState(() => {
    return parseValue(safeValue ?? '', defaultTime);
  });

  const getDateTime = (date: string, time: string) =>
    date.trim() ? `${date}T${time || '00:00:00'}` : null;

  const onChangeDate = (dateValue: string): void => {
    setState((state) => ({ ...state, dateValue }));
    onChange(getDateTime(dateValue, timeValue));
  };

  // Parse value from filter text when it changes.
  useEffect(() => {
    if (filter) {
      setState(parseDateTimeFilter(filter.trim()));
    }
  }, [filter]);

  if (typeof filter === 'undefined') {
    return (
      <FormField description={'Date'}>
        <DatePickerInput
          value={safeValue ?? ''}
          onChange={(value) => onChange(value)}
        />
      </FormField>
    );
  }

  return (
    <div className={'date-time-form'} data-testid={'date-time-form'}>
      <FormField description={'Date'}>
        <SimpleDateInput value={dateValue} onChange={onChangeDate} />
      </FormField>

      <Calendar
        value={dateValue}
        locale={'en-EN'}
        i18nStrings={{
          previousMonthAriaLabel: 'Previous month',
          nextMonthAriaLabel: 'Next month',
          todayAriaLabel: 'Today',
        }}
        onChange={(event) => onChangeDate(event.detail.value)}
      />
    </div>
  );
};

function parseDateTimeFilter(filter: string): {
  dateValue: string;
  timeValue: string;
} {
  const regexDate = /^(\d\d\d\d(-|\/\d\d)?(-|\/\d\d)?)(T\d\d(:\d\d)?(:\d\d)?)?/;
  const dateTime = filter.match(regexDate)?.[0] || '';

  let [dateValue, timeValue = ''] = dateTime.split('T');
  const [year, month = '01', day = '01'] = dateValue.split(/-|\//);
  const [hours = '00', minutes = '00', seconds = '00'] = timeValue.split(':');
  dateValue = year.length === 4 ? `${year}-${month}-${day}` : '';
  timeValue = timeValue ? `${hours}:${minutes}:${seconds}` : '';

  const value = !timeValue ? dateValue : dateValue + 'T' + timeValue;

  return isValidIsoDate(value)
    ? { dateValue, timeValue }
    : { dateValue: '', timeValue: '' };
}

function isValidIsoDate(isoDate: Date | number | string): boolean {
  return !isNaN(new Date(isoDate).getTime());
}

function parseValue(
  value: string,
  defaultTime = ''
): { dateValue: string; timeValue: string } {
  const [datePart = '', timePart = ''] = (value ?? '').split('T');

  return { dateValue: datePart, timeValue: timePart || defaultTime };
}
