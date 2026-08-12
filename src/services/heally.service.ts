import { API_ENDPOINTS } from '@/constants/api';
import { ChatMessage, ChatSafetyLevel, HeallyAsk, VerifRequest } from '@/types';
import { api } from './api';

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

function inferSafetyLevel(message: Partial<ChatMessage>): ChatSafetyLevel {
  if (message.safetyLevel) return message.safetyLevel;
  if (message.needsVerif) return 'review';
  return 'general';
}

function normalizeChatMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    safetyLevel: inferSafetyLevel(message),
    safetyReasons: message.safetyReasons ?? [],
    createdAt:
      typeof message.createdAt === 'string'
        ? message.createdAt
        : new Date(message.createdAt as unknown as string).toISOString(),
  };
}

export const heallyService = {
  getMessages: async () => {
    const rows = await api.get<ChatMessage[]>(API_ENDPOINTS.heallyMessages);
    return rows.map(normalizeChatMessage);
  },

  sendMessage: async (message: string, askId?: string) => {
    const response = await api.post<ChatResponse>(API_ENDPOINTS.heallyChat, {
      message,
      askId,
    });
    return {
      ...response,
      userMessage: normalizeChatMessage(response.userMessage),
      aiMessage: normalizeChatMessage(response.aiMessage),
    };
  },

  requestVerif: (messageId: number) =>
    api.post<VerifRequest>(API_ENDPOINTS.heallyVerifRequest(messageId), {}),

  getPendingAsks: () =>
    api.get<HeallyAsk[]>(API_ENDPOINTS.heallyPendingAsks),

  triggerAsk: (payload?: { forceIntent?: string; localHour?: number }) =>
    api.post<TriggerAskResponse>(API_ENDPOINTS.heallyTriggerAsk, payload ?? {}),

  ackAsk: (askId: string) =>
    api.post<HeallyAsk>(API_ENDPOINTS.heallyAckAsk(askId), {}),

  getThinkingSteps: (context?: 'schedule' | 'resume' | 'default') => {
    const query =
      context && context !== 'default' ? `?context=${context}` : '';
    return api.get<{ steps: string[] }>(`${API_ENDPOINTS.heallyThinkingSteps}${query}`);
  },
};
