import type { VariantProps } from 'class-variance-authority';
import type { JSX } from 'react';
import { type ComponentPropsWithoutRef } from 'react';

import { cn } from '../../lib/utils';
import { IconMap, type IconName } from './iconMap';
import { iconVariants } from './variants';

export type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'name'> &
  VariantProps<typeof iconVariants> & {
    name: IconName;
  };

/**
 * An SVG icon component to display various icons
 * 
 * @param name - The name of the icon to display, corresponding to an SVG in the untitled-ui library
 * @param variant - The pre-configured icon style to apply (default: 'default')
 * @param size - The size of the icon (default: 'md')
 * @param weight - The stroke weight of the icon (default: 'regular')
 * @param className - Additional CSS classes to apply to the icon
 * @param rest - Any additional props to pass to the underlying SVG element
 
 * @returns {JSX.Element} The rendered Icon component
 */
export const Icon = ({
  name,
  variant = 'default',
  size = 'lg',
  className,
  ...rest
}: IconProps): JSX.Element => {
  const DynamicIcon = IconMap[name as IconName];

  return (
    <DynamicIcon
      className={cn(iconVariants({ variant, size, className }))}
      {...rest}
    />
  );
};
