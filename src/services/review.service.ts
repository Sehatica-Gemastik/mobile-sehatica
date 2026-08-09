import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { listChatMessages, updateChatReview } from '@/storage/chat-repository';
import { ChatMessage, Doctor, ReviewSummary } from '@/types';
import { api } from './api';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export const reviewService = {
  submit: (
    message: ChatMessage,
    patientQuestion: string,
    doctor: Doctor,
    patientNote: string
  ) => api.post<{ id: number; status: 'pending'; expiresAt: string }>(API_ENDPOINTS.reviews, {
    doctorId: doctor.id,
    clientMessageId: message.id,
    patientQuestion,
    aiResponse: message.content,
    safetyLevel: message.safetyLevel,
    patientNote: patientNote.trim() || undefined,
  }),

  syncMine: async () => {
    const owner = ownerUserId();
    const reviews = await api.get<ReviewSummary[]>(API_ENDPOINTS.myReviews);
    await Promise.all(reviews.map((review) => updateChatReview(
      owner,
      review.clientMessageId,
      review.status,
      review.doctorName,
      review.doctorNote
    )));
    return listChatMessages(owner);
  },

  markPending: async (messageId: number, doctorName: string) => {
    const owner = ownerUserId();
    await updateChatReview(owner, messageId, 'pending', doctorName, null);
    return listChatMessages(owner);
  },
};
