import { render } from '@testing-library/react';

import type { TagColour } from '@/components/side-panel/ai/assistance/AISuggestionCardTag';
import { AISuggestionCardTag } from '@/components/side-panel/ai/assistance/AISuggestionCardTag';

describe('AISuggestionCardTag', () => {
  it.each([
    {
      colour: 'teal',
      expectedBorder: 'border-teal',
      expectedBackgroundColour: 'bg-teal',
      expectedBackgroundOpacity: 'bg-opacity-30',
    },
    {
      colour: 'grey',
      expectedBorder: 'border-grey',
      expectedBackgroundColour: 'bg-grey',
      expectedBackgroundOpacity: 'bg-opacity-70',
    },
    {
      colour: 'green',
      expectedBorder: 'border-[#6DAC3F]',
      expectedBackgroundColour: 'bg-[#6DAC3F]',
      expectedBackgroundOpacity: 'bg-opacity-20',
    },
    {
      colour: 'orange',
      expectedBorder: 'border-orange',
      expectedBackgroundColour: 'bg-orange',
      expectedBackgroundOpacity: 'bg-opacity-20',
    },
  ])(
    'should render the expected colours for $colour',
    ({
      colour,
      expectedBorder,
      expectedBackgroundColour,
      expectedBackgroundOpacity,
    }) => {
      render(
        <AISuggestionCardTag
          color={colour as TagColour}
          text={'Hello'}
        ></AISuggestionCardTag>
      );

      const component = document.querySelector('span')!;

      expect(component.className.includes(expectedBorder)).toBe(true);
      expect(component.className.includes(expectedBackgroundColour)).toBe(true);
      expect(component.className.includes(expectedBackgroundOpacity)).toBe(
        true
      );
    }
  );

  it('should render the text that is passed to it', () => {
    render(
      <AISuggestionCardTag color={'teal'} text={'Hello'}></AISuggestionCardTag>
    );

    const component = document.querySelector('span')!;

    expect(component.innerText).toBe('Hello');
  });
});
