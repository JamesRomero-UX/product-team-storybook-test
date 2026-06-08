import { cva } from 'class-variance-authority';

import type { IconMap } from '../icon/iconMap';

export const badgeIconVariantMap: Record<
  keyof typeof variant,
  keyof typeof IconMap
> = {
  success: 'check',
  neutral: 'minus',
  warning: 'alert-triangle',
  destructive: 'x',
};

export const variant = {
  success: 'bg-success text-success-foreground',
  neutral: 'bg-muted text-muted-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

export const checkBadgeVariants = cva(
  'size-5 flex justify-center items-center rounded-full',
  {
    variants: {
      variant,
    },
    defaultVariants: {
      variant: 'success',
    },
  }
);
