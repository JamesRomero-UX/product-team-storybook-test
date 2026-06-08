import clsx from 'clsx';
import type { FC } from 'react';

export type TagColour = 'teal' | 'grey' | 'green' | 'orange';

interface AISuggestionCardTagProps {
  text: string;
  color: TagColour;
}

export const AISuggestionCardTag: FC<AISuggestionCardTagProps> = ({
  text,
  color,
}) => {
  return (
    <span
      className={clsx(
        'rounded-lg py-1 px-2 border-solid border-2 mr-2',
        color === 'teal' && 'bg-teal border-teal bg-opacity-30 ',
        color === 'grey' &&
          'bg-grey500 border-grey500 bg-opacity-70 text-white',
        color === 'green' &&
          'bg-[#6DAC3F] border-[#6DAC3F] bg-opacity-20 text-green text-[#6DAC3F]',
        color === 'orange' &&
          'bg-orange border-orange bg-opacity-20 text-orange'
      )}
    >
      {text}
    </span>
  );
};
