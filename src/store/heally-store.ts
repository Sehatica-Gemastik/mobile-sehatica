import { create } from 'zustand';
import { ChatMessage } from '@/types';

interface HeallyStore {
  messages: ChatMessage[];
  isTyping: boolean;
  activeTab: 'chat' | 'whatsapp';
  input: string;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
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

  setTyping: (isTyping) => set({ isTyping }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setInput: (input) => set({ input }),
  reset: () =>
    set({ messages: [], isTyping: false, activeTab: 'chat', input: '' }),
}));
