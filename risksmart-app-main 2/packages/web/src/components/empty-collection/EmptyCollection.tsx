import Box from '@risk-smart/themed-cloudscape-components/box';
import type { FC, JSX } from 'react';

type Props = {
  action: JSX.Element;
  title: string;
  subtitle: string;
};

const EmptyCollection: FC<Props> = ({ title, subtitle, action }) => {
  return (
    <Box textAlign={'center'} color={'inherit'}>
      <Box variant={'strong'} textAlign={'center'} color={'inherit'}>
        {title}
      </Box>
      <Box variant={'p'} padding={{ bottom: 's' }} color={'inherit'}>
        {subtitle}
      </Box>
      {action}
    </Box>
  );
};

export default EmptyCollection;
