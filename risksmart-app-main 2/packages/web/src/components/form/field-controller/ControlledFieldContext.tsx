import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import { createContext } from 'react';
import type { ControllerProps } from 'react-hook-form';

export type ControlledFieldContextValue = Parameters<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ControllerProps<any, any>['render']
>[0] & {
  forceRequired: boolean;
  defaultRequired: boolean;
  allowDefaultValue?: boolean;
  defaultValueOptions?: SelectProps.Options;
};

export const ControlledFieldContext =
  createContext<ControlledFieldContextValue | null>(null);
