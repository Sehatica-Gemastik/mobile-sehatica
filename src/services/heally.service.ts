import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { ChatMessage, HeallyAsk, VerifRequest } from '@/types';

export interface ChatResponse {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
  verifRequest: VerifRequest | null;
  llm?: { provider: string; model: string };
}

export interface TriggerAskResponse {
  delivered: boolean;
  reason?: string;
  ask?: HeallyAsk;
  message?: ChatMessage;
  notification?: { title: string; body: string; askId: string };
}

export const heallyService = {
  getMessages: () =>
    api.get<ChatMessage[]>(API_ENDPOINTS.heallyMessages),

  sendMessage: (message: string, askId?: string) =>
    api.post<ChatResponse>(API_ENDPOINTS.heallyChat, { message, askId }),

  requestVerif: (messageId: number) =>
    api.post<VerifRequest>(API_ENDPOINTS.heallyVerifRequest(messageId), {}),

  getPendingAsks: () =>
    api.get<HeallyAsk[]>(API_ENDPOINTS.heallyPendingAsks),

  triggerAsk: (payload?: { forceIntent?: string; localHour?: number }) =>
    api.post<TriggerAskResponse>(API_ENDPOINTS.heallyTriggerAsk, payload ?? {}),

  ackAsk: (askId: string) =>
    api.post<HeallyAsk>(API_ENDPOINTS.heallyAckAsk(askId), {}),
};
