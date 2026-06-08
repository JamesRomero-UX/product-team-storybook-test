import Box from '@risk-smart/themed-cloudscape-components/box';
import Link from '@risk-smart/themed-cloudscape-components/link';
import type { FC } from 'react';

import ErrorContent from './ErrorContent';
import { customerSupportEmail } from './utils';

const Page: FC = () => {
  return (
    <ErrorContent
      title={'We couldn’t find that user'}
      imgSrc={'/errors/binoculars.png'}
      imgAlt={'binoculars'}
    >
      <Box variant={'p'} textAlign={'center'}>
        {
          'And we looked everywhere. There could be an issue with your invitation'
        }
        {'link, or you might be trying to access an organisation you’re not a'}
        {'member of.'}
      </Box>
      <Box variant={'p'} textAlign={'center'}>
        {'Please contact an administrator.'}
      </Box>
      <Box variant={'p'} textAlign={'center'}>
        <Link href={`email:${customerSupportEmail}`}>
          {customerSupportEmail}
        </Link>
      </Box>
    </ErrorContent>
  );
};

export default Page;
