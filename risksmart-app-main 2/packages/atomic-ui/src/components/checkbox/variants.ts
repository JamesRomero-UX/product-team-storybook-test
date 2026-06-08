import { cva } from 'class-variance-authority';

export const checkboxVariants = cva(
  `inline-flex items-center justify-center shrink-0 rounded border border-neutral-border bg-primary-foreground outline-none transition-colors hover:cursor-pointer
  focus-visible:ring-[3px] focus-visible:ring-secondary-focus
  data-[checked]:bg-secondary data-[checked]:border-secondary data-[checked]:text-primary-foreground
  data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted data-[disabled]:border-muted data-[disabled]:text-muted-foreground
  shadow-sm`,
  {
    variants: {
      size: {
        sm: 'size-[14px] rounded',
        md: 'size-[16px] rounded',
        lg: 'size-[20px] rounded-md',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const checkboxIndicatorVariants = cva(
  `flex items-center justify-center text-current`,
  {
    variants: {
      size: {
        sm: '[&>svg]:size-[10px]',
        md: '[&>svg]:size-[12px]',
        lg: '[&>svg]:size-[14px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);
