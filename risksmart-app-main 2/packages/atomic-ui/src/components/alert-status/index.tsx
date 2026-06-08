import { type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';
import { alertStatusVariants } from './variants';

function AlertStatus({
  className,
  variant = 'active',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof alertStatusVariants>) {
  return (
    <div
      data-slot={'alert-status'}
      className={cn(alertStatusVariants({ variant }), className)}
      {...props}
    />
  );
}

export { AlertStatus };
