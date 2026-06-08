import {
  Accordion,
  Button,
  cn,
  ConfirmableDeleteButton,
  Draggable,
  Icon,
  useDraggableContext,
} from '@risksmart-app/atomic-ui';
import { type MouseEvent, useEffect, useRef, useState } from 'react';

import type { FieldSummary } from '../constants';
import { useFormEditorDialogStore } from '../useFormEditorDialogStore';
import { FieldCard } from './FieldCard';

export const SectionAccordion = ({
  sectionId,
  title,
  fieldIds,
  containerIds,
  fields,
  addFieldsLabel,
  onEditSection,
  onDeleteSection,
  onEditField,
  onDeleteField,
  onAddFields,
}: {
  sectionId: string;
  title: string;
  fieldIds: string[];
  containerIds: string[];
  fields: Record<string, FieldSummary>;
  addFieldsLabel?: string;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onEditField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
  onAddFields: () => void;
}) => {
  const handleActionClick = (e: MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const openSections = useFormEditorDialogStore((s) => s.openSections);
  const isClosed = !openSections.includes(sectionId);

  const { activeId, overId } = useDraggableContext();
  const isFieldDrag =
    activeId != null && !containerIds.includes(String(activeId));
  const isDropTarget =
    isFieldDrag &&
    overId != null &&
    (String(overId) === sectionId || fieldIds.includes(String(overId)));

  const showPeek = isClosed && isDropTarget;

  const [showFlash, setShowFlash] = useState(false);
  const wasDropTarget = useRef(false);
  const wasClosed = useRef(false);

  useEffect(() => {
    if (isDropTarget && isClosed) {
      wasDropTarget.current = true;
      wasClosed.current = true;
    }

    if (activeId == null && wasDropTarget.current && wasClosed.current) {
      wasDropTarget.current = false;
      wasClosed.current = false;
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 500);

      return () => clearTimeout(timer);
    }

    if (!isDropTarget) {
      wasDropTarget.current = false;
    }
  }, [activeId, isDropTarget, isClosed]);

  return (
    <Accordion.Item
      value={sectionId}
      variant={'inverse'}
      className={cn(
        'transition-shadow duration-200 p-0',
        showPeek &&
          'border-secondary shadow-[0_0_0_1px_oklch(var(--secondary)/0.4)]',
        showFlash && 'animate-drop-flash'
      )}
    >
      <Accordion.Header
        className={
          'px-3 justify-between data-[open]:border-b border-neutral-border group/section-header'
        }
      >
        <div className={'flex gap-0 px-0'}>
          <Draggable.DragHandle className={'text-neutral-active'} />
          <Accordion.Trigger
            variant={'inverse'}
            className={'shrink flex-0 gap-2'}
          >
            {title}
          </Accordion.Trigger>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 opacity-0 group-hover/section-header:opacity-100 transition-opacity'
          )}
        >
          <Button
            variant={'neutral'}
            style={'ghost'}
            size={'sm'}
            aria-label={'Edit section'}
            className={'p-0'}
            onClick={(e) => handleActionClick(e, onEditSection)}
          >
            <Icon name={'settings-04'} size={'sm'} />
          </Button>
          <ConfirmableDeleteButton onConfirm={onDeleteSection} size={'sm'} />
        </div>
      </Accordion.Header>
      <Accordion.Content variant={'inverse'} className={cn('p-4')}>
        <div className={cn('flex flex-col gap-3')}>
          {fieldIds.map((fieldId) => {
            const field = fields[fieldId];

            return (
              <Draggable.Item key={fieldId} id={fieldId}>
                <FieldCard
                  name={field?.name ?? fieldId}
                  type={field?.type ?? 'text'}
                  required={field?.required ?? false}
                  readOnly={field?.readOnly ?? false}
                  onEdit={() => onEditField(fieldId)}
                  onDelete={() => onDeleteField(fieldId)}
                />
              </Draggable.Item>
            );
          })}
          {addFieldsLabel ? (
            <Button
              style={'dashed-fill'}
              radius={'xl'}
              className={'w-full'}
              onClick={onAddFields}
            >
              <Icon name={'plus'} size={'sm'} />
              {addFieldsLabel}
            </Button>
          ) : null}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
};
