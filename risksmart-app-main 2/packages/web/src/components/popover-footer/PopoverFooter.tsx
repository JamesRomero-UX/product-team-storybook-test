import Icon from '@risk-smart/themed-cloudscape-components/icon';
import type { FC } from 'react';

type PopoverFooterProps = {
  message: string;
};

const PopoverFooter: FC<PopoverFooterProps> = ({ message }) => (
  <div className={'flex items-center gap-4'}>
    <Icon name={'status-info'} /> {message}
  </div>
);

export default PopoverFooter;
