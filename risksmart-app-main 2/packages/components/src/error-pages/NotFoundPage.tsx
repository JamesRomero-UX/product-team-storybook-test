import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC } from 'react';

import ErrorContent from './ErrorContent';

const Page: FC = () => {
  return (
    <ErrorContent
      title={'Go manage risk with confid- wait, what?'}
      imgSrc={'/errors/binoculars.png'}
      imgAlt={'binoculars'}
    >
      <Box variant={'p'}>
        {`We’re not sure how you ended up here. Did you paste an old spreadsheet
        formula in the address bar?`}
      </Box>

      <Box variant={'p'}>
        {`Let’s get back to doing what you do best –
        managing risk.`}
      </Box>
    </ErrorContent>
  );
};

export default Page;
