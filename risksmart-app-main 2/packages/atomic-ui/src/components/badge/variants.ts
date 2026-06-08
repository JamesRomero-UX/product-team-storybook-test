import { cva } from 'class-variance-authority';

export const variant = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  neutral: 'bg-neutral-hover text-neutral-foreground',
  muted: 'bg-muted-foreground text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

export type Variant = keyof typeof variant;
export type BorderVariant =
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'neutral';
export type NonBorderVariant = Exclude<Variant, BorderVariant>;

export const size = {
  // icon: 'size-4 rounded-full',
  sm: 'h-5 px-1.5 py-0.5 text-sm',
  md: 'h-6 px-2 py-0.5 text-base',
};

export const border = {
  false: 'border border-transparent',
  true: 'border border-solid',
};

export const badgeVariants = cva(
  'flex justify-center items-center font-normal rounded-sm gap-0.5',
  {
    variants: {
      variant,
      border,
      size,
    },
    defaultVariants: {
      variant: 'success',
      size: 'md',
    },
    compoundVariants: [
      {
        border: true,
        variant: 'destructive',
        class: 'bg-destructive-minimal border-destructive text-destructive',
      },
      {
        border: true,
        variant: 'warning',
        class: 'bg-warning-minimal border-warning text-warning',
      },
      {
        border: true,
        variant: 'success',
        class: 'bg-success-minimal border-success text-success',
      },
      {
        border: true,
        variant: 'secondary',
        class: 'bg-secondary-minimal border-secondary text-secondary',
      },
    ],
  }
);
