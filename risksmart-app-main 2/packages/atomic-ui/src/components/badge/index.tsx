import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import type { size as sizeVariants } from './variants';
import {
  badgeVariants,
  type BorderVariant,
  type NonBorderVariant,
} from './variants';

type Size = keyof typeof sizeVariants;

type BadgeVariantProps =
  | { variant?: BorderVariant; border?: boolean }
  | { variant?: NonBorderVariant; border?: false };

type BadgeProps = useRender.ComponentProps<'span'> &
  Omit<VariantProps<typeof badgeVariants>, 'variant' | 'border'> &
  BadgeVariantProps & { size?: Size };

export const Badge = ({
  className,
  variant = 'success',
  size = 'md',
  border = false,
  render,
  ...props
}: BadgeProps) => {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ size, border, variant, className })),
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
};
