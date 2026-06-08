import type { StateCreator } from 'zustand';

import type {
  ConnectionManagerService,
  SessionManagementService,
  SocketConnectionService,
} from '../types';

export const createSessionManagement: StateCreator<
  SessionManagementService & SocketConnectionService & ConnectionManagerService,
  [],
  [],
  SessionManagementService
> = (set, get) => ({
  // State
  activeSession: null,
  hasJoined: false,

  // Public API
  setActiveSession: (session) => {
    console.log('Active session updated:', session?.session_id || 'cleared');
    set({
      activeSession: session,
      hasJoined: false, // Reset join status when session changes
    });
  },

  getActiveSession: () => get().activeSession,

  markSessionJoined: () => {
    console.log('Session marked as joined');
    set({ hasJoined: true });
  },

  // Internal
  _resetSession: () =>
    set({
      activeSession: null,
      hasJoined: false,
    }),
});
