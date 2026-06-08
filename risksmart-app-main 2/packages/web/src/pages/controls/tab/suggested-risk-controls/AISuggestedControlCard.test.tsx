import type { ControlType } from '@risksmart-app/domain/src/types/consts';
import {
  act,
  getByRole,
  getByText,
  render,
  screen,
} from '@testing-library/react';
import { AISuggestedControlCard } from 'src/pages/controls/tab/suggested-risk-controls/AISuggestedControlCard';

let lastCheckedState = false;
let checkedId = '';

function onCheckChanged(id: string, checked: boolean): void {
  lastCheckedState = checked;
  checkedId = id;
}

interface SuggestionCardData {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
  createdBy?: string;
  onCheckedChanged?: (id: string, checked: boolean) => void;
  //no-dd-sa
  disabled?: boolean;
  isExisting?: boolean;
  controlType?: ControlType;
  confidenceScore?: number;
}

function renderCard(data?: SuggestionCardData) {
  render(
    <AISuggestedControlCard
      id={data?.id ?? '123'}
      title={data?.title ?? 'title'}
      description={data?.description ?? 'A description'}
      date={data?.date ?? '01/02/2003'}
      createdBy={data?.createdBy ?? 'AI'}
      onCheckedChanged={data?.onCheckedChanged ?? onCheckChanged}
      disabled={data?.disabled ?? false}
      isExisting={data?.isExisting ?? false}
      controlType={data?.controlType ?? 'Detective'}
      confidenceScore={data?.confidenceScore ?? 99}
    ></AISuggestedControlCard>
  );
}

describe('AISuggestedControlCard', () => {
  it('should apply all of the properties to the expected places', () => {
    renderCard();

    const component = screen.getByRole('listitem');

    expect(getByRole(component, 'checkbox').id).toBe('123');
    expect(getByText(component, 'title')).toBeInTheDocument();
    expect(getByText(component, 'A description')).toBeInTheDocument();
    expect(getByText(component, '01/02/2003')).toBeInTheDocument();
    expect(getByText(component, 'Created by AI')).toBeInTheDocument();
    expect(getByText(component, 'Confidence level 99%')).toBeInTheDocument();
    expect(getByText(component, 'Detective')).toBeInTheDocument();
  });

  it('should add the existing tag for existing controls', () => {
    renderCard({
      isExisting: true,
    });

    const component = screen.getByRole('listitem');

    expect(getByText(component, 'Existing')).toBeInTheDocument();
  });

  it.each([
    {
      score: 99,
      expectedColour: '[#6DAC3F]',
    },
    {
      score: 81,
      expectedColour: '[#6DAC3F]',
    },
    {
      score: 80,
      expectedColour: 'orange',
    },
    {
      score: 79,
      expectedColour: 'orange',
    },
    {
      score: 50,
      expectedColour: 'orange',
    },
  ])(
    'should adjust the tag colour for the confidence score depending its value - $score',
    ({ expectedColour, score }) => {
      renderCard({
        confidenceScore: score,
      });

      const component = screen.getByRole('listitem');

      expect(
        getByText(component, `Confidence level ${score}%`).className.includes(
          `bg-${expectedColour}`
        )
      ).toBe(true);
    }
  );

  it('should raise the onCheckedChanged when the card is clicked', async () => {
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

  it('should show the user that the card is disabled', () => {
    renderCard({
      disabled: true,
    });

    const component = screen.getByRole('listitem');

    expect(component.className.includes('cursor-not-allowed')).toBe(true);
  });
});
