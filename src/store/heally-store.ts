import { create } from 'zustand';
import { ChatMessage } from '@/types';

interface HeallyStore {
  messages: ChatMessage[];
  isTyping: boolean;
  activeTab: 'chat' | 'whatsapp';
  input: string;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessageVerif: (
    messageId: number,
    status: 'pending' | 'approved' | 'revised',
    doctorName?: string,
    note?: string
  ) => void;
  setTyping: (typing: boolean) => void;
  setActiveTab: (tab: 'chat' | 'whatsapp') => void;
  setInput: (input: string) => void;
  reset: () => void;
}

export const useHeallyStore = create<HeallyStore>((set) => ({
  messages: [],
  isTyping: false,
  activeTab: 'chat',
  input: '',

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessageVerif: (messageId, status, doctorName, note) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              verifStatus: status,
              verifDoctorName: doctorName ?? m.verifDoctorName,
              verifNote: note ?? m.verifNote,
            }
          : m
      ),
    })),

  setTyping: (isTyping) => set({ isTyping }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setInput: (input) => set({ input }),
  reset: () =>
    set({ messages: [], isTyping: false, activeTab: 'chat', input: '' }),
}));
