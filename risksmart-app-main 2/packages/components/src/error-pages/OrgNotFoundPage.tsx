import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';

import Link from '../link';
import ErrorContent from './ErrorContent';
import { customerSupportEmail } from './utils';

const Page: FC = () => {
  return (
    <ErrorContent
      hideBackToHome={true}
      title={'Organisation not found'}
      imgSrc={'/errors/binoculars.png'}
      imgAlt={'binoculars'}
    >
      <Box variant={'p'} textAlign={'center'}>
        {'This could be because you'}&apos;{'ve logged out, or because the'}
        {'organisation ID that you'}&apos;
        {'ve tried to navigate to is invalid.'}
      </Box>
      <Box variant={'p'} textAlign={'center'}>
        {'Please contact an administrator for help or email'}{' '}
        <Link href={`email:${customerSupportEmail}`}>
          {customerSupportEmail}
        </Link>
      </Box>
    </ErrorContent>
  );
};

export default Page;
