import type { FC } from 'react';

import { EntityOption } from './EntityOption';

interface EntityListProps {
  options: { value: string | undefined; label: string }[];
  selectedValue: string | undefined;
  onSelect: (value: string | undefined) => void;
}

export const EntityList: FC<EntityListProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const isSelected = (optionValue: string | undefined) => {
    return optionValue === selectedValue;
  };

  return (
    <div className={'flex flex-col gap-1 p-3'}>
      {options.map((option) => (
        <EntityOption
          key={option.value || 'global'}
          option={option}
          isSelected={isSelected(option.value)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
