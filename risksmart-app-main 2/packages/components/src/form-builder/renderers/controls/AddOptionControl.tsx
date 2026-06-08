import { withJsonFormsControlProps } from '@jsonforms/react';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import { Reorder } from 'framer-motion';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';

import Button from '../../../button';
import { DraggableItem } from '../../../dragable-item/DraggableItem';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import type { ExtendedControlProps, FieldOption } from '../../types';
import { CustomisableControl } from './CustomisableControl';

const AddOptionControlUnwrapped: FC<ExtendedControlProps> = ({
  uischema,
  schema,
  errors,
  handleChange,
  enabled,
  data,
  id,
  path,
  config,
  visible,
  required,
}) => {
  const { isFormDirty } = useFormBuilderStore(
    useShallow((state) => ({
      isFormDirty: state.isFormDirty,
    }))
  );

  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.formField',
  });

  const appliedUiSchemaOptions = {
    ...config,
    ...uischema.options,
  };

  const setOptions = (options: { value: string; generatedId: string }[]) => {
    handleChange(path, options);
  };

  const onAddOptionField = () => {
    const newOptions = [...(data ?? []), { value: '', generatedId: uuidv4() }];
    setOptions(newOptions);
  };

  const updateOption = (generatedId: string, value: null | number | string) => {
    const options = [...(data ?? [])];
    const option = options.find((o) => o.generatedId === generatedId);

    if (option) {
      option.value = `${value}`;
      setOptions(options);
    }
  };

  const deleteOption = (generatedId: string) => {
    const options = [...(data ?? [])];
    const optionIndex = options.findIndex((o) => o.generatedId === generatedId);

    if (optionIndex > -1) {
      options.splice(optionIndex, 1);
      setOptions(options);
    }
  };

  const optionHasError = (option: FieldOption) => {
    if (isFormDirty) {
      return option.value ? '' : t('optionRequiredErrorMessage');
    }

    return '';
  };

  return (
    <CustomisableControl
      id={path}
      uischema={uischema}
      schema={schema}
      errors={errors}
      required={required}
      visible={visible}
    >
      <div className={'pb-6'}>
        <Reorder.Group
          axis={'y'}
          className={'flex flex-col gap-y-4 p-0 m-0'}
          values={data ?? []}
          onReorder={setOptions}
        >
          {(data || []).map((fieldOption: FieldOption, index: number) => (
            <DraggableItem
              value={fieldOption}
              key={fieldOption.generatedId}
              deleteOption={() => deleteOption(fieldOption.generatedId)}
            >
              <FormField
                data-testid={`form-field-option-${index}`}
                label={''}
                stretch={true}
                errorText={optionHasError(fieldOption)}
              >
                <Input
                  {...{ className: 'grow' }}
                  type={'text'}
                  inputMode={'text'}
                  value={fieldOption.value || ''}
                  onChange={(event) => {
                    updateOption(fieldOption.generatedId, event.detail.value);
                  }}
                  name={id}
                  disabled={!enabled}
                  autoFocus={appliedUiSchemaOptions.focus}
                  placeholder={appliedUiSchemaOptions?.placeholder}
                />
              </FormField>
            </DraggableItem>
          ))}
        </Reorder.Group>

        <div className={'mt-4'}>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onAddOptionField();
            }}
          >
            {t('addOptionButtonLabel')}
          </Button>
        </div>
      </div>
    </CustomisableControl>
  );
};

export const AddOptionControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  AddOptionControlUnwrapped
);
