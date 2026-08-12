import { create } from 'zustand';
import { ChatMessage, ChatSession } from '@/types';

interface HeallyStore {
  messages: ChatMessage[];
  sessions: ChatSession[];
  activeSessionId: number | null;
  isTyping: boolean;
  input: string;
  pendingScheduleWait: boolean;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessageVerif: (
    messageId: number,
    status: ChatMessage['verifStatus'],
    doctorName?: string | null,
    note?: string | null
  ) => void;
  setTyping: (typing: boolean) => void;
  setInput: (input: string) => void;
  setPendingScheduleWait: (pending: boolean) => void;
  reset: () => void;
}

export const useHeallyStore = create<HeallyStore>((set) => ({
  messages: [],
  sessions: [],
  activeSessionId: null,
  isTyping: false,
  input: '',
  pendingScheduleWait: false,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessageVerif: (messageId, verifStatus, verifDoctorName, verifNote) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              verifStatus,
              verifDoctorName: verifDoctorName ?? message.verifDoctorName,
              verifNote: verifNote ?? message.verifNote,
            }
          : message
      ),
    })),

  setTyping: (isTyping) => set({ isTyping }),
  setInput: (input) => set({ input }),
  setPendingScheduleWait: (pendingScheduleWait) => set({ pendingScheduleWait }),
  reset: () => set({ messages: [], isTyping: false, input: '', pendingScheduleWait: false }),
}));
