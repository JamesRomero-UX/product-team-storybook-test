import { zodResolver } from '@hookform/resolvers/zod';
import { Accordion, Button, Dialog } from '@risksmart-app/atomic-ui';
import { type ReactNode, useEffect, useRef } from 'react';
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  useForm,
} from 'react-hook-form';
import type { ZodType } from 'zod';

import type { ConditionalLogicOption } from '../types';
import { useFormEditorDialogStore } from '../useFormEditorDialogStore';
import { ConditionalLogicRuleBuilder } from './ConditionalLogicRuleBuilder';
import { GuidanceField } from './GuidanceField';
import { SwitchSectionField } from './SwitchSectionField';

export interface SubEditorDialogProps<T extends FieldValues> {
  open: boolean;
  onCancel: () => void;
  title: string;
  saveLabel: string;
  cancelLabel: string;
  schema: ZodType<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void;
  initialOpenSection: string;
  configCard: ReactNode;
  fieldOptions: ConditionalLogicOption[];
  getValueOptions?: (fieldValue: string) => ConditionalLogicOption[];
  showOptions: ConditionalLogicOption[];
  conditionalLogicDescription?: string;
  guidancePlaceholder?: string;
}

export const SubEditorDialog = <T extends FieldValues>({
  open,
  onCancel,
  title,
  saveLabel,
  cancelLabel,
  schema,
  defaultValues,
  onSubmit,
  initialOpenSection,
  configCard,
  fieldOptions,
  getValueOptions,
  showOptions,
  conditionalLogicDescription,
  guidancePlaceholder,
}: SubEditorDialogProps<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onSubmit',
  });

  // Use ref so the effect always reads the latest defaults without
  // needing defaultValues in the dependency array
  const defaultValuesRef = useRef(defaultValues);
  defaultValuesRef.current = defaultValues;

  useEffect(() => {
    if (open) {
      form.reset(defaultValuesRef.current);
      useFormEditorDialogStore.setState({
        openSections: [initialOpenSection],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openSections = useFormEditorDialogStore((s) => s.openSections);
  const setOpenSections = useFormEditorDialogStore((s) => s.setOpenSections);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()} size={'xl'}>
      <Dialog.Header title={title} />
      <Dialog.Body className={'flex flex-col gap-4 p-4'}>
        <FormProvider {...form}>
          <Accordion
            multiple
            value={openSections}
            onValueChange={setOpenSections}
          >
            {configCard}
            <SwitchSectionField
              value={'conditional-logic'}
              title={'Conditional logic'}
              name={'conditionalLogicEnabled'}
            >
              <ConditionalLogicRuleBuilder
                fieldOptions={fieldOptions}
                getValueOptions={getValueOptions}
                showOptions={showOptions}
                description={conditionalLogicDescription}
              />
            </SwitchSectionField>
            <SwitchSectionField
              value={'guidance'}
              title={'Guidance'}
              name={'guidanceEnabled'}
            >
              <GuidanceField placeholder={guidancePlaceholder} />
            </SwitchSectionField>
          </Accordion>
        </FormProvider>
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={form.handleSubmit(onSubmit)}>{saveLabel}</Button>
        <Button variant={'neutral'} style={'outline'} onClick={onCancel}>
          {cancelLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
};
