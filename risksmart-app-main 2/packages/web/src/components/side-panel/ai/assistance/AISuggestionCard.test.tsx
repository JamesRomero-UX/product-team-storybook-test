import {
  act,
  getByRole,
  getByText,
  render,
  screen,
} from '@testing-library/react';
import type { ReactNode } from 'react';

import type { CheckedColour } from '@/components/side-panel/ai/assistance/AISuggestionCard';
import { AISuggestionCard } from '@/components/side-panel/ai/assistance/AISuggestionCard';

let lastCheckedState = false;
let checkedId = '';

function onCheckChanged(id: string, checked: boolean): void {
  lastCheckedState = checked;
  checkedId = id;
}

interface SuggestionCardData {
  id?: string;
  tags?: ReactNode[];
  title?: string;
  subtitle?: string;
  description?: string;
  date?: string;
  createdBy?: string;
  checkedColour?: CheckedColour;
  onCheckedChanged?: (id: string, checked: boolean) => void;
  //no-dd-sa
  disabled?: boolean;
}

function renderCard(data?: SuggestionCardData) {
  render(
    <AISuggestionCard
      id={data?.id ?? '123'}
      tags={data?.tags ?? []}
      title={data?.title ?? 'title'}
      subtitle={data?.subtitle ?? 'subtitle'}
      description={data?.description ?? 'A description'}
      date={data?.date ?? '01/02/2003'}
      createdBy={data?.createdBy ?? 'AI'}
      checkedColour={data?.checkedColour ?? 'magenta'}
      onCheckedChanged={data?.onCheckedChanged ?? onCheckChanged}
      disabled={data?.disabled ?? false}
    ></AISuggestionCard>
  );
}

describe('AISuggestionCard', () => {
  beforeEach(() => {
    lastCheckedState = false;
    checkedId = '';
  });

  it('should apply all of the properties to the expected places', () => {
    renderCard();

    const component = screen.getByRole('listitem');

    expect(getByRole(component, 'checkbox').id).toBe('123');
    expect(getByText(component, 'title')).toBeInTheDocument();
    expect(getByText(component, 'subtitle')).toBeInTheDocument();
    expect(getByText(component, 'A description')).toBeInTheDocument();
    expect(getByText(component, '01/02/2003')).toBeInTheDocument();
    expect(getByText(component, 'Created by AI')).toBeInTheDocument();
  });

  it.each([
    {
      colour: 'teal',
      expectedBorderColour: 'border-grey200',
      expectedCheckboxAccentColour: 'accent-teal',
    },
    {
      colour: 'magenta',
      expectedBorderColour: 'border-grey200',
      expectedCheckboxAccentColour: 'accent-magenta',
    },
  ])(
    'should apply the expected border colour and checkbox accent colour when $colour is specified',
    ({ expectedBorderColour, colour, expectedCheckboxAccentColour }) => {
      renderCard({
        checkedColour: colour as CheckedColour,
      });

      const component = screen.getByRole('listitem');

      expect(component.className.includes(expectedBorderColour)).toBe(true);
      expect(
        getByRole(component, 'checkbox').className.includes(
          expectedCheckboxAccentColour
        )
      ).toBe(true);
    }
  );

  it.each([
    {
      colour: 'teal',
      expectedBorderColour: 'border-teal',
    },
    {
      colour: 'magenta',
      expectedBorderColour: 'border-magenta',
    },
  ])(
    'should apply the expected border colour when the card has been selected when configured to be $colour',
    async ({ expectedBorderColour, colour }) => {
      renderCard({
        checkedColour: colour as CheckedColour,
      });

      const component = screen.getByRole('listitem');

      await act(async () => {
        component.click();
      });

      expect(component.className.includes(expectedBorderColour)).toBe(true);
    }
  );

  it('should raise an event when the card is clicked', async () => {
    renderCard();

    const component = screen.getByRole('listitem');

    await act(async () => {
      component.click();
    });

    expect(lastCheckedState).toBe(true);
    expect(checkedId).toBe('123');

    await act(async () => {
      component.click();
    });

    expect(lastCheckedState).toBe(false);
    expect(checkedId).toBe('123');
  });

  it('should prevent the user from toggling the checked state, by clicking the card, when it is disabled', async () => {
    renderCard({
      disabled: true,
    });

    const component = screen.getByRole('listitem');

    await act(async () => {
      component.click();
    });

    expect(lastCheckedState).toBe(false);
    expect(checkedId).toBe('');
  });

  it('should prevent the user from toggling the checked state, by clicking the checkbox, when it is disabled', async () => {
    renderCard({
      disabled: true,
    });

    const component = screen.getByRole('checkbox');

    await act(async () => {
      component.click();
    });

    expect(lastCheckedState).toBe(false);
    expect(checkedId).toBe('');
  });
});
