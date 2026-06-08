import { Button, Draggable, Icon } from '@risksmart-app/atomic-ui';

export const SectionPreview = ({ title }: { title: string }) => (
  <div
    className={
      'rounded-xl border border-neutral-border bg-neutral overflow-hidden shadow-lg'
    }
  >
    <div
      className={
        'flex m-0 px-3 justify-between border-neutral-border group/section-header'
      }
    >
      <div className={'flex gap-0 px-0'}>
        <Draggable.DragHandle className={'text-neutral-active'} />
        <div
          className={
            'bg-neutral gap-2 p-4 text-primary text-left text-lg font-bold flex flex-1 items-start'
          }
        >
          {title}
          <Icon
            name={'chevron-down'}
            className={
              'pointer-events-none size-4 shrink-0 text-muted-foreground'
            }
          />
        </div>
      </div>
      <div className={'flex items-center gap-2'}>
        <Button
          variant={'neutral'}
          style={'ghost'}
          size={'sm'}
          aria-label={'Edit section'}
          tabIndex={-1}
        >
          <Icon name={'settings-04'} size={'sm'} />
        </Button>
        <Button
          variant={'destructive'}
          style={'ghost'}
          size={'sm'}
          aria-label={'Delete section'}
          tabIndex={-1}
        >
          <Icon name={'trash-2'} size={'sm'} />
        </Button>
      </div>
    </div>
  </div>
);
