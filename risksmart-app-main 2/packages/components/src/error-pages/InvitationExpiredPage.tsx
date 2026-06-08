import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';

import ErrorContent from './ErrorContent';

const Page: FC = () => {
  return (
    <ErrorContent
      title={'Oops! That invitation has expired'}
      imgSrc={'/errors/exclamation.svg'}
      imgAlt={'Exclamation mark'}
    >
      <Box variant={'p'} textAlign={'center'}>
        {'Hold it there. You’re invitation link has expired.'}
      </Box>
      <Box variant={'p'} textAlign={'center'}>
        {
          'If you’ve already logged in before, search for ‘Welcome to RiskSmart’ in'
        }
        {'your inbox, and follow the link in that email.'}
      </Box>
      <Box variant={'p'} textAlign={'center'}>
        {'If you haven’t logged in, then you’ll need to speak to your'}
        {'administrator to get you another link.'}
      </Box>
    </ErrorContent>
  );
};

export default Page;
