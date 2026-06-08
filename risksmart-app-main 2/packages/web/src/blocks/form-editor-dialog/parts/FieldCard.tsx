import {
  Badge,
  Button,
  cn,
  ConfirmableDeleteButton,
  Draggable,
  Icon,
  Text,
} from '@risksmart-app/atomic-ui';

import { getFieldTypeLabel } from '../constants';

export const FieldCard = ({
  name,
  type,
  required = false,
  readOnly = false,
  onEdit,
  onDelete,
}: {
  name: string;
  type: string;
  required?: boolean;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-lg border border-neutral-border bg-neutral p-3 group/field-card'
    )}
  >
    <Draggable.DragHandle className={'text-neutral-active'} />
    <div className={cn('flex flex-col gap-0.5 flex-1')}>
      <div className={cn('flex items-center gap-2')}>
        <Text preset={'body'} className={'font-semibold'} render={<span />}>
          {name}
        </Text>
        {required ? (
          <Badge variant={'destructive'} size={'sm'}>
            {'Required'}
          </Badge>
        ) : null}
        {readOnly ? (
          <Badge variant={'neutral'} size={'sm'}>
            {'Read only'}
          </Badge>
        ) : null}
      </div>
      <Text
        preset={'body'}
        className={'text-muted-foreground text-sm'}
        render={<span />}
      >
        {getFieldTypeLabel(type)}
      </Text>
    </div>
    {onEdit ? (
      <Button
        variant={'neutral'}
        style={'ghost'}
        size={'icon'}
        className={cn(
          'p-0 size-auto opacity-0 group-hover/field-card:opacity-100 transition-opacity'
        )}
        onClick={onEdit}
      >
        <Icon name={'settings-04'} size={'sm'} />
      </Button>
    ) : null}
    {onDelete ? (
      <ConfirmableDeleteButton
        onConfirm={onDelete}
        size={'icon'}
        showOnGroupHover
        groupName={'field-card'}
      />
    ) : null}
  </div>
);
