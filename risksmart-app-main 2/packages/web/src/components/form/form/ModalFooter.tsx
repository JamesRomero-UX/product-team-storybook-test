import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { FC } from 'react';
import type { ReactNode } from 'react';

import { FormMenu } from './FormMenu';

type Props = {
  actions: ReactNode;
  footerDetails?: ReactNode;
  readOnly?: boolean;
  parentType?: FormId;
};

const ModalFooter: FC<Props> = ({
  actions,
  footerDetails,
  readOnly,
  parentType,
}) => (
  <div className={'flex justify-between w-full'}>
    <div className={'flex-1'}>{actions}</div>
    <SpaceBetween direction={'horizontal'} alignItems={'center'} size={'m'}>
      <div>{footerDetails}</div>
      {!readOnly && parentType && <FormMenu parentType={parentType} />}
    </SpaceBetween>
  </div>
);

export default ModalFooter;
