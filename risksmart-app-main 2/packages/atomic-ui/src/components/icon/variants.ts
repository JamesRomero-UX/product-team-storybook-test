import { cva } from 'class-variance-authority';

export const variant = {
  default: 'text-inherit',
  primary: 'text-primary',
  secondary: 'text-secondary',
  destructive: 'text-destructive',
};

export const size = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

export const iconVariants = cva('inline-flex shrink-0 stroke-[1.5px]', {
  variants: {
    variant,
    size,
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
  compoundVariants: [
    {
      size: 'xs',
      class: 'stroke-2',
    },
    {
      size: 'lg',
      class: 'stroke-2',
    },
  ],
});
