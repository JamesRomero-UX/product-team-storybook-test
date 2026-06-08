import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook, waitFor } from '@testing-library/react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { useFormCustomisation } from './useFormCustomisation';

describe('useFormCustomisation', () => {
  const providers: Providers[] = ['graphql', 'features'];

  type FormFieldConfiguration =
    GetFormCustomisationQuery['form_field_configuration'][number];
  const buildFormFieldConfiguration = (
    overrides: Partial<FormFieldConfiguration>
  ): FormFieldConfiguration => ({
    FieldId: '',
    FormConfigurationParentType: Parent_Type_Enum.Cause,
    Label: null,
    Hidden: false,
    Required: false,
    ReadOnly: false,
    Description: null,
    DefaultValue: null,
    Conditions: null,
    ...overrides,
  });

  describe('getFieldLabel', () => {
    it('should return the default standard field label when there is no customisation', async () => {
      const formId = Parent_Type_Enum.Cause;
      const { result } = renderHook(() => useFormCustomisation([formId]), {
        wrapper: getWrapper(
          [
            mockedGetFormCustomisationResponse([formId]),
            mockedGetOrganisation(),
          ],
          ...providers
        ),
      });
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const label = result.current.getStandardFieldLabel(formId, 'Title');
      expect(label).toBe('Title');
    });

    it('should return the customised form field label when there is customisation', async () => {
      const formId = Parent_Type_Enum.Cause;
      const { result } = renderHook(() => useFormCustomisation([formId]), {
        wrapper: getWrapper(
          [
            mockedGetFormCustomisationResponse([formId], {
              form_configuration: [],
              form_field_ordering: [],
              form_field_configuration: [
                buildFormFieldConfiguration({
                  FieldId: 'Title',
                  FormConfigurationParentType: formId,
                  Label: 'Custom Title',
                }),
              ],
            }),
            mockedGetOrganisation(),
          ],
          ...providers
        ),
      });
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const label = result.current.getStandardFieldLabel(formId, 'Title');
      expect(label).toBe('Custom Title');
    });
  });
});
