import type { ModalProps } from '@risk-smart/themed-cloudscape-components/modal';
import Modal from '@risk-smart/themed-cloudscape-components/modal';
import type { FC } from 'react';

import style from './style.module.scss';

const RSModal: FC<ModalProps> = (props) => {
  return <Modal {...props} {...{ className: style.modal }} />;
};

export default RSModal;
