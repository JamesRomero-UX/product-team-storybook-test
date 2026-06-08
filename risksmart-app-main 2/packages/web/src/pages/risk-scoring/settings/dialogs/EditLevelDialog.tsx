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
import type { RiskScoringLevel } from 'src/blocks';
import { z } from 'zod';

const PRESET_COLOURS = ['#79B250', '#A8D08C', '#F2A041', '#D25F5F', '#D92B2B'];

const createSchema = (
  t: (key: string) => string,
  existingLevels: RiskScoringLevel[]
) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: t('titleRequired') })
      .refine(
        (val) => {
          const normalizedTitle = val.toLowerCase();

          return !existingLevels.some(
            (l) => l.title.trim().toLowerCase() === normalizedTitle
          );
        },
        { message: t('titleAlreadyInUse') }
      ),
    description: z.string(),
    value: z.coerce
      .number()
      .int()
      .min(1, { message: t('valueRequired') })
      .refine((val) => !existingLevels.some((l) => l.value === val), {
        message: t('valueAlreadyInUse'),
      }),
    color: z.string().min(1),
  });

type LevelFormValues = z.infer<ReturnType<typeof createSchema>>;

interface EditLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: RiskScoringLevel | null;
  onSave: (level: RiskScoringLevel) => void;
  type: 'likelihood' | 'impact';
  existingLevels: RiskScoringLevel[];
}

export const EditLevelDialog = ({
  open,
  onOpenChange,
  level,
  onSave,
  type,
  existingLevels,
}: EditLevelDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'riskScoringSettings.editLevelDialog',
  });

  const schema = useMemo(
    () => createSchema(t as (key: string) => string, existingLevels),
    [t, existingLevels]
  );

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      description: '',
      value: 1,
      color: PRESET_COLOURS[0],
    },
  });

  const { watch, control, handleSubmit, reset } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (open && level) {
      reset({
        title: level.title,
        description: level.description,
        value: level.value,
        color: level.color,
      });
    }
  }, [open, level, reset]);

  const handleSave = handleSubmit((data) => {
    onSave({
      value: data.value,
      title: data.title,
      description: data.description,
      color: data.color,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size={'lg'}>
      <Dialog.Header
        title={t(`${type}.dialogTitle`)}
        description={t(`${type}.dialogDescription`)}
      />
      <Dialog.Body>
        <FieldGroup className={'min-w-[568px] mb-4'}>
          <Controller
            name={'title'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={'edit-level-title'}>
                  {t('titleLabel')}
                </FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  id={'edit-level-title'}
                  {...field}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name={'description'}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={'edit-level-description'}>
                  {t('descriptionLabel')}
                </FieldLabel>
                <Input id={'edit-level-description'} {...field} />
              </Field>
            )}
          />

          <Controller
            name={'value'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={'edit-level-value'}>
                  {t('valueLabel')}
                </FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  id={'edit-level-value'}
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
