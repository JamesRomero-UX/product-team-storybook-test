import {
  Accordion,
  Button,
  cn,
  Dialog,
  DialogClose,
  Draggable,
  type DragMoveEvent,
  Icon,
} from '@risksmart-app/atomic-ui';
import { useEffect, useState } from 'react';

import type { FieldEditorValues } from '../config';
import type {
  DEFAULT_LANG,
  FieldSummary,
  UniqueIdentifier,
} from '../constants';
import { useFormEditorDialogStore } from '../useFormEditorDialogStore';
import { FieldCard } from './FieldCard';
import { FormPreview } from './FormPreview';
import { SectionAccordion } from './SectionAccordion';
import { SectionPreview } from './SectionPreview';

export const FormEditorMainDialog = ({
  open,
  onClose,
  onSave,
  lang,
  containerOrder,
  containers,
  fields,
  sectionNames,
  fieldConfigs,
  onMove,
  onReorderContainers,
  onEditField,
  onDeleteField,
  onEditSection,
  onDeleteSection,
  onAddFields,
  onAddSection,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  lang: typeof DEFAULT_LANG.formEditor;
  containerOrder: string[];
  containers: Record<string, string[]>;
  fields: Record<string, FieldSummary>;
  sectionNames: Record<string, string>;
  fieldConfigs: Record<string, FieldEditorValues>;
  onMove: (event: DragMoveEvent) => void;
  onReorderContainers: (ids: UniqueIdentifier[]) => void;
  onEditField: (fieldId: string) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onEditSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddFields: (sectionId: string) => void;
  onAddSection: () => void;
}) => {
  const openSections = useFormEditorDialogStore((s) => s.openSections);
  const setOpenSections = useFormEditorDialogStore((s) => s.setOpenSections);
  const hasDraggable = containerOrder.length > 0;

  const [previewing, setPreviewing] = useState(false);

  // Reset preview when dialog closes
  useEffect(() => {
    if (!open) {
      setPreviewing(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()} size={'xl'}>
      <Dialog.Header
        title={lang.title}
        description={
          previewing
            ? 'Test your form with conditional logic'
            : lang.description
        }
      />
      <Dialog.Body className={'flex flex-col gap-4 p-4'}>
        {previewing ? (
          <FormPreview
            containerOrder={containerOrder}
            containers={containers}
            fields={fields}
            sectionNames={sectionNames}
            fieldConfigs={fieldConfigs}
          />
        ) : (
          <Accordion
            multiple
            value={openSections}
            onValueChange={setOpenSections}
          >
            {hasDraggable ? (
              <Draggable.Multi
                containers={containers}
                containerOrder={containerOrder}
                onMove={onMove}
                onReorderContainers={
                  onReorderContainers as
                    | ((ids: UniqueIdentifier[]) => void)
                    | undefined
                }
                onDragStart={(event) => {
                  if (String(event.active.id) in containers) {
                    setOpenSections([]);
                  }
                }}
                className={'flex flex-col gap-4'}
              >
                {containerOrder.map((sectionId) => (
                  <Draggable.Container
                    key={sectionId}
                    id={sectionId}
                    items={containers[sectionId]}
                    isSortable
                  >
                    <SectionAccordion
                      sectionId={sectionId}
                      title={sectionNames[sectionId] ?? sectionId}
                      fieldIds={containers[sectionId]}
                      containerIds={containerOrder}
                      fields={fields}
                      addFieldsLabel={lang.addFields}
                      onEditSection={() => onEditSection(sectionId)}
                      onDeleteSection={() => onDeleteSection(sectionId)}
                      onEditField={(fieldId) => onEditField(fieldId)}
                      onDeleteField={(fieldId) =>
                        onDeleteField(sectionId, fieldId)
                      }
                      onAddFields={() => onAddFields(sectionId)}
                    />
                  </Draggable.Container>
                ))}
                <Draggable.Overlay>
                  {(activeId) => {
                    const id = String(activeId);
                    if (id in containers) {
                      return <SectionPreview title={sectionNames[id] ?? id} />;
                    }
                    const field = fields[id];
                    if (field) {
                      return (
                        <FieldCard
                          name={field.name}
                          type={field.type}
                          required={field.required}
                          readOnly={field.readOnly}
                        />
                      );
                    }

                    return null;
                  }}
                </Draggable.Overlay>
              </Draggable.Multi>
            ) : null}
            {lang.addSection ? (
              <Button
                style={'dashed-fill'}
                radius={'xl'}
                className={'w-full'}
                onClick={onAddSection}
              >
                <Icon name={'plus'} size={'sm'} />
                {lang.addSection}
              </Button>
            ) : null}
          </Accordion>
        )}
      </Dialog.Body>
      <Dialog.Footer className={'flex items-center justify-between'}>
        <div className={cn('flex items-center gap-2')}>
          <Button onClick={onSave}>{lang.save}</Button>
          <DialogClose
            render={
              <Button variant={'neutral'} style={'outline'}>
                {lang.cancel}
              </Button>
            }
          />
        </div>
        <Button
          variant={'neutral'}
          style={'outline'}
          onClick={() => setPreviewing((p) => !p)}
        >
          <Icon name={previewing ? 'eye-off' : 'eye'} size={'lg'} />
          {'Preview'}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
};
