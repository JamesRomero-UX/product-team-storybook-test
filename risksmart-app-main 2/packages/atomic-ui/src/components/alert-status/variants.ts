import { cva } from 'class-variance-authority';

export const variant = {
  active: 'bg-secondary',
  inactive: 'bg-muted',
  warning: 'bg-warning',
  error: 'bg-destructive',
};

export const alertStatusVariants = cva('size-2 rounded-full', {
  variants: {
    variant,
  },
  defaultVariants: {
    variant: 'active',
  },
});
