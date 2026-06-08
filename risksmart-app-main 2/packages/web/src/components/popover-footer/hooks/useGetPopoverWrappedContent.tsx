import Popover from '@risk-smart/themed-cloudscape-components/popover';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

import PopoverFooter from '../PopoverFooter';

const useGetPopoverWrappedContent = (
  onClick?: () => void,
  noClickthroughMessageContent?: string
) => {
  return useCallback(
    (content: ReactNode) => {
      if (onClick || !noClickthroughMessageContent) {
        return content;
      } else {
        return (
          <Popover
            header={' '}
            dismissButton={false}
            position={'bottom'}
            size={'medium'}
            triggerType={'custom'}
            content={<PopoverFooter message={noClickthroughMessageContent} />}
          >
            {content}
          </Popover>
        );
      }
    },
    [noClickthroughMessageContent, onClick]
  );
};

export default useGetPopoverWrappedContent;
