import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PropsWithChildren } from 'react';

import style from './style.module.scss';

type Props = {
  id: string;
  isDraggable: boolean;
};

function DraggableField({
  id,
  isDraggable,
  children,
}: PropsWithChildren<Props>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !isDraggable,
    transition: {
      duration: 500,
      easing: 'ease',
    },
  });

  const transformStyle = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggable ? transition : undefined,
  };

  const dropZoneStyle = {
    transform: CSS.Transform.toString(transform),
  };

  const dragAttributes = isDraggable ? attributes : undefined;
  const dragListeners = isDraggable ? listeners : undefined;

  // When dragging, show a grey drop zone to indicate where the field will be dropped
  if (isDragging) {
    return (
      <div ref={setNodeRef} style={dropZoneStyle} className={'rounded-md'}>
        <div
          className={`bg-grey150 opacity-50 rounded-md ${
            isDraggable
              ? 'shadow-sm mb-3 border border-solid border-grey200 p-5'
              : ''
          }`}
          style={{ animation: 'fadeIn 200ms ease-in-out' }}
        >
          <div className={'flex-1 opacity-0'}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={transformStyle}
      className={'transition-colors rounded-md'}
    >
      <div
        className={`relative bg-white rounded-md flex items-center transition-shadow break-all z-0 ${
          isDraggable
            ? `shadow-sm mb-3 border border-solid border-grey200 p-5 ${style.grabbable}`
            : ''
        }`}
        {...dragAttributes}
        {...dragListeners}
      >
        <div className={`flex-1 ${style.children}`}>{children}</div>
      </div>
    </div>
  );
}

export default DraggableField;
