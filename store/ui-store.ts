import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  timestamp: number;
}

interface UIState {
  // Notifications
  notifications: Notification[];
  
  // Loading states
  isGlobalLoading: boolean;
  
  // Modal states
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setGlobalLoading: (loading: boolean) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  notifications: [],
  isGlobalLoading: false,
  isModalOpen: false,
  modalContent: null,

  // Actions
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setGlobalLoading: (loading) => {
    set({ isGlobalLoading: loading });
  },

  openModal: (content) => {
    set({ isModalOpen: true, modalContent: content });
  },

  closeModal: () => {
    set({ isModalOpen: false, modalContent: null });
  },
}));
