import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getFormField, selectOptionByLabel } from 'src/testing/formHelpers';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetReportingFilterOptions } from 'src/testing/mock-data/mockedGetReportingFilterOptions';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { Props } from './CustomDatasourceForm';
import { CustomDatasourceForm } from './CustomDatasourceForm';

describe('CustomDatasourceForm', () => {
  const defaultProps: Props = {
    onSave: vi.fn(),
    onDismiss: vi.fn(),
    onPreview: vi.fn(),
    customAttributeSchemaLookup: {},
    readOnly: false,
    mode: 'create',
    formFieldConfigurations: null,
  };

  const providers: Providers[] = ['graphql', 'router', 'features', 'trpc'];

  const getDatasourceTreeTestId = (index: number[] = []) =>
    `dataSource${index.length > 0 ? '-' : ''}${index.join('-')}`;

  const getFieldSelectToggle = (label: string) =>
    createWrapper(
      within(fieldSelectionModal()!.getElement()).getByText(label)
        .parentElement!
    ).findToggle();

  const fieldSelectionModal = () => createWrapper().findModal();

  const getSelectFieldsButton = (index: number[] = []) =>
    screen.queryByTestId(`${getDatasourceTreeTestId(index)}-edit-columns`);

  const getTitleInput = () => screen.getByLabelText('Title');

  const getDataSourceSelectField = (
    container: HTMLElement,
    index: number[] = []
  ) => getFormField(container, getDatasourceTreeTestId(index));

  const getDataSourceSelect = (container: HTMLElement, index: number[] = []) =>
    getDataSourceSelectField(container, index)?.findControl()?.findSelect();

  const getSaveButton = () => screen.getByText('Save');

  const getDataSourceAddButton = (index: number[] = []) =>
    screen.getByTestId(`${getDatasourceTreeTestId(index)}-add`);

  const getLeftJoinCheckbox = (container: HTMLElement, index: number[] = []) =>
    createWrapper(container).findCheckbox(
      `[data-testid=${getDatasourceTreeTestId(index)}-leftJoin]`
    );

  const getFilters = (container: HTMLElement) =>
    getFormField(container, 'filters');

  const selectFields = async (labels: string[], index: number[] = []) => {
    await act(async () => {
      await getSelectFieldsButton(index)!.click();
    });

    await waitFor(() => {
      const saveButton = within(fieldSelectionModal()!.getElement()).getByText(
        'Save'
      );
      expect(saveButton).toBeDefined();
    });
    for (const label of labels) {
      await userEvent.click(
        getFieldSelectToggle(label)!.findNativeInput().getElement()
      );
    }
    await userEvent.click(
      within(fieldSelectionModal()!.getElement()).getByText('Save')
    );
  };

  it('renders without error', async () => {
    const { container } = render(<CustomDatasourceForm {...defaultProps} />, {
      wrapper: getWrapper(
        [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
        ...providers
      ),
    });
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });
  });

  it('fields and filters initially hidden', async () => {
    const { container } = render(<CustomDatasourceForm {...defaultProps} />, {
      wrapper: getWrapper(
        [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
        ...providers
      ),
    });
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });
    const selectFieldsButton = getSelectFieldsButton();
    expect(selectFieldsButton).toBeNull();

    const filters = getFilters(container);
    expect(filters).toBeNull();
  });

  it('filters shown after selecting risks data source', async () => {
    const { container } = render(<CustomDatasourceForm {...defaultProps} />, {
      wrapper: getWrapper(
        [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
        ...providers
      ),
    });
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelect(container);

    selectOptionByLabel(dataSourceSelect!, 'Risks');

    const selectFieldsButton = getSelectFieldsButton();
    expect(selectFieldsButton).not.toBeNull();

    const filters = getFilters(container);
    expect(filters).not.toBeNull();
  });

  it('Can submit form', async () => {
    const onSave = vi.fn();
    const { container } = render(
      <CustomDatasourceForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelect(container);

    selectOptionByLabel(dataSourceSelect!, 'Risks');

    await selectFields(['Risk name', 'Risk tier']);

    await act(async () => {
      await userEvent.type(getTitleInput(), 'Testing');
    });

    await userEvent.click(getSaveButton());
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        dataSource: {
          relationshipToParentIndex: null,
          children: [],
          type: 'risks',
          joinType: null,
          fields: [
            {
              fieldId: 'title',
            },
            {
              fieldId: 'tier',
            },
          ],
        },

        filters: {
          operation: 'and',
          tokenGroups: [],
          tokens: [],
        },
        title: 'Testing',
      });
    });
  });

  it('Changing data source clears previous data sources selected fields', async () => {
    const onSave = vi.fn();
    const { container } = render(
      <CustomDatasourceForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const parentDataSourceSelect = getDataSourceSelect(container);

    selectOptionByLabel(parentDataSourceSelect!, 'Risks');
    await selectFields(['Risk name', 'Risk tier']);

    await userEvent.click(getDataSourceAddButton());
    const childDataSourceSelect = getDataSourceSelect(container, [0]);
    selectOptionByLabel(childDataSourceSelect!, 'Controls (child)');

    await selectFields(['Control title', 'Control type'], [0]);
    selectOptionByLabel(childDataSourceSelect!, 'Actions (child)');

    await waitFor(async () => {
      await userEvent.type(getTitleInput(), 'Testing');
    });

    await userEvent.click(getSaveButton());
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        dataSource: {
          relationshipToParentIndex: null,
          children: [
            {
              type: 'actions',
              joinType: 'inner',
              relationshipToParentIndex: 'child',
              fields: [],
              children: [],
            },
          ],
          type: 'risks',
          joinType: null,
          fields: [
            {
              fieldId: 'title',
            },
            {
              fieldId: 'tier',
            },
          ],
        },

        filters: {
          operation: 'and',
          tokenGroups: [],
          tokens: [],
        },
        title: 'Testing',
      });
    });
  });

  it('fields NOT reset when adding a new data source', async () => {
    const onSave = vi.fn();
    const { container } = render(
      <CustomDatasourceForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelect(container);

    selectOptionByLabel(dataSourceSelect!, 'Risks');

    await selectFields(['Risk name', 'Risk tier']);

    await act(async () => {
      await userEvent.type(getTitleInput(), 'Testing');
    });

    await userEvent.click(getDataSourceAddButton());
    const childDataSourceSelect = getDataSourceSelect(container, [0]);
    selectOptionByLabel(childDataSourceSelect!, 'Controls (child)');

    await userEvent.click(getSaveButton());
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        dataSource: {
          children: [
            {
              type: 'controls',
              children: [],
              joinType: 'inner',
              fields: [],
              relationshipToParentIndex: 'child',
            },
          ],
          type: 'risks',
          relationshipToParentIndex: null,
          joinType: null,
          fields: [
            {
              fieldId: 'title',
            },
            {
              fieldId: 'tier',
            },
          ],
        },

        filters: {
          operation: 'and',
          tokenGroups: [],
          tokens: [],
        },
        title: 'Testing',
      });
    });
  });

  it('parent data source select disabled when adding a child', async () => {
    const onSave = vi.fn();
    const { container } = render(
      <CustomDatasourceForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'router',
          'features',
          'trpc'
        ),
      }
    );
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelect(container);

    selectOptionByLabel(dataSourceSelect!, 'Risks');

    await userEvent.click(getDataSourceAddButton());

    expect(dataSourceSelect?.isDisabled()).toBeTruthy();
  });

  it('option to include parents without children available on child data sources', async () => {
    const onSave = vi.fn();
    const { container } = render(
      <CustomDatasourceForm {...defaultProps} onSave={onSave} />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelect(container);

    selectOptionByLabel(dataSourceSelect!, 'Risks');

    await waitFor(async () => {
      await userEvent.type(getTitleInput(), 'Testing');
    });

    await userEvent.click(getDataSourceAddButton());
    const childDataSourceSelect = getDataSourceSelect(container, [0]);
    selectOptionByLabel(childDataSourceSelect!, 'Controls (child)');

    await selectFields(['Risk name']);
    await selectFields(['Control title'], [0]);

    const leftJoinCheckbox = getLeftJoinCheckbox(container, [0]);
    const leftJoinLabel = leftJoinCheckbox?.findLabel().getElement().innerText;
    expect(leftJoinLabel).toEqual('Return risks without controls');

    leftJoinCheckbox!.findNativeInput().click();

    await userEvent.click(getSaveButton());
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        dataSource: {
          children: [
            {
              relationshipToParentIndex: 'child',
              type: 'controls',
              children: [],
              joinType: 'left',
              fields: [
                {
                  fieldId: 'title',
                },
              ],
            },
          ],
          relationshipToParentIndex: null,
          type: 'risks',
          joinType: null,
          fields: [
            {
              fieldId: 'title',
            },
          ],
        },
        filters: {
          operation: 'and',
          tokenGroups: [],
          tokens: [],
        },
        title: 'Testing',
      });
    });
  });

  it('fields select shown after selecting actions data source', async () => {
    const { container } = render(<CustomDatasourceForm {...defaultProps} />, {
      wrapper: getWrapper(
        [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
        ...providers
      ),
    });
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelect(container);
    selectOptionByLabel(dataSourceSelect!, 'Actions');

    const selectFieldsButton = getSelectFieldsButton();
    expect(selectFieldsButton).not.toBeNull();
  });

  it('request made to retrieve filter options when filtering on risk title', async () => {
    const getReportingFilterOptionsMock = mockedGetReportingFilterOptions({
      filteringText: 'test1',
      limit: 50,
      offset: 0,
      fieldId: 'title',
      dataSourceType: 'risks',
    });
    const { container } = render(<CustomDatasourceForm {...defaultProps} />, {
      wrapper: getWrapper(
        [
          mockedGetOrganisationModuleResponse(),
          mockedGetOrganisation(),
          getReportingFilterOptionsMock,
        ],
        ...providers
      ),
    });
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelect(container);

    selectOptionByLabel(dataSourceSelect!, 'Risks');

    const filters = getFilters(container);
    expect(filters).not.toBeNull();
    const propertyFilter = filters?.findControl()?.findPropertyFilter();
    propertyFilter?.setInputValue('Risks / Risk name=test1');
    await waitFor(() =>
      expect(getReportingFilterOptionsMock.newData).toHaveBeenCalled()
    );
  });

  it('data sources disabled when mode=update to prevent breaking widgets using the custom data source', async () => {
    const { container } = render(
      <CustomDatasourceForm
        {...defaultProps}
        mode={'update'}
        values={{
          title: 'Custom datasource 1',
          filters: { operation: 'and', tokens: [], tokenGroups: [] },
          dataSource: {
            type: 'risks',
            children: [],
            fields: [{ fieldId: 'title' }],
          },
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelectField(container)
      ?.findControl()
      ?.findSelect();
    expect(dataSourceSelect?.isDisabled()).toEqual(true);
  });

  it('data sources enabled when mode=create', async () => {
    const { container } = render(
      <CustomDatasourceForm
        {...defaultProps}
        mode={'create'}
        values={{
          title: 'Custom datasource 1',
          filters: { operation: 'and', tokens: [], tokenGroups: [] },
          dataSource: {
            type: 'risks',
            children: [],
            fields: [{ fieldId: 'title' }],
          },
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      const dataSourceSelect = getDataSourceSelectField(container);
      expect(dataSourceSelect).not.toBeNull();
    });

    const dataSourceSelect = getDataSourceSelectField(container)
      ?.findControl()
      ?.findSelect();
    expect(dataSourceSelect?.isDisabled()).toEqual(false);
  });
});
