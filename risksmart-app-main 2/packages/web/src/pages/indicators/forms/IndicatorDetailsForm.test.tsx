import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import {
  findCustomisableFormContent,
  getFormField,
} from 'src/testing/formHelpers';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { defaultMocks } from '../../../testing/mock-data';
import type { Props } from './IndicatorDetailsForm';
import IndicatorDetailsForm from './IndicatorDetailsForm';
import { TestIds } from './IndicatorDetailsFormFieldsTestIds';

vi.mock('@/utils/featureFlags');

describe('IndicatorDetailsForm', () => {
  const providers: Providers[] = [
    'router',
    'graphql',
    'notification',
    'features',
    'trpc',
  ];
  const defaultProps: Props = {
    onSave: vi.fn(),
    renderTemplate: (renderProps) => <PageWrapper {...renderProps} />,
  };

  const mocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Indicator]),
    mockedUserSearchPreferencesResponses(),
  ];

  const setType = (container: HTMLElement, value: 'number' | 'text') => {
    const typeField = getFormField(container, TestIds.Type);
    const typeSelect = typeField?.findControl()?.findSelect();
    typeSelect!.openDropdown();
    typeSelect!.selectOptionByValue(value);
  };

  it("should show an optional 'Files' field", async () => {
    const { container } = render(<IndicatorDetailsForm {...defaultProps} />, {
      wrapper: getWrapper([...mocks], ...providers),
    });
    await findCustomisableFormContent();
    const typeField = getFormField(container, TestIds.Files);
    expect(typeField?.findLabel()?.getElement().textContent?.trim()).toEqual(
      'Attach files (optional)'
    );
  });

  it("should show a 'Type' field", async () => {
    const { container } = render(<IndicatorDetailsForm {...defaultProps} />, {
      wrapper: getWrapper([...mocks], ...providers),
    });
    await findCustomisableFormContent();
    const typeField = getFormField(container, TestIds.Type);
    expect(typeField?.findLabel()?.getElement().textContent?.trim()).toEqual(
      'Indicator type'
    );
  });

  it.each([{ field: TestIds.TargetValueTxt }])(
    "should show a $field field when 'Type' is set to 'Text'",
    async ({ field }) => {
      const { container } = render(<IndicatorDetailsForm {...defaultProps} />, {
        wrapper: getWrapper([...mocks], ...providers),
      });
      await findCustomisableFormContent();

      setType(container, 'text');

      const formField = getFormField(container, field);
      expect(formField?.getElement()).toBeDefined();
    }
  );

  it.each([{ field: TestIds.TargetValueTxt }])(
    "should NOT show a $field field when 'Type' is set to 'Number'",
    async ({ field }) => {
      const { container } = render(<IndicatorDetailsForm {...defaultProps} />, {
        wrapper: getWrapper([...mocks], ...providers),
      });
      await findCustomisableFormContent();

      setType(container, 'number');

      const formField = getFormField(container, field);
      expect(formField?.getElement()).toBeUndefined();
    }
  );

  it.each([
    { field: TestIds.LowerTolerance },
    { field: TestIds.UpperTolerance },
    { field: TestIds.LowerAppetite },
    { field: TestIds.UpperAppetite },
  ])(
    "should show $field field when 'Type' is set to 'Number'",
    async ({ field }) => {
      const { container } = render(<IndicatorDetailsForm {...defaultProps} />, {
        wrapper: getWrapper([...mocks], ...providers),
      });
      await findCustomisableFormContent();
      setType(container, 'number');

      const formField = getFormField(container, field);
      expect(formField?.getElement()).toBeDefined();
    }
  );

  it.each([
    { field: TestIds.LowerTolerance },
    { field: TestIds.UpperTolerance },
    { field: TestIds.LowerAppetite },
    { field: TestIds.UpperAppetite },
  ])(
    "should NOT show $field field when 'Type' is set to 'Text'",
    async ({ field }) => {
      const { container } = render(<IndicatorDetailsForm {...defaultProps} />, {
        wrapper: getWrapper([...mocks], ...providers),
      });
      await findCustomisableFormContent();
      setType(container, 'text');

      const formField = getFormField(container, field);
      expect(formField?.getElement()).toBeUndefined();
    }
  );
});
