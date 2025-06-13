import { create } from 'zustand';
import type { Notification } from '@/types/notifications';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === id 
        ? { ...notification, isRead: true, readAt: new Date() }
        : notification
    ),
    unreadCount: state.notifications.find(n => n.id === id && !n.isRead) 
      ? state.unreadCount - 1 
      : state.unreadCount
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(notification => ({
      ...notification,
      isRead: true,
      readAt: notification.readAt || new Date()
    })),
    unreadCount: 0
  })),
  
  deleteNotification: (id) => set((state) => {
    const notification = state.notifications.find(n => n.id === id);
    return {
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notification && !notification.isRead 
        ? state.unreadCount - 1 
        : state.unreadCount
    };
  }),
  
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
}));