import { create } from 'zustand';

export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  id: number;
  message: string;
  severity: NotificationSeverity;
}

interface NotificationState {
  queue: AppNotification[];
  enqueue: (message: string, severity?: NotificationSeverity) => void;
  remove: (id: number) => void;
}

let counter = 1;

export const useNotificationStore = create<NotificationState>((set) => ({
  queue: [],
  enqueue: (message, severity = 'info') =>
    set((state) => ({
      queue: [...state.queue, { id: counter++, message, severity }]
    })),
  remove: (id) =>
    set((state) => ({
      queue: state.queue.filter((n) => n.id !== id)
    }))
}));

