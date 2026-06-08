import { useEffect, useRef } from 'react';

import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';

import { useChatService } from '../chatService';
import { useChatStore } from '../useChatStore';

export const useChatSession = () => {
  const {
    // isOpen,
    sessionId,
    sessionInitialized,
    setIsInitialising,
    setSessionId,
    setSessionInitialized,
    addMessage,
  } = useChatStore();

  const { isOpen } = useSidePanelStore();

  const { initialise, isConnected } = useChatService();
  const initializingRef = useRef(false); // Prevent multiple simultaneous initializations

  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (
      !isOpen ||
      sessionInitialized ||
      sessionId ||
      !isConnected ||
      initializingRef.current
    ) {
      return;
    }

    const initializeChatSession = async () => {
      // Double-check to prevent race conditions
      if (initializingRef.current) {
        console.log(
          'Chat session initialization already in progress, skipping'
        );

        return;
      }

      try {
        initializingRef.current = true;
        setIsInitialising(true);

        console.log('Starting chat session initialization');

        // Start initialization and minimum display time in parallel
        const [response] = await Promise.all([
          initialise(),
          new Promise((resolve) => setTimeout(resolve, 4000)), // Minimum 4 seconds display time
        ]);

        setSessionId(response.session_id);
        setSessionInitialized(true);

        console.log(
          'Chat session initialized successfully:',
          response.session_id
        );

        addMessage(
          "# Hello! 👋 I'm your RiskSmart assistant.\n\nI can help you with questions about risk management 📊 and the RiskSmart platform 🚀.\n\nFeel free to ask me anything about these topics!\n\n### Here are a few examples of things you can ask me:\n\n• How do I create a new risk assessment?\n\n• What's the difference between inherent and residual risk?\n\n• How can I set up automated risk monitoring?\n\n• What are the best practices for risk mitigation?\n\n• How do I generate risk reports in RiskSmart?",
          false,
          true
        );
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
        addMessage(
          'Sorry, I encountered an error while starting up. Please try again.',
          false,
          false
        );
      } finally {
        setIsInitialising(false);
        initializingRef.current = false; // Reset the flag
      }
    };

    initializeChatSession();

    // Cleanup function to reset initialization flag when chat is closed
    return () => {
      if (!isOpen) {
        initializingRef.current = false;
      }
    };
  }, [
    isOpen,
    sessionInitialized,
    sessionId,
    isConnected,
    initialise,
    setIsInitialising,
    setSessionId,
    setSessionInitialized,
    addMessage,
  ]);
};
