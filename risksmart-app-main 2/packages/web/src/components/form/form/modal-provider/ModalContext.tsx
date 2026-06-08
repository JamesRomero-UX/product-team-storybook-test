import { createContext, useContext } from 'react';

export const ModalContext = createContext<boolean>(false);

/**
 *
 * @returns true if component is within a modal
 */
export const useIsInModal = () => {
  const context = useContext(ModalContext);

  return !!context;
};
