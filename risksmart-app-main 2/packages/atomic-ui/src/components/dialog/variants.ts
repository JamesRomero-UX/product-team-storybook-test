import { cva } from 'class-variance-authority';

export const size = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'w-[80vw]',
};

export const dialogVariants = cva(
  'bg-neutral text-neutral-foreground border border-solid border-neutral-border rounded-xl shadow-xl p-6 flex flex-col outline-none',
  {
    variants: {
      size,
    },
    defaultVariants: {
      size: 'md',
    },
  }
);
