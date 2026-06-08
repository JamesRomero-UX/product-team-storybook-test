import { ChevronDown } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import type { FC } from 'react';

interface ChevronIconProps {
  isMenuOpen: boolean;
  textColor?: string;
}

export const ChevronIcon: FC<ChevronIconProps> = ({
  isMenuOpen,
  textColor = '',
}) => {
  return (
    <div className={'flex items-center'}>
      <ChevronDown
        className={clsx(
          'w-5 h-5 transition-transform duration-200 ease-out',
          isMenuOpen ? 'rotate-180' : 'rotate-0',
          textColor || 'text-white'
        )}
      />
    </div>
  );
};
