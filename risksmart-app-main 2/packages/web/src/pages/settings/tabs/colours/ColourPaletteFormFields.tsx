import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import ControlledColourInput from 'src/components/form/controlled-colour-input';

import type { ColourPaletteFormData } from './colourPaletteSchema';

type Props = {
  readOnly?: boolean;
};

export const ColourPaletteFormFields: FC<Props> = ({ readOnly }) => {
  const { control } = useFormContext<ColourPaletteFormData>();

  return (
    <ControlledColourInput
      name={'colours'}
      label={''}
      control={control}
      readOnly={readOnly}
      testId={'colours'}
    />
  );
};
