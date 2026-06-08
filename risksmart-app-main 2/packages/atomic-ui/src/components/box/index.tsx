import type { ComponentProps } from 'react';
import { Children, cloneElement, isValidElement, useId, useState } from 'react';

import { cn } from '../../lib/utils';
import { Switch } from '../switch';
import { Text } from '../text';

interface BoxChildProps {
  _hasSwitch?: boolean;
  _isOpen?: boolean;
  _setOpen?: (open: boolean) => void;
  _titleId?: string;
}

type BoxProps = ComponentProps<'div'> & {
  hasSwitch?: boolean;
  defaultOpen?: boolean;
};

function Box({
  className,
  hasSwitch = false,
  defaultOpen = false,
  children,
  ...props
}: BoxProps) {
  const [isOpen, setOpen] = useState(hasSwitch ? defaultOpen : true);
  const titleId = useId();

  return (
    <div
      data-slot={'box'}
      className={cn(
        'bg-neutral border border-solid border-neutral-border rounded-xl overflow-hidden transition-all',
        className
      )}
      {...props}
    >
      {Children.map(children, (child) => {
        if (
          isValidElement<BoxChildProps>(child) &&
          (child.type === BoxTitle || child.type === BoxContent)
        ) {
          return cloneElement(child, {
            _hasSwitch: hasSwitch,
            _isOpen: isOpen,
            _setOpen: setOpen,
            _titleId: titleId,
          });
        }

        return child;
      })}
    </div>
  );
}

function BoxTitle({
  className,
  _hasSwitch: hasSwitch = false,
  _isOpen: isOpen = true,
  _setOpen: setOpen,
  _titleId: titleId,
  ...props
}: ComponentProps<typeof Text> & BoxChildProps) {
  return (
    <div
      data-slot={'box-title'}
      className={cn(
        'flex items-center justify-between p-5 transition-[padding-bottom]',
        !hasSwitch && 'last:pb-5 pb-0',
        hasSwitch && !isOpen && 'pb-5',
        hasSwitch && isOpen && 'pb-0'
      )}
    >
      <Text
        id={titleId}
        preset={'heading-sm'}
        className={cn(className)}
        {...props}
      />
      {hasSwitch && setOpen && (
        <Switch
          size={'sm'}
          checked={isOpen}
          onCheckedChange={setOpen}
          aria-labelledby={titleId}
        />
      )}
    </div>
  );
}

function BoxContent({
  className,
  children,
  _hasSwitch: hasSwitch = false,
  _isOpen: isOpen = true,
  _setOpen: _unused1,
  _titleId: _unused2,
  ...props
}: ComponentProps<'div'> & BoxChildProps) {
  if (!hasSwitch) {
    return (
      <div
        data-slot={'box-content'}
        className={cn('p-5', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-slot={'box-content'}
      className={cn(
        'grid transition-[grid-template-rows]',
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className
      )}
      {...props}
    >
      <div className={cn('overflow-hidden', !isOpen && 'invisible')}>
        <div className={'p-5'}>{children}</div>
      </div>
    </div>
  );
}

export { Box, BoxContent, BoxTitle };
