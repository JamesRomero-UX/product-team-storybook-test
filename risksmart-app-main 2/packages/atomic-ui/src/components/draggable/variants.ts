import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

export const draggableItemVariants = cva(
  cn(
    'relative touch-none data-[dragging]:z-10',
    'hover:cursor-grab active:cursor-grabbing has-[[data-slot=draggable-drag-handle]]:hover:cursor-auto',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'
  )
);
