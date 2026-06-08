import type { InputProps } from '@risk-smart/themed-cloudscape-components/input';
import { formatUrl } from '@risksmart-app/components/src/utils/linkUtils';
import { Link01 } from '@untitled-ui/icons-react';
import type { FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Circle } from '@/components/Circle';

import ControlledInput from '../controlled-input';
import type { ControlledBaseProps } from '../types';

type Props<T extends FieldValues> = ControlledBaseProps<T> &
  Omit<InputProps, 'value'>;

const ControlledLinkInput = <T extends FieldValues>({ ...props }: Props<T>) => {
  const { watch, getFieldState } = useFormContext();

  const value = watch(props.name);
  const { invalid, isDirty } = getFieldState(props.name);
  const showLink = !invalid && !isDirty && value;

  return (
    <ControlledInput
      {...props}
      adornment={
        showLink && (
          <a
            target={'_blank'}
            className={'active:text-navy_light text-navy_light ml-3'}
            href={formatUrl(value)}
            rel={'noreferrer'}
          >
            <Circle>
              <Link01 transform={'scale(0.75)'} />
            </Circle>
          </a>
        )
      }
    />
  );
};

export default ControlledLinkInput;
