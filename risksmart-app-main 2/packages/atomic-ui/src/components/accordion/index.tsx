import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import type { VariantProps } from 'class-variance-authority';
import type { MouseEvent, ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Icon } from '../icon';
import { Switch } from '../switch';
import {
  accordionContentVariants,
  accordionHeaderVariants,
  accordionItemVariants,
  accordionSwitchTriggerVariants,
  accordionTriggerVariants,
} from './variants';

type AccordionVariant = VariantProps<typeof accordionItemVariants>['variant'];

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot={'accordion'}
      className={cn('flex w-full flex-col gap-4', className)}
      {...props}
    />
  );
}

interface AccordionItemProps extends AccordionPrimitive.Item.Props {
  variant?: AccordionVariant;
}

function AccordionItem({ className, variant, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot={'accordion-item'}
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  );
}

interface AccordionHeaderProps extends AccordionPrimitive.Header.Props {
  variant?: AccordionVariant;
}

function AccordionHeader({
  className,
  variant,
  ...props
}: AccordionHeaderProps) {
  return (
    <AccordionPrimitive.Header
      data-slot={'accordion-header'}
      className={cn(accordionHeaderVariants({ variant }), className)}
      {...props}
    />
  );
}

interface AccordionTriggerProps extends AccordionPrimitive.Trigger.Props {
  variant?: AccordionVariant;
}

function AccordionTrigger({
  className,
  children,
  variant,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Trigger
      data-slot={'accordion-trigger'}
      className={cn(accordionTriggerVariants({ variant }), className)}
      {...props}
    >
      {children}
      <Icon
        data-slot={'accordion-trigger-icon'}
        name={'chevron-down'}
        className={
          'pointer-events-none size-5 shrink-0 group-aria-expanded/accordion-trigger:hidden'
        }
      />
      <Icon
        data-slot={'accordion-trigger-icon'}
        name={'chevron-up'}
        className={
          'pointer-events-none size-5 hidden shrink-0 group-aria-expanded/accordion-trigger:inline'
        }
      />
    </AccordionPrimitive.Trigger>
  );
}

interface AccordionContentProps extends AccordionPrimitive.Panel.Props {
  variant?: AccordionVariant;
}

function AccordionContent({
  className,
  children,
  variant,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Panel
      data-slot={'accordion-content'}
      className={
        'data-[open]:animate-accordion-down data-[closed]:animate-accordion-up text-sm overflow-hidden'
      }
      {...props}
    >
      <div
        className={cn(
          'p-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
          accordionContentVariants({ variant }),
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

interface AccordionSwitchItemProps extends AccordionPrimitive.Item.Props {
  variant?: AccordionVariant;
}

function AccordionSwitchItem({
  className,
  variant,
  ...props
}: AccordionSwitchItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot={'accordion-switch-item'}
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  );
}

interface AccordionSwitchTriggerProps extends Omit<
  AccordionPrimitive.Trigger.Props,
  'children'
> {
  children?: ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: AccordionVariant;
}

function AccordionSwitchTrigger({
  className,
  children,
  checked,
  onCheckedChange,
  variant,
  ...props
}: AccordionSwitchTriggerProps) {
  const handleSwitchClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AccordionHeader variant={variant}>
      <AccordionPrimitive.Trigger
        data-slot={'accordion-switch-trigger'}
        tabIndex={-1}
        className={cn(accordionSwitchTriggerVariants({ variant }), className)}
        {...props}
      >
        {children}
        <span
          className={'pointer-events-auto ml-auto shrink-0'}
          onClick={handleSwitchClick}
        >
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            size={'md'}
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionHeader>
  );
}

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
Accordion.SwitchItem = AccordionSwitchItem;
Accordion.SwitchTrigger = AccordionSwitchTrigger;

export { Accordion };
export type { AccordionVariant };
