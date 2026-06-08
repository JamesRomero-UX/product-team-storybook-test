import type { ComponentProps } from 'react';

import { Accordion } from '../../components/accordion';
import { Badge } from '../../components/badge';
import { BadgeIcon } from '../../components/badge-icon';
import { cn } from '../../lib/utils';

function RatingsAccordion({
  className,
  ...props
}: ComponentProps<typeof Accordion>) {
  return <Accordion className={cn(className)} {...props} />;
}

function RatingsAccordionItem({
  className,
  ...props
}: ComponentProps<typeof Accordion.Item>) {
  return (
    <Accordion.Item
      className={cn('data-[open]:border-secondary shadow', className)}
      {...props}
    />
  );
}

type RatingsAccordionTriggerProps = Omit<
  ComponentProps<typeof Accordion.Trigger>,
  'children'
> & {
  title: string;
  itemCount?: number;
  isComplete?: boolean;
  description?: string;
};

function RatingsAccordionTrigger({
  title,
  itemCount,
  isComplete,
  description,
  className,
  ...props
}: RatingsAccordionTriggerProps) {
  return (
    <Accordion.Header className={cn('border-none')}>
      <Accordion.Trigger
        variant={'card'}
        className={cn(
          'items-center bg-neutral [&_[data-slot=accordion-trigger-icon]]:text-primary',
          className
        )}
        {...props}
      >
        <div className={'flex flex-col gap-1'}>
          <div className={'flex items-center gap-1.5'}>
            <span>{title}</span>
            {itemCount !== undefined && (
              <Badge variant={'secondary'} border size={'sm'}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Badge>
            )}
            {isComplete && <BadgeIcon variant={'success'} />}
          </div>
          {description && (
            <span className={'text-sm font-normal text-muted-foreground'}>
              {description}
            </span>
          )}
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
  );
}

function RatingsAccordionContent({
  className,
  ...props
}: ComponentProps<typeof Accordion.Content>) {
  return <Accordion.Content className={cn(className)} {...props} />;
}

export {
  RatingsAccordion,
  RatingsAccordionContent,
  RatingsAccordionItem,
  RatingsAccordionTrigger,
};
