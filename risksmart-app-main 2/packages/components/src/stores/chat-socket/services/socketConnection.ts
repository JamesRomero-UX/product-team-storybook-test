import type { StateCreator } from 'zustand';

import type {
  ConnectionManagerService,
  SessionManagementService,
  SocketConnectionService,
} from '../types';

export const createSocketConnection: StateCreator<
  SocketConnectionService & SessionManagementService & ConnectionManagerService,
  [],
  [],
  SocketConnectionService
> = (set) => ({
  // State
  socket: null,
  isConnected: false,
  isConnecting: false,

  // Actions
  _setSocket: (socket) => set({ socket }),
  _setIsConnected: (isConnected) => set({ isConnected }),
  _setIsConnecting: (isConnecting) => set({ isConnecting }),
});
