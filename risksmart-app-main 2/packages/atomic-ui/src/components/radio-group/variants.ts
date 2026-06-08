import { cva } from 'class-variance-authority';

export const radioVariants = cva(
  `inline-flex items-center justify-center shrink-0 rounded-full border border-neutral-border bg-primary-foreground outline-none transition-colors hover:cursor-pointer
  focus-visible:ring-[3px] focus-visible:ring-secondary-focus
  data-[checked]:border-secondary
  data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted data-[disabled]:border-muted data-[disabled]:text-muted-foreground
  shadow-sm`,
  {
    variants: {
      size: {
        sm: 'size-[14px]',
        md: 'size-[16px]',
        lg: 'size-[20px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const radioIndicatorVariants = cva(
  'rounded-full bg-secondary transition-transform data-[starting-style]:scale-0',
  {
    variants: {
      size: {
        sm: 'size-[8px]',
        md: 'size-[10px]',
        lg: 'size-[12px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const radioGroupVariants = cva('flex', {
  variants: {
    orientation: {
      vertical: 'flex-col gap-2',
      horizontal: 'flex-row gap-4',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});
