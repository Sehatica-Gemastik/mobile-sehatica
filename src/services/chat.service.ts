import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';

export type ChatMessage = {
  id: number;
  role: 'user' | 'doctor';
  content: string;
  createdAt: string;
};

export type ChatThread = {
  doctor: {
    id: number;
    name: string;
    specialty: string;
    avatarInitials: string;
    isAvailable: boolean;
  };
  messages: ChatMessage[];
};

export const chatService = {
  getThread: (doctorId: number) =>
    api.get<ChatThread>(API_ENDPOINTS.chatMessages(doctorId)),

  sendMessage: (doctorId: number, content: string) =>
    api.post<ChatMessage>(API_ENDPOINTS.chatMessages(doctorId), { content }),
};
