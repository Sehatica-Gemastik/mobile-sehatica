import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { ChatMessage, VerifRequest } from '@/types';

export interface ChatResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  verifRequest: VerifRequest | null;
}

export const heallyService = {
  getMessages: () =>
    api.get<ChatMessage[]>(API_ENDPOINTS.heallyMessages),

  sendMessage: (message: string) =>
    api.post<ChatResponse>(API_ENDPOINTS.heallyChat, { message }),

  requestVerif: (messageId: number) =>
    api.post<VerifRequest>(API_ENDPOINTS.heallyVerifRequest(messageId), {}),
};
