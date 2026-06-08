import { set } from 'lodash';
import { memo, useCallback } from 'react';

import styles from './style.module.scss';

interface ColourInputProps {
  value: string | string[];
  onChange: (newValue: string | string[]) => void;
  testId?: string;
}

export const ColourInput = memo<ColourInputProps>(
  ({ value, onChange, testId }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (Array.isArray(value)) {
          const newValue = [...value];
          set(newValue, index, e.target.value);
          onChange(newValue);
        } else {
          onChange(e.target.value);
        }
      },
      [onChange, value]
    );

    return (
      <div
        className={
          'grid grid-flow-col grid-rows-8 md:grid-rows-4 gap-x-8 gap-y-4 max-w-[700px] mt-8'
        }
      >
        {(Array.isArray(value) ? value : [value]).map((colour, index) => (
          <div key={index} className={'flex flex-row justify-start'}>
            <div className={'self-center w-[80px]'}>
              {colour.toLocaleLowerCase()}
            </div>
            <input
              data-testid={testId ? `form-fields-${testId}` : undefined}
              type={'color'}
              value={colour}
              onChange={(e) => handleChange(e, index)}
              className={styles.colourPicker}
              style={{ backgroundColor: colour }}
            />
          </div>
        ))}
      </div>
    );
  }
);

ColourInput.displayName = 'ColourInput';
