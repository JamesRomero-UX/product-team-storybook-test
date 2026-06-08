import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';
import { Icon } from '../icon';
import type { IconName } from '../icon/iconMap';
import { badgeIconVariantMap, checkBadgeVariants } from './variants';

/**
 * A small badge component that displays an icon. The icon is a configured preset based on the variant or can be given a specific icon by passing an icon name.
 *
 * @param variant - The variant of the badge icon, which determines the background color and default icon. If an icon is not provided, the icon will be determined by the variant using the badgeIconVariantMap.
 * @param icon - (Optional) A custom icon to display in the badge. This will override the preconfigured icon for the chosen variant.
 * @param className - Additional tailwind classes to apply to the badge icon
 * @param props - Additional props to pass to the span
 * @returns A badge icon component
 */
export const BadgeIcon = ({
  className,
  variant = 'success',
  icon,
  ...props
}: ComponentProps<'span'> &
  VariantProps<typeof checkBadgeVariants> & { icon?: IconName }) => {
  const iconName: IconName =
    icon || badgeIconVariantMap[variant as keyof typeof checkBadgeVariants];

  return (
    <span className={cn(checkBadgeVariants({ variant }), className)} {...props}>
      <Icon name={iconName} size={'xs'} />
    </span>
  );
};
