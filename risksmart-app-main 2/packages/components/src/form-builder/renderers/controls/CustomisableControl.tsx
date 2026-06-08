import { useJsonForms } from '@jsonforms/react';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import { Dataflow03, InfoCircle } from '@untitled-ui/icons-react';
import type { FC, ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import type { CustomSchemaProperty, CustomUISchemaElement } from '../../types';
import {
  infoIconStyles,
  isElementHidden,
  isFieldConditionallyRequired,
} from '../../utils';
import styles from './style.module.scss';

interface CustomisableControlProps {
  errors: string;
  schema: CustomSchemaProperty;
  uischema: CustomUISchemaElement;
  children: ReactNode | ReactNode[];
  required?: boolean;
  id: string;
  visible: boolean;
}

export const CustomisableControl: FC<CustomisableControlProps> = ({
  children,
  schema,
  uischema,
  errors,
  required,
}) => {
  const { core } = useJsonForms();
  const { isFormDirty, schema: globalSchema } = useFormBuilderStore(
    useShallow((state) => ({
      schema: state.schema,
      isFormDirty: state.isFormDirty,
    }))
  );

  const isRequired =
    required ||
    globalSchema?.required?.includes(uischema.id) ||
    isFieldConditionallyRequired(uischema.id);

  return (
    <>
      {isElementHidden(uischema, core?.data) ? null : (
        <div className={'pb-6 w-full'} data-testid={'customisable-control'}>
          <FormField
            data-testid={`form-field-${uischema.scope}`}
            errorText={isFormDirty ? errors : ''}
            stretch={true}
            label={
              <div className={'flex gap-3 items-center'}>
                <div>
                  <div className={'flex gap-2'}>
                    <div>{uischema?.label || ''}</div>
                    {isRequired ? (
                      <div className={'font-normal text-red'}>{'*'}</div>
                    ) : null}
                  </div>
                </div>
                <div className={`flex gap-3 ${styles.customisableControl}`}>
                  {uischema?.options?.description ? (
                    <Popover
                      size={'large'}
                      dismissButton={false}
                      triggerType={'custom'}
                      content={uischema.options.description}
                    >
                      <InfoCircle
                        viewBox={'0 0 24 24'}
                        className={'relative ' + infoIconStyles}
                        data-testid={'field-guidance-button'}
                      />
                    </Popover>
                  ) : null}
                  {schema?.isCustomisable &&
                  uischema?.options?.showConditionalIndicator ? (
                    <Popover
                      size={'large'}
                      dismissButton={false}
                      triggerType={'custom'}
                      content={'This field has conditional logic applied'}
                    >
                      <Dataflow03 className={infoIconStyles} />
                    </Popover>
                  ) : null}
                </div>
              </div>
            }
          >
            {children}
          </FormField>
        </div>
      )}
    </>
  );
};
