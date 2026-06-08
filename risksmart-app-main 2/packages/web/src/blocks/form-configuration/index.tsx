import { Container } from '@risksmart-app/atomic-ui';

import type { FormConfigurationProps } from './types';

function FormConfiguration({ children }: FormConfigurationProps) {
  return <Container className={'m-6 h-full'}>{children}</Container>;
}

export { FormConfiguration };
export type { FormConfigurationProps };
