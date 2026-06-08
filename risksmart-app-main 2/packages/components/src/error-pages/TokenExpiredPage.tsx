import Box from '@risk-smart/themed-cloudscape-components/box';
import Link from '@risk-smart/themed-cloudscape-components/link';
import type { FC } from 'react';

import ErrorContent from './ErrorContent';

const TokenExpiredPage: FC = () => {
  return (
    <ErrorContent
      title={'Authentication Session Has An Issue'}
      imgSrc={'/errors/rubiks-cube.png'}
      imgAlt={"Rubik's cube indicating an authentication issue"}
    >
      <Box variant={'p'}>
        {
          'Your authentication session has expired or is invalid. This typically occurs when:'
        }
      </Box>
      <Box variant={'p'}>
        {"Your organization's identity provider (IdP) token has expired"}
      </Box>
      <Box variant={'p'}>{'Please try the following:'}</Box>
      <Box variant={'p'}>
        {
          "Contact your IT department, as they manage your organization's authentication settings"
        }
      </Box>
      <Box variant={'p'}>
        {
          'Reference "IdP token expiration" and ask them to contact RiskSmart Customer Success at '
        }
        <Link href={'mailto:customer-success@risksmart.com'} external={true}>
          {'customer-success@risksmart.com'}
        </Link>
      </Box>
    </ErrorContent>
  );
};

export default TokenExpiredPage;
