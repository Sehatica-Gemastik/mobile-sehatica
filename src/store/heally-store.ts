import { create } from 'zustand';
import { ChatMessage, ChatSession } from '@/types';

interface HeallyStore {
  messages: ChatMessage[];
  sessions: ChatSession[];
  activeSessionId: number | null;
  isTyping: boolean;
  activeTab: 'chat' | 'whatsapp';
  input: string;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setActiveSessionId: (sessionId: number | null) => void;
  setTyping: (typing: boolean) => void;
  setActiveTab: (tab: 'chat' | 'whatsapp') => void;
  setInput: (input: string) => void;
  reset: () => void;
}

export const useHeallyStore = create<HeallyStore>((set) => ({
  messages: [],
  sessions: [],
  activeSessionId: null,
  isTyping: false,
  activeTab: 'chat',
  input: '',

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
  setTyping: (isTyping) => set({ isTyping }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setInput: (input) => set({ input }),
  reset: () =>
    set({ messages: [], sessions: [], activeSessionId: null, isTyping: false, activeTab: 'chat', input: '' }),
}));
