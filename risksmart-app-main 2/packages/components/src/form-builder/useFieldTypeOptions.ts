import { useTranslation } from 'react-i18next';

import { FieldOptionType } from './types';

type UseFieldTypeOptionsReturnType = {
  [key in FieldOptionType]: { value: FieldOptionType; label: string };
};

export const useFieldTypeOptions = (): UseFieldTypeOptionsReturnType => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.fieldTypes',
  });

  return {
    text: { value: FieldOptionType.Text, label: t(FieldOptionType.Text) },
    textArea: {
      value: FieldOptionType.TextArea,
      label: t(FieldOptionType.TextArea),
    },
    number: { value: FieldOptionType.Number, label: t(FieldOptionType.Number) },
    url: { value: FieldOptionType.Url, label: t(FieldOptionType.Url) },
    date: { value: FieldOptionType.Date, label: t(FieldOptionType.Date) },
    radio: { value: FieldOptionType.Radio, label: t(FieldOptionType.Radio) },
    dropdown: {
      value: FieldOptionType.Dropdown,
      label: t(FieldOptionType.Dropdown),
    },
    multiselect: {
      value: FieldOptionType.Multiselect,
      label: t(FieldOptionType.Multiselect),
    },
  };
};
