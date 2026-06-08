import Box from '@risk-smart/themed-cloudscape-components/box';
import { Check } from '@untitled-ui/icons-react';
import type { FC } from 'react';

interface EntityOptionProps {
  option: { value: string | undefined; label: string };
  isSelected: boolean;
  onSelect: (value: string | undefined) => void;
}

export const EntityOption: FC<EntityOptionProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  return (
    <Box>
      <button
        onClick={() => onSelect(option.value)}
        className={
          'flex items-center justify-between rounded-md w-full ' +
          'border-none hover:cursor-pointer bg-transparent hover:bg-navy_light ' +
          'text-left px-4 py-3 gap-3 text-sm transition-colors whitespace-nowrap'
        }
      >
        <div
          className={`transition-colors max-w-[184px] overflow-hidden overflow-ellipsis ${isSelected ? 'text-teal font-bold' : 'text-white font-normal'}`}
        >
          {option.label}
        </div>
        <Check
          className={`w-5 h-5 ${isSelected ? 'text-teal font-bold' : 'text-transparent font-normal'}`}
        />
      </button>
    </Box>
  );
};
