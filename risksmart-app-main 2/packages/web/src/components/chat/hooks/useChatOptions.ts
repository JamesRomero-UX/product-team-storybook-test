import { useCallback, useEffect, useRef } from 'react';

import type { ChatOption } from '../types';
import { useChatStore } from '../useChatStore';

export const useChatOptions = (
  sendMessage: (message: string) => Promise<void>
) => {
  const {
    messages,
    sessionInitialized,
    isInitialising,
    setOptions,
    clearOptions,
  } = useChatStore();

  const optionsSetRef = useRef(false);

  const createExampleOptions = useCallback(
    (): ChatOption[] => [
      {
        id: 'risk-assessment',
        label: 'Risk assessment basics',
        action: () =>
          sendMessage(
            'What are the key steps in conducting a risk assessment?'
          ),
      },
      {
        id: 'inherent-vs-residual',
        label: 'Inherent vs residual risk',
        action: () =>
          sendMessage(
            'What is the difference between inherent and residual risk?'
          ),
      },
      {
        id: 'risk-monitoring',
        label: 'Risk monitoring',
        action: () =>
          sendMessage(
            'How can I set up automated risk monitoring in RiskSmart?'
          ),
      },
      {
        id: 'risk-mitigation',
        label: 'Risk mitigation strategies',
        action: () =>
          sendMessage('What are the four main risk treatment strategies?'),
      },
      {
        id: 'risk-frameworks',
        label: 'Risk management frameworks',
        action: () =>
          sendMessage(
            'What are some common risk management frameworks and standards?'
          ),
      },
    ],
    [sendMessage]
  );

  useEffect(() => {
    const hasSystemMessage = messages.some((message) => message.isSystem);
    const shouldShowOptions =
      hasSystemMessage && sessionInitialized && !isInitialising;
    const shouldClearOptions = !hasSystemMessage;

    if (shouldShowOptions && !optionsSetRef.current) {
      setOptions(createExampleOptions());
      optionsSetRef.current = true;
    } else if (shouldClearOptions && optionsSetRef.current) {
      clearOptions();
      optionsSetRef.current = false;
    }
  }, [
    messages,
    sessionInitialized,
    isInitialising,
    setOptions,
    clearOptions,
    sendMessage,
    createExampleOptions,
  ]);
};
