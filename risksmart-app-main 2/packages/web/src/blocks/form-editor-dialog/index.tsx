import {
  applyDragMove,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  type DragMoveEvent,
} from '@risksmart-app/atomic-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ZodType } from 'zod';

import {
  fieldEditorSchema,
  type FieldEditorValues,
  sectionEditorSchema,
  type SectionEditorValues,
} from './config';
import {
  buildFieldDefaults,
  buildSectionDefaults,
  DEFAULT_LANG,
  type FieldSummary,
} from './constants';
import { ExclusiveSwitchPair } from './parts/ExclusiveSwitchPair';
import { FieldEditorConfigFields } from './parts/FieldEditorConfigFields';
import { FormEditorMainDialog } from './parts/FormEditorMainDialog';
import { FormTextareaField, FormTextField } from './parts/FormFields';
import { SubEditorDialog } from './parts/SubEditorDialog';
import type {
  ConditionalLogicOption,
  FormEditorDialogProps,
  FormEditorOutput,
} from './types';
import { useFormEditorDialogStore } from './useFormEditorDialogStore';

export type {
  ConditionalLogicOption,
  FormEditorDialogLang,
  FormEditorDialogProps,
  FormEditorFieldData,
  FormEditorInitialData,
  FormEditorOutput,
  FormEditorSectionData,
} from './types';

type ActiveView = 'form-editor' | 'section-builder' | 'field-editor';

const FormEditorDialog = ({
  open,
  onOpenChange,
  initialData,
  getValueOptions,
  onSave,
  lang,
}: FormEditorDialogProps) => {
  const [activeView, setActiveView] = useState<ActiveView>('form-editor');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [addingFieldToSectionId, setAddingFieldToSectionId] = useState<
    string | null
  >(null);

  // Internal data state
  const [containerOrder, setContainerOrder] = useState<string[]>([]);
  const [containers, setContainers] = useState<Record<string, string[]>>({});
  const [fields, setFields] = useState<Record<string, FieldSummary>>({});
  const [sectionNames, setSectionNames] = useState<Record<string, string>>({});
  const [sectionConfigs, setSectionConfigs] = useState<
    Record<string, SectionEditorValues>
  >({});
  const [fieldConfigs, setFieldConfigs] = useState<
    Record<string, FieldEditorValues>
  >({});

  // Snapshot of open accordion sections before navigating to a sub-editor,
  // so we can restore the same state when the user returns.
  const savedOpenSectionsRef = useRef<string[] | null>(null);

  const navigateToSubEditor = useCallback((view: ActiveView) => {
    savedOpenSectionsRef.current =
      useFormEditorDialogStore.getState().openSections;
    setActiveView(view);
  }, []);

  const returnToFormEditor = useCallback(() => {
    if (savedOpenSectionsRef.current) {
      useFormEditorDialogStore.setState({
        openSections: savedOpenSectionsRef.current,
      });
      savedOpenSectionsRef.current = null;
    }
    setActiveView('form-editor');
  }, []);

  const nextIdRef = useRef(0);
  const generateId = useCallback((prefix: string) => {
    nextIdRef.current += 1;

    return `${prefix}-${Date.now()}-${nextIdRef.current}`;
  }, []);

  // Initialize from initialData when dialog opens
  useEffect(() => {
    if (open) {
      const data = initialData ?? { sections: [], fields: {} };
      setContainerOrder(data.sections.map((s) => s.id));
      setContainers(
        Object.fromEntries(data.sections.map((s) => [s.id, s.fieldIds]))
      );
      setSectionNames(
        Object.fromEntries(data.sections.map((s) => [s.id, s.name]))
      );
      setSectionConfigs(
        Object.fromEntries(
          data.sections.filter((s) => s.config).map((s) => [s.id, s.config!])
        )
      );
      setFields(
        Object.fromEntries(
          Object.entries(data.fields).map(([id, f]) => [
            id,
            {
              name: f.name,
              type: f.type,
              required: f.required,
              readOnly: f.config?.readOnly ?? false,
            },
          ])
        )
      );
      setFieldConfigs(
        Object.fromEntries(
          Object.entries(data.fields)
            .filter(([, f]) => f.config)
            .map(([id, f]) => [id, f.config!])
        )
      );
      setActiveView('form-editor');
      setEditingSectionId(null);
      setEditingFieldId(null);
      setAddingFieldToSectionId(null);
      savedOpenSectionsRef.current = null;
      useFormEditorDialogStore.setState({
        openSections: data.sections.map((s) => s.id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleMove = useCallback(
    (event: DragMoveEvent) =>
      setContainers(
        (prev) => applyDragMove(prev, event) as Record<string, string[]>
      ),
    []
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    const output: FormEditorOutput = {
      sections: containerOrder.map((id) => ({
        id,
        name: sectionNames[id] ?? id,
        fieldIds: containers[id] ?? [],
        config: sectionConfigs[id],
      })),
      fields: Object.fromEntries(
        Object.entries(fields).map(([id, f]) => [
          id,
          { ...f, config: fieldConfigs[id] },
        ])
      ),
    };
    onSave(output);
  };

  const handleSectionSubmit = (data: SectionEditorValues) => {
    const sectionId = editingSectionId ?? generateId('section');

    if (!editingSectionId) {
      setContainerOrder((prev) => [...prev, sectionId]);
      setContainers((prev) => ({ ...prev, [sectionId]: [] }));
    }

    setSectionNames((prev) => ({ ...prev, [sectionId]: data.name }));
    setSectionConfigs((prev) => ({ ...prev, [sectionId]: data }));
    returnToFormEditor();
  };

  const handleFieldSubmit = (data: FieldEditorValues) => {
    const fieldId = editingFieldId ?? generateId('field');

    setFields((prev) => ({
      ...prev,
      [fieldId]: {
        name: data.fieldName,
        type: data.fieldType,
        required: data.required ?? false,
        readOnly: data.readOnly ?? false,
      },
    }));
    setFieldConfigs((prev) => ({ ...prev, [fieldId]: data }));

    if (!editingFieldId && addingFieldToSectionId) {
      setContainers((prev) => ({
        ...prev,
        [addingFieldToSectionId]: [
          ...(prev[addingFieldToSectionId] ?? []),
          fieldId,
        ],
      }));
    }

    returnToFormEditor();
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    setContainers((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId].filter((id) => id !== fieldId),
    }));
    setFields((prev) => {
      const next = { ...prev };
      delete next[fieldId];

      return next;
    });
    setFieldConfigs((prev) => {
      const next = { ...prev };
      delete next[fieldId];

      return next;
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    const orphanedFieldIds = containers[sectionId] ?? [];

    setContainerOrder((prev) => prev.filter((id) => id !== sectionId));
    setContainers((prev) => {
      const next = { ...prev };
      delete next[sectionId];

      return next;
    });
    setSectionNames((prev) => {
      const next = { ...prev };
      delete next[sectionId];

      return next;
    });
    setSectionConfigs((prev) => {
      const next = { ...prev };
      delete next[sectionId];

      return next;
    });
    // Clean up orphaned fields that belonged to this section
    if (orphanedFieldIds.length > 0) {
      setFields((prev) => {
        const next = { ...prev };
        orphanedFieldIds.forEach((id) => delete next[id]);

        return next;
      });
      setFieldConfigs((prev) => {
        const next = { ...prev };
        orphanedFieldIds.forEach((id) => delete next[id]);

        return next;
      });
    }
  };

  // Merge lang with defaults
  const formEditorLang = { ...DEFAULT_LANG.formEditor, ...lang?.formEditor };
  const sectionBuilderLang = {
    ...DEFAULT_LANG.sectionBuilder,
    ...lang?.sectionBuilder,
  };
  const fieldEditorLang = {
    ...DEFAULT_LANG.fieldEditor,
    ...lang?.fieldEditor,
  };

  // Derive conditional logic options from internal state
  const fieldOptions: ConditionalLogicOption[] = Object.entries(fields).map(
    ([id, f]) => ({ value: id, label: f.name })
  );
  const sectionShowOptions: ConditionalLogicOption[] = containerOrder.map(
    (id) => ({ value: id, label: sectionNames[id] ?? id })
  );
  const fieldShowOptions: ConditionalLogicOption[] = [
    { value: 'this-field', label: 'this field' },
  ];

  // Memoised default values for sub-dialogs
  const sectionBuilderDefaults = useMemo(
    () => buildSectionDefaults(editingSectionId, sectionNames, sectionConfigs),
    [editingSectionId, sectionNames, sectionConfigs]
  );

  const fieldEditorDefaults = useMemo(
    () => buildFieldDefaults(editingFieldId, fields, fieldConfigs),
    [editingFieldId, fields, fieldConfigs]
  );

  return (
    <>
      <FormEditorMainDialog
        open={open && activeView === 'form-editor'}
        onClose={handleClose}
        onSave={handleSave}
        lang={formEditorLang}
        containerOrder={containerOrder}
        containers={containers}
        fields={fields}
        sectionNames={sectionNames}
        fieldConfigs={fieldConfigs}
        onMove={handleMove}
        onReorderContainers={(ids) => setContainerOrder(ids.map(String))}
        onEditField={(fieldId) => {
          setEditingFieldId(fieldId);
          navigateToSubEditor('field-editor');
        }}
        onDeleteField={handleDeleteField}
        onEditSection={(sectionId) => {
          setEditingSectionId(sectionId);
          navigateToSubEditor('section-builder');
        }}
        onDeleteSection={handleDeleteSection}
        onAddFields={(sectionId) => {
          setEditingFieldId(null);
          setAddingFieldToSectionId(sectionId);
          navigateToSubEditor('field-editor');
        }}
        onAddSection={() => {
          setEditingSectionId(null);
          navigateToSubEditor('section-builder');
        }}
      />
      <SubEditorDialog
        open={open && activeView === 'section-builder'}
        onCancel={returnToFormEditor}
        title={sectionBuilderLang.title}
        saveLabel={
          editingSectionId
            ? sectionBuilderLang.editSave
            : sectionBuilderLang.addSave
        }
        cancelLabel={sectionBuilderLang.cancel}
        schema={sectionEditorSchema as ZodType<SectionEditorValues>}
        defaultValues={sectionBuilderDefaults}
        onSubmit={handleSectionSubmit}
        initialOpenSection={'section-config'}
        configCard={
          <Card className={'w-full'}>
            <CardHeader>
              <CardTitle className={'text-lg font-bold'}>
                {'Section configuration'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn('flex flex-col gap-4')}>
                <FormTextField
                  name={'name'}
                  label={'Section name'}
                  placeholder={'Enter section name'}
                />
                <FormTextareaField
                  name={'description'}
                  label={'Description'}
                  placeholder={'Add a brief description of this section'}
                  optional
                />
              </div>
            </CardContent>
          </Card>
        }
        fieldOptions={fieldOptions}
        getValueOptions={getValueOptions}
        showOptions={sectionShowOptions}
        conditionalLogicDescription={
          'Show this section based on the output from another field'
        }
        guidancePlaceholder={'Add guidance text for this section...'}
      />
      <SubEditorDialog
        open={open && activeView === 'field-editor'}
        onCancel={returnToFormEditor}
        title={fieldEditorLang.title}
        saveLabel={
          editingFieldId ? fieldEditorLang.editSave : fieldEditorLang.addSave
        }
        cancelLabel={fieldEditorLang.cancel}
        schema={fieldEditorSchema as ZodType<FieldEditorValues>}
        defaultValues={fieldEditorDefaults}
        onSubmit={handleFieldSubmit}
        initialOpenSection={'field-config'}
        configCard={
          <Card className={'w-full'}>
            <CardHeader>
              <CardTitle className={'text-lg font-bold'}>
                {'Field configuration'}
              </CardTitle>
              <CardAction>
                <div className={cn('flex items-center gap-4')}>
                  <ExclusiveSwitchPair
                    name={'required'}
                    label={'Required'}
                    otherName={'readOnly'}
                  />
                  <ExclusiveSwitchPair
                    name={'readOnly'}
                    label={'Read only'}
                    otherName={'required'}
                  />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <FieldEditorConfigFields />
            </CardContent>
          </Card>
        }
        fieldOptions={fieldOptions}
        getValueOptions={getValueOptions}
        showOptions={fieldShowOptions}
        conditionalLogicDescription={
          'Show this field based on the output from another field'
        }
        guidancePlaceholder={'Add guidance text...'}
      />
    </>
  );
};

export { FormEditorDialog };
