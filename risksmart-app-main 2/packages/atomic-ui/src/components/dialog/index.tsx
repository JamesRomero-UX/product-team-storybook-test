import type { VariantProps } from 'class-variance-authority';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Icon } from '../icon';
import {
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
} from './primitives';
import type { dialogVariants } from './variants';

/* ---------- Dialog compound component ---------- */

interface DialogProps {
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: VariantProps<typeof dialogVariants>['size'];
  children?: ReactNode;
}

interface DialogCompoundHeaderProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

interface DialogCompoundBodyProps {
  children?: ReactNode;
  className?: string;
}

interface DialogCompoundFooterProps {
  children?: ReactNode;
  className?: string;
}

/**
 * A compound dialog component for displaying content in a modal window.
 * @param size - The width of the dialog: 'sm', 'md', 'lg' or 'xl'.
 * @param trigger - A React element that will be used as the trigger to open the dialog. Optional when using controlled mode with `open` and `onOpenChange`.
 * @param open - Controls the open state of the dialog. Use together with `onOpenChange` for controlled mode.
 * @param onOpenChange - Callback fired when the dialog open state changes. Use together with `open` for controlled mode.
 * @param children - Compose using Dialog.Header, Dialog.Body, Dialog.Footer, and Dialog.Close.
 */
const DialogComponent = ({
  size,
  trigger,
  open,
  onOpenChange,
  children,
}: DialogProps) => {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup size={size}>{children}</DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
};

const DialogHeaderCompound = ({
  title,
  description,
  children,
  className,
}: DialogCompoundHeaderProps) => {
  return (
    <DialogHeader className={cn(className)}>
      <div>
        {title ? <DialogTitle>{title}</DialogTitle> : null}
        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : null}
        {children}
      </div>
      <DialogClose
        render={
          <Button
            className={cn('p-0 size-auto')}
            variant={'neutral'}
            style={'ghost'}
            size={'icon'}
          >
            <Icon name={'x'} size={'sm'} />
          </Button>
        }
        aria-label={'Close'}
      />
    </DialogHeader>
  );
};

const DialogBodyCompound = ({
  children,
  className,
}: DialogCompoundBodyProps) => {
  return (
    <DialogBody className={cn('max-h-[60vh] overflow-y-auto', className)}>
      {children}
    </DialogBody>
  );
};

const DialogFooterCompound = ({
  children,
  className,
}: DialogCompoundFooterProps) => {
  return <DialogFooter className={cn(className)}>{children}</DialogFooter>;
};

DialogComponent.Header = DialogHeaderCompound;
DialogComponent.Body = DialogBodyCompound;
DialogComponent.Footer = DialogFooterCompound;
DialogComponent.Close = DialogClose;

export {
  DialogComponent as Dialog,
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
