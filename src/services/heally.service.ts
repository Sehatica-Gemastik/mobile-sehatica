import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import {
  clearChatMessages,
  createChatMessage,
  listChatMessages,
} from '@/storage/chat-repository';
import { listDailyLogs } from '@/storage/daily-logs-repository';
import { listRecords } from '@/storage/records-repository';
import { listSchedules } from '@/storage/schedules-repository';
import { ChatMessage, ChatSafetyLevel } from '@/types';
import { localDateKey } from '@/utils/local-date';
import { api } from './api';

type ChatApiResponse = {
  content: string;
  safety: { level: ChatSafetyLevel; reasons: string[] };
  verificationRecommended: boolean;
};

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export const heallyService = {
  getMessages: () => listChatMessages(ownerUserId()),

  saveUserMessage: (message: string) => createChatMessage(ownerUserId(), {
    role: 'user',
    content: message,
  }),

  replyTo: async (userMessage: ChatMessage) => {
    const owner = ownerUserId();
    const today = localDateKey();
    const [messages, records, schedules, dailyLogs] = await Promise.all([
      listChatMessages(owner, 13),
      listRecords(owner),
      listSchedules(owner, today),
      listDailyLogs(owner, today),
    ]);
    const conversationTail = messages
      .filter((message) => message.id !== userMessage.id)
      .slice(-12)
      .map(({ role, content }) => ({ role, content: content.slice(0, 4_000) }));
    const response = await api.post<ChatApiResponse>(API_ENDPOINTS.aiChat, {
      message: userMessage.content,
      conversationTail,
      healthContext: {
        records: records.slice(0, 5).map(({ title, summary, content }) => ({
          title: title.slice(0, 120),
          detail: (summary ?? content ?? '').slice(0, 800),
        })),
        schedules: schedules.slice(0, 20).map(({ type, label, detail, time, done }) => ({
          type, label, detail, time, done,
        })),
        dailyLogs: dailyLogs.slice(0, 30).map(({ type, title, quantity, detail, time }) => ({
          type, title, quantity, detail, time,
        })),
      },
      locale: 'id-ID',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (
      !response ||
      typeof response.content !== 'string' ||
      !response.content.trim() ||
      response.content.length > 8_000 ||
      !response.safety ||
      !['general', 'review', 'urgent'].includes(response.safety.level) ||
      !Array.isArray(response.safety.reasons) ||
      typeof response.verificationRecommended !== 'boolean'
    ) {
      throw new Error('Respons Heally tidak valid');
    }
    return createChatMessage(owner, {
      role: 'assistant',
      content: response.content,
      safetyLevel: response.safety.level,
      safetyReasons: response.safety.reasons,
      needsVerif: response.verificationRecommended,
    });
  },

  clear: () => clearChatMessages(ownerUserId()),
};
