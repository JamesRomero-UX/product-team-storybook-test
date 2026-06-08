import type { PropsWithChildren } from 'react';

import { ModalContext } from './ModalContext';

/**
 * Modal provider provides and simply way to check if a component is rendered within a modal
 * @param param0 - Props with children
 * @returns Modal context provider
 */
export const ModalProvider = ({ children }: PropsWithChildren) => {
  return <ModalContext.Provider value={true}>{children}</ModalContext.Provider>;
};
