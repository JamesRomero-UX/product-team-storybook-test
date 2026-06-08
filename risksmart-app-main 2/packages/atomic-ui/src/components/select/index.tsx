import { Select as SelectPrimitive } from '@base-ui/react/select';
import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Icon } from '../icon';
import {
  selectGroupLabelVariants,
  selectItemVariants,
  selectPopupVariants,
  selectTriggerVariants,
} from './variants';

/* ------------------------------------------------------------------ */
/*  Select (root)                                                      */
/* ------------------------------------------------------------------ */

interface SelectItem {
  label: string;
  value: string | null;
}

interface SelectProps {
  items: SelectItem[];
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean | 'true' | 'false';
}

const Select = ({
  items,
  children,
  value,
  defaultValue,
  onValueChange,
  className,
  disabled,
  'aria-invalid': ariaInvalid,
}: SelectProps) => {
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const placeholderItem = items.find((item) => item.value === null);
  const selectableItems = items.filter((item) => item.value !== null);

  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={
        onValueChange ? (value) => onValueChange(value as string) : undefined
      }
      disabled={disabled}
    >
      <div className={cn('relative w-full')}>
        {isInvalid && (
          <div
            className={cn(
              'overflow-hidden absolute inset-y-0 left-0 w-[9px] rounded-l-lg bg-destructive z-10'
            )}
          />
        )}
        <SelectPrimitive.Trigger
          data-slot={'select-trigger'}
          aria-invalid={ariaInvalid}
          className={cn(
            selectTriggerVariants({ invalid: isInvalid }),
            className
          )}
        >
          <SelectPrimitive.Value
            data-slot={'select-value'}
            placeholder={placeholderItem?.label}
            className={cn(
              'flex-1 min-w-0 truncate text-left',
              'data-[placeholder]:text-neutral-active'
            )}
          >
            {(selectedValue) => {
              const match = items.find((item) => item.value === selectedValue);

              return match?.label ?? selectedValue;
            }}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon
            data-slot={'select-icon'}
            className={cn('ml-2 flex shrink-0 items-center')}
          >
            <Icon
              name={'chevron-down'}
              size={'sm'}
              className={'text-muted-foreground'}
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
      </div>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          alignItemWithTrigger={false}
          data-slot={'select-positioner'}
          sideOffset={4}
          className={cn('z-[100]')}
        >
          <SelectPrimitive.Popup
            data-slot={'select-popup'}
            className={cn(selectPopupVariants())}
          >
            {children ??
              selectableItems.map((item) => (
                <SelectOption key={item.value} value={item.value!}>
                  {item.label}
                </SelectOption>
              ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

/* ------------------------------------------------------------------ */
/*  SelectOption                                                       */
/* ------------------------------------------------------------------ */

interface SelectOptionProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const SelectOption = ({
  value,
  children,
  className,
  disabled,
}: SelectOptionProps) => (
  <SelectPrimitive.Item
    data-slot={'select-item'}
    value={value}
    disabled={disabled}
    className={cn(selectItemVariants(), className)}
  >
    <SelectPrimitive.ItemText className={cn('truncate')}>
      {children}
    </SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator
      data-slot={'select-item-indicator'}
      className={cn('flex shrink-0 items-center')}
    >
      <Icon name={'check'} size={'xs'} />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
);

/* ------------------------------------------------------------------ */
/*  SelectGroup                                                        */
/* ------------------------------------------------------------------ */

interface SelectGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

const SelectGroup = ({ label, children, className }: SelectGroupProps) => (
  <SelectPrimitive.Group data-slot={'select-group'} className={cn(className)}>
    {label ? (
      <SelectPrimitive.GroupLabel
        data-slot={'select-group-label'}
        className={cn(selectGroupLabelVariants())}
      >
        {label}
      </SelectPrimitive.GroupLabel>
    ) : null}
    {children}
  </SelectPrimitive.Group>
);

/* ------------------------------------------------------------------ */
/*  Compound namespace                                                 */
/* ------------------------------------------------------------------ */

const SelectNamespace = Object.assign(Select, {
  Option: SelectOption,
  Group: SelectGroup,
});

export { SelectNamespace as Select, SelectGroup, SelectOption };
export type { SelectGroupProps, SelectItem, SelectOptionProps, SelectProps };
