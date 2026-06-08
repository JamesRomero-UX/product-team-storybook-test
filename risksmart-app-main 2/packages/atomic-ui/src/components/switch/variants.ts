import { cva } from 'class-variance-authority';

export const size = {
  sm: 'h-[16px] w-[24px] rounded-2xl',
  md: 'h-[18px] w-[32px]',
  lg: 'h-[24px] w-[48px]',
} as const;

export const switchVariants = cva(
  `hover:cursor-pointer data-[checked]:bg-secondary data-[unchecked]:bg-primary-hover focus-visible:ring-[3px] focus-visible:ring-secondary-focus shrink-0 rounded-full peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-[disabled]:cursor-not-allowed data-[disabled]:data-[unchecked]:bg-muted data-[disabled]:data-[checked]:bg-secondary/40 shadow-inner`,
  {
    variants: {
      size,
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

export const switchThumbVariants = cva(
  `bg-neutral dark:data-[unchecked]:bg-neutral-foreground dark:data-[checked]:bg-primary-foreground rounded-full pointer-events-none block ring-0 transition-transform shadow-md`,
  {
    variants: {
      size: {
        sm: 'size-[12px] data-[unchecked]:translate-x-[2px] data-[checked]:translate-x-[10px]',
        md: 'size-[14px] data-[unchecked]:translate-x-[2px] data-[checked]:translate-x-[16px]',
        lg: 'size-[20px] data-[unchecked]:translate-x-[2px] data-[checked]:translate-x-[26px]',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);
