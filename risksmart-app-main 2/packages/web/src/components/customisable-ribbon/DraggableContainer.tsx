import Icon from '@risk-smart/themed-cloudscape-components/icon';
import { motion, Reorder, useDragControls } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { useRef, useState } from 'react';

type Props = {
  value: string;
  bounceDamping: number;
};

export const DraggableContainer = ({
  value,
  bounceDamping,
  children,
}: PropsWithChildren<Props>) => {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  return (
    <motion.div
      ref={ref}
      className={`${dragging ? 'bg-off_white select-none' : ''} transition-colors rounded-md`}
    >
      <Reorder.Item
        drag={true}
        dragListener={false}
        dragControls={dragControls}
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping,
        }}
        transition={{
          duration: 0.15,
          type: 'tween',
          ease: 'easeInOut',
        }}
        className={`relative bg-white rounded-md flex items-start gap-x-4 transition-shadow break-all ${
          dragging
            ? 'z-50  border-2 border-teal cursor-grabbing !shadow-xl select-none'
            : 'z-0'
        } shadow-sm border border-solid border-grey200 p-5`}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setDragging(false)}
        value={value}
      >
        <div
          className={'flex h-full hover:cursor-grab active:cursor-grabbing'}
          onPointerDown={(event) => {
            dragControls.start(event);
          }}
        >
          <Icon name={'drag-indicator'} />
        </div>
        <div className={`flex-1 select-none`}>{children}</div>
      </Reorder.Item>
    </motion.div>
  );
};
