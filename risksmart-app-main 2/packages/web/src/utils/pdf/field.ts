import type { GetFormFieldOptionsByParentTypeQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { ContentText } from 'pdfmake/interfaces';

import { createLabel } from './label';

export const createField = (
  label: string,
  value: null | number | string | undefined
): [ContentText, ContentText] => [
  createLabel(label),
  { text: _.isNil(value) ? '-' : String(value), marginBottom: 5 },
];

export const createYesNoField = (
  label: string,
  value: boolean | null | undefined
): [ContentText, ContentText] =>
  createField(label, _.isNil(value) ? '-' : value ? 'Yes' : 'No');

export const createConfigurableField = (
  label: string,
  fieldId: string,
  value: null | number | string | undefined,
  config: GetFormFieldOptionsByParentTypeQuery['form_field_configuration']
) => {
  const field = config.find((f) => f.FieldId === fieldId);
  if (field?.Hidden) {
    return [];
  }

  return createField(label, value);
};
