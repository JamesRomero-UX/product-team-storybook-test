import { cva } from 'class-variance-authority';

export const size = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

export const spinnerVariants = cva('animate-spin', {
  variants: {
    size,
  },
  defaultVariants: {
    size: 'md',
  },
});
