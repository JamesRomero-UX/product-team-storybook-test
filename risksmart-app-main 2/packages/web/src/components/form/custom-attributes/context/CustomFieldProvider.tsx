import type { FC, PropsWithChildren } from 'react';

import type { CustomFieldState } from './CustomFieldContext';
import { CustomFieldContext } from './CustomFieldContext';

export const CustomFieldProvider: FC<PropsWithChildren<CustomFieldState>> = ({
  children,
  currentField,
  fieldPath,
}) => {
  return (
    <CustomFieldContext.Provider value={{ currentField, fieldPath }}>
      {children}
    </CustomFieldContext.Provider>
  );
};
