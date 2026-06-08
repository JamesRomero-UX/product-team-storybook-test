import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';
import { Text } from '../text';
import { dialogVariants } from './variants';

function DialogRoot(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({ className, ...props }: DialogPrimitive.Trigger.Props) {
  return (
    <DialogPrimitive.Trigger
      data-slot={'dialog-trigger'}
      className={cn(className)}
      {...props}
    />
  );
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot={'dialog-backdrop'}
      className={cn(
        'fixed inset-0 z-50 bg-primary/40 transition-opacity duration-200',
        'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
        className
      )}
      {...props}
    />
  );
}

function DialogPopup({
  size: sizeProp = 'md',
  className,
  ...props
}: DialogPrimitive.Popup.Props & VariantProps<typeof dialogVariants>) {
  return (
    <DialogPrimitive.Popup
      data-slot={'dialog-popup'}
      className={cn(
        dialogVariants({ size: sizeProp }),
        'group',
        'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'transition-all duration-200 p-0',
        'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
        'data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <Text
      data-slot={'dialog-title'}
      className={cn(className)}
      preset={'heading-sm'}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <Text
      data-slot={'dialog-description'}
      className={cn('text-muted-foreground', className)}
      preset={'body'}
      {...props}
    />
  );
}

function DialogClose({ className, ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot={'dialog-close'}
      className={cn(className)}
      {...props}
    />
  );
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'dialog-header'}
      className={cn(
        'flex items-start justify-between gap-2 p-4 border-b border-solid border-neutral-border',
        className
      )}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'dialog-body'}
      className={cn('text-base p-4', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot={'dialog-footer'}
      className={cn(
        'flex items-center justify-start gap-2 p-4 border-t border-hidden border-neutral-border',
        'group-has-[[data-slot=dialog-body]]:border-solid',
        className
      )}
      {...props}
    />
  );
}

export {
  DialogBackdrop,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
};
