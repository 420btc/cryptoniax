'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'reward';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => {
      const newToasts = [...state.toasts, { ...toast, id }];
      return { toasts: newToasts.slice(-3) }; // Keep only last 3
    });
    
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const toast = {
  success: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'success', title, message, duration }),
  error: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'error', title, message, duration }),
  info: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'info', title, message, duration }),
  reward: (title: string, message?: string, duration?: number) => 
    useToastStore.getState().addToast({ type: 'reward', title, message, duration }),
};
