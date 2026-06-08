import type { InputProps } from '@risk-smart/themed-cloudscape-components/input';
import { formatUrl } from '@risksmart-app/components/src/utils/linkUtils';
import { Link01 } from '@untitled-ui/icons-react';
import type { FC } from 'react';
import { TextInputWithFormField } from 'src/components/form/controlled-input/TextInputWithFormField';

import { Circle } from '@/components/Circle';

import type { CustomAttributeProps } from './CustomAttributeProps';

interface CustomAttributeLinkInputProps extends CustomAttributeProps {
  type?: InputProps.Type;
}

export const CustomAttributeLinkInput: FC<CustomAttributeLinkInputProps> = ({
  value,
  onChange,
  label,
  type,
  error,
  disabled,
  description,
}) => {
  return (
    <TextInputWithFormField
      testId={label}
      guidance={description}
      label={label}
      disabled={disabled}
      type={type}
      value={value}
      onChange={(val) => onChange(`${val}`)}
      errorMessage={error}
      adornment={
        value && (
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
