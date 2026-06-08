import { Reorder, useDragControls } from 'framer-motion';
import type { FC, ReactNode } from 'react';

import Button from '../button';

interface DraggableItemProps {
  value: unknown;
  deleteOption: (generatedId: string) => void;
  children: ReactNode;
  variant?: 'normal' | 'bordered';
}

export const DraggableItem: FC<DraggableItemProps> = ({
  value,
  deleteOption,
  children,
  variant = 'normal',
}) => {
  const controls = useDragControls();
  let className = '';

  if (variant === 'bordered') {
    className = 'border-solid border-1 border-grey rounded-md mb-4 pt-3';
  }

  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      className={`flex items-center gap-x-2 ${className}`}
    >
      <div onPointerDown={(e) => controls.start(e)}>
        <Button variant={'icon'} iconName={'drag-indicator'} />
      </div>
      <div className={'flex-grow'}>{children}</div>
      {deleteOption ? (
        <Button
          variant={'icon'}
          iconName={'close'}
          onClick={(e) => {
            e.stopPropagation();
            deleteOption(value as string);
          }}
        />
      ) : null}
    </Reorder.Item>
  );
};
