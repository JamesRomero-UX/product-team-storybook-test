import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ColourSelectorCustom,
  Dialog,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  RatingItem,
  RatingItemContent,
  RatingItemTitle,
} from '@risksmart-app/atomic-ui';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ImpactCategory } from 'src/blocks';
import { z } from 'zod';

const createSchema = (
  t: (key: string) => string,
  existingCategories: ImpactCategory[]
) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('nameRequired') })
      .refine(
        (val) => {
          const normalizedVal = val.toLowerCase();

          return !existingCategories.some(
            (c) => c.name.trim().toLowerCase() === normalizedVal
          );
        },
        { message: t('nameAlreadyInUse') }
      ),
    color: z.string().min(1),
  });

type ImpactCategoryFormValues = z.infer<ReturnType<typeof createSchema>>;

interface EditImpactCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ImpactCategory | null;
  onSave: (category: ImpactCategory) => void;
  existingCategories: ImpactCategory[];
}

export const EditImpactCategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSave,
  existingCategories,
}: EditImpactCategoryDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'riskScoringSettings.editImpactCategoryDialog',
  });

  const schema = useMemo(
    () => createSchema(t as (key: string) => string, existingCategories),
    [t, existingCategories]
  );

  const { control, handleSubmit, reset, watch } =
    useForm<ImpactCategoryFormValues>({
      resolver: zodResolver(schema),
      mode: 'onSubmit',
      defaultValues: { name: '', color: '#474771' },
    });

  useEffect(() => {
    if (open && category) {
      reset({ name: category.name, color: category.color });
    }
  }, [open, category, reset]);

  const watchedValues = watch();

  const handleSave = handleSubmit((data) => {
    onSave({ name: data.name, color: data.color });
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
            name={'name'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={'edit-category-name'}>
                  {t('nameLabel')}
                </FieldLabel>
                <Input
                  aria-invalid={fieldState.invalid}
                  id={'edit-category-name'}
                  {...field}
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
                <ColourSelectorCustom
                  value={field.value}
                  onChange={(color) => field.onChange(color)}
                  label={t('customColourLabel')}
                />
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
              <RatingItemTitle>{watchedValues.name}</RatingItemTitle>
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
