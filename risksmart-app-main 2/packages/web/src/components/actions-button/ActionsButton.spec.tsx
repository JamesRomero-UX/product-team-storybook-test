import type { ElementWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import type { ActionItem } from './ActionsButton';
import ActionsButton from './ActionsButton';

const createRender = (items: ActionItem[]) => {
  return render(<ActionsButton items={items} buttonText={'Actions'} />);
};

describe('ActionsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getDropdown = (container: ElementWrapper<Element>) => {
    const dropdown = container.findButtonDropdown();
    expect(dropdown).not.toBeNull();

    return dropdown;
  };

  const getItemLabels = (elements: Array<ElementWrapper>) => {
    const items: string[] = [];
    for (const item of elements) {
      items.push(item.getElement().textContent?.trim() ?? '');
    }

    return items;
  };

  it('shows correct items', async () => {
    const actionItems: ActionItem[] = [
      {
        text: 'Add widget',
        id: 'add_widget',
        onItemClick: vi.fn(),
      },
      {
        text: 'New',
        id: 'reset_dashboard',
        onItemClick: vi.fn(),
      },
      {
        text: 'Save as',
        id: 'save_as_dashboard',
        onItemClick: vi.fn(),
      },
      {
        text: 'Clear',
        id: 'clear',
        onItemClick: vi.fn(),
      },
      {
        text: 'Export',
        id: 'export_dashboard',
        onItemClick: vi.fn(),
      },
    ];

    const { container } = createRender(actionItems);

    const dropdown = await waitFor(() => getDropdown(createWrapper(container)));

    dropdown!.openDropdown();

    const itemLabels = getItemLabels(dropdown?.findItems() ?? []);

    expect(itemLabels).toEqual([
      'Add widget',
      'New',
      'Save as',
      'Clear',
      'Export',
    ]);
  });

  it('executes the correct function when an item is clicked', async () => {
    const actionItems: ActionItem[] = [
      {
        text: 'Add widget',
        id: 'add_widget',
        onItemClick: vi.fn(),
      },
      {
        text: 'New',
        id: 'reset_dashboard',
        onItemClick: vi.fn(),
      },
      {
        text: 'Save as',
        id: 'save_as_dashboard',
        onItemClick: vi.fn(),
      },
      {
        text: 'Clear',
        id: 'clear',
        onItemClick: vi.fn(),
      },
      {
        text: 'Export',
        id: 'export_dashboard',
        onItemClick: vi.fn(),
      },
    ];

    const { container } = createRender(actionItems);

    const dropdown = await waitFor(() => getDropdown(createWrapper(container)));
    const getItems = () => {
      return dropdown?.findItems();
    };

    const onAddWidgetSpy = vi.spyOn(actionItems[0], 'onItemClick');
    const onResetSpy = vi.spyOn(actionItems[1], 'onItemClick');
    const onSaveAsSpy = vi.spyOn(actionItems[2], 'onItemClick');
    const onClearSpy = vi.spyOn(actionItems[3], 'onItemClick');
    const onExportSpy = vi.spyOn(actionItems[4], 'onItemClick');

    // Add widget
    dropdown!.openDropdown();
    const item0 = getItems()?.[0];
    fireEvent.click(item0!.getElement());

    await waitFor(() => expect(onAddWidgetSpy).toHaveBeenCalled());

    // Reset
    dropdown!.openDropdown();
    const item1 = getItems()?.[1];
    fireEvent.click(item1!.getElement());

    await waitFor(() => expect(onResetSpy).toHaveBeenCalled());

    // Save as
    dropdown!.openDropdown();
    const item2 = getItems()?.[2];
    fireEvent.click(item2!.getElement());

    await waitFor(() => expect(onSaveAsSpy).toHaveBeenCalled());

    // Clear
    dropdown!.openDropdown();
    const item3 = getItems()?.[3];
    fireEvent.click(item3!.getElement());

    await waitFor(() => expect(onClearSpy).toHaveBeenCalled());

    // Export
    dropdown!.openDropdown();
    const item4 = getItems()?.[4];
    fireEvent.click(item4!.getElement());

    await waitFor(() => expect(onExportSpy).toHaveBeenCalled());
  });
});
