import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Icon,
  Separator,
  Text,
} from '../../components';
import { type buttonVariants } from '../../components/button/variants';
import type { IconName } from '../../components/icon/iconMap';
import { cn } from '../../lib/utils';

interface ActionItem {
  label: string;
  iconName: IconName;
  onClick: () => void;
  style?: VariantProps<typeof buttonVariants>['style'];
  variant?: VariantProps<typeof buttonVariants>['variant'];
}

interface ObjectLevelHeaderProps {
  title: string;
  counter?: number;
  onAdd?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  additionalActions?: ActionItem[];
  menuContent?: ReactNode;
  className?: string;
  isObjectDirty?: boolean;
}

function ObjectLevelHeader({
  additionalActions = [],
  title,
  counter,
  onAdd,
  onSave,
  onCancel,
  menuContent,
  className,
  isObjectDirty = false,
}: ObjectLevelHeaderProps) {
  const actions = useMemo<ActionItem[]>(() => {
    const defaultActions: ActionItem[] = [];

    if (onAdd) {
      defaultActions.push({
        label: 'Add new item',
        iconName: 'plus',
        onClick: onAdd,
      });
    }
    if (onCancel) {
      defaultActions.push({
        label: 'Cancel',
        iconName: 'x',
        onClick: onCancel,
      });
    }

    return [...defaultActions, ...additionalActions];
  }, [onAdd, onCancel, additionalActions]);

  return (
    <div
      data-slot={'object-level-header'}
      className={cn(
        'flex items-center gap-3 border-b border-muted bg-neutral px-11 py-5',
        className
      )}
    >
      <div className={'flex min-w-0 flex-1 items-center gap-1'}>
        <Text preset={'heading-lg'}>{title}</Text>
        {counter != null && (
          <span
            className={
              'shrink-0 text-5xl font-normal tracking-tight text-muted-foreground'
            }
          >
            {'('}
            {counter}
            {')'}
          </span>
        )}
      </div>

      <div className={'flex shrink-0 items-center'}>
        {onSave && (
          <Button
            variant={'neutral'}
            style={!isObjectDirty ? 'ghost' : 'default'}
            radius={'sm'}
            size={'icon'}
            onClick={onSave}
            aria-label={'Save'}
            disabled={!isObjectDirty}
            className={cn(isObjectDirty && 'hover:bg-secondary-minimal')}
          >
            <Icon
              name={'save-01'}
              size={'md'}
              className={cn(isObjectDirty && 'animate-save-pulse')}
            />
          </Button>
        )}
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant ?? 'neutral'}
            style={action.style ?? 'default'}
            radius={'sm'}
            size={'icon'}
            onClick={action.onClick}
            aria-label={action.label}
          >
            <Icon name={action.iconName} size={'md'} />
          </Button>
        ))}
        {menuContent && (
          <>
            <Separator
              orientation={'vertical'}
              className={'h-[28px] mt-0.5 mx-1'}
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant={'neutral'}
                    style={'default'}
                    radius={'sm'}
                    size={'icon'}
                    aria-label={'More options'}
                  >
                    <Icon name={'dots-vertical'} size={'md'} />
                  </Button>
                }
              />
              <DropdownMenuContent align={'end'}>
                {menuContent}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}

export { ObjectLevelHeader };
export type { ObjectLevelHeaderProps };
