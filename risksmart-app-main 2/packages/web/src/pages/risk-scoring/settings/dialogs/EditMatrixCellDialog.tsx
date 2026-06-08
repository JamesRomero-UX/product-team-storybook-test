import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ColourSelector,
  ColourSelectorCustom,
  ColourSelectorItem,
  Dialog,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  RatingItem,
  RatingItemContent,
  RatingItemDescription,
  RatingItemTitle,
} from '@risksmart-app/atomic-ui';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { MatrixCell } from 'src/blocks';
import { z } from 'zod';

const PRESET_COLOURS = ['#79B250', '#A8D08C', '#F2A041', '#D25F5F', '#D92B2B'];

const createSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, { message: t('titleRequired') }),
    value: z.coerce
      .number()
      .int()
      .min(1, { message: t('valueRequired') }),
    color: z.string().min(1),
  });

type MatrixCellFormValues = z.infer<ReturnType<typeof createSchema>>;

interface EditMatrixCellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cell: MatrixCell | null;
  onSave: (cell: MatrixCell) => void;
}

export const EditMatrixCellDialog = ({
  open,
  onOpenChange,
  cell,
  onSave,
}: EditMatrixCellDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'riskScoringSettings.editMatrixCellDialog',
  });

  const schema = useMemo(() => createSchema(t as (key: string) => string), [t]);

  const { control, handleSubmit, reset, watch } = useForm<MatrixCellFormValues>(
    {
      resolver: zodResolver(schema),
      mode: 'onSubmit',
      defaultValues: { title: '', value: 1, color: PRESET_COLOURS[0] },
    }
  );

  const watchedValues = watch();

  useEffect(() => {
    if (open && cell) {
      reset({ title: cell.title, value: cell.value, color: cell.color });
    }
  }, [open, cell, reset]);

  const handleSave = handleSubmit((data) => {
    onSave({
      title: data.title,
      value: data.value,
      color: data.color,
      likelihood: cell!.likelihood,
      impact: cell!.impact,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size={'lg'}>
      <Dialog.Header
        title={t('dialogTitle')}
        description={t('dialogDescription')}
      />
      <Dialog.Body>
        <FieldGroup className={'min-w-[568px] mb-4'}>
          <Controller
            name={'title'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={'edit-matrix-cell-title'}>
                  {t('titleLabel')}
                </FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  id={'edit-matrix-cell-title'}
                  {...field}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name={'value'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={'edit-matrix-cell-value'}>
                  {t('valueLabel')}
                </FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  id={'edit-matrix-cell-value'}
                  type={'number'}
                  min={1}
                  step={1}
                  value={field.value}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name={'color'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('colourLabel')}</FieldLabel>
                <div className={'flex flex-col gap-2'}>
                  <ColourSelector
                    value={
                      PRESET_COLOURS.includes(field.value) ? [field.value] : []
                    }
                    onValueChange={(vals) => {
                      if (vals.length > 0) {
                        field.onChange(vals[vals.length - 1]);
                      }
                    }}
                  >
                    {PRESET_COLOURS.map((colour) => (
                      <ColourSelectorItem
                        key={colour}
                        color={colour}
                        label={colour}
                        value={colour}
                      />
                    ))}
                  </ColourSelector>
                  <ColourSelectorCustom
                    value={field.value}
                    onChange={(color) => field.onChange(color)}
                    label={t('customColourLabel')}
                  />
                </div>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <div
          className={
            'flex flex-col gap-3 p-4 bg-neutral-minimal border border-neutral-border rounded-lg'
          }
        >
          <div className={'text-lg text-primary font-semibold'}>
            {t('previewLabel')}
          </div>
          <RatingItem color={watchedValues.color} size={'sm'}>
            <RatingItemContent>
              <RatingItemTitle>{watchedValues.title}</RatingItemTitle>
              <RatingItemDescription>
                {watchedValues.value}
              </RatingItemDescription>
            </RatingItemContent>
          </RatingItem>
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={handleSave}>{t('saveButton')}</Button>
        <Dialog.Close
          render={
            <Button variant={'neutral'} style={'outline'}>
              {t('cancelButton')}
            </Button>
          }
        />
      </Dialog.Footer>
    </Dialog>
  );
};
