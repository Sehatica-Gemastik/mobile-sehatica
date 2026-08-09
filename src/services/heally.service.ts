import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import {
  clearChatMessages,
  createChatMessage,
  listChatMessages,
} from '@/storage/chat-repository';
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

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

function inferSafetyLevel(message: Partial<ChatMessage>): ChatSafetyLevel {
  if (message.safetyLevel) return message.safetyLevel;
  if (message.needsVerif) return 'review';
  return 'general';
}

function mergeAssistantMessage(local: ChatMessage, remote: ChatMessage): ChatMessage {
  return {
    ...local,
    safetyLevel: inferSafetyLevel(remote),
    safetyReasons: remote.safetyReasons ?? local.safetyReasons ?? [],
    needsVerif: remote.needsVerif ?? local.needsVerif,
    thinkingSummary: remote.thinkingSummary ?? null,
    thinkingDetail: remote.thinkingDetail ?? null,
    askId: remote.askId ?? null,
    verifStatus: remote.verifStatus ?? local.verifStatus,
    verifDoctorName: remote.verifDoctorName ?? local.verifDoctorName,
    verifNote: remote.verifNote ?? local.verifNote,
  };
}

export const heallyService = {
  getMessages: () => listChatMessages(ownerUserId()),

  saveUserMessage: (message: string, askId?: string) =>
    createChatMessage(ownerUserId(), {
      role: 'user',
      content: message,
    }).then((saved) => (askId ? { ...saved, askId } : saved)),

  replyTo: async (userMessage: ChatMessage) => {
    const response = await api.post<ChatResponse>(API_ENDPOINTS.heallyChat, {
      message: userMessage.content,
      askId: userMessage.askId ?? undefined,
    });

    const local = await createChatMessage(ownerUserId(), {
      role: 'assistant',
      content: response.aiMessage.content,
      needsVerif: response.aiMessage.needsVerif,
      safetyLevel: inferSafetyLevel(response.aiMessage),
      safetyReasons: response.aiMessage.safetyReasons ?? [],
    });

    return mergeAssistantMessage(local, response.aiMessage);
  },

  sendMessage: (message: string, askId?: string) =>
    api.post<ChatResponse>(API_ENDPOINTS.heallyChat, { message, askId }),

  clear: () => clearChatMessages(ownerUserId()),

  requestVerif: (messageId: number) =>
    api.post<VerifRequest>(API_ENDPOINTS.heallyVerifRequest(messageId), {}),

  getPendingAsks: () =>
    api.get<HeallyAsk[]>(API_ENDPOINTS.heallyPendingAsks),

  triggerAsk: (payload?: { forceIntent?: string; localHour?: number }) =>
    api.post<TriggerAskResponse>(API_ENDPOINTS.heallyTriggerAsk, payload ?? {}),

  ackAsk: (askId: string) =>
    api.post<HeallyAsk>(API_ENDPOINTS.heallyAckAsk(askId), {}),
};
