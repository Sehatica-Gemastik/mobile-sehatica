import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { listChatMessages, updateChatReview } from '@/storage/chat-repository';
import { ChatMessage, Doctor, DoctorPermissionRequest, ReviewScope, ReviewSummary, ReviewType, VoluntaryPendingRequest } from '@/types';
import { api } from './api';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export interface SubmitReviewPayload {
  doctorId?: number;
  reviewScope: ReviewScope;
  reviewType: ReviewType;
  isPaid?: boolean;
  fee?: string;
  patientNote?: string;
  sessionId?: number;
  clientMessageId?: number;
  patientQuestion?: string;
  aiResponse?: string;
  safetyLevel?: string;
  items?: Array<{
    clientMessageId: number;
    patientQuestion: string;
    aiResponse: string;
    safetyLevel?: string;
  }>;
}

export const reviewService = {
  submit: (
    message: ChatMessage,
    patientQuestion: string,
    doctor: Doctor,
    patientNote: string,
    reviewScope: ReviewScope = 'bubble',
    reviewType: ReviewType = 'paid'
  ) => api.post<{ id: number; status: 'pending'; expiresAt: string }>(API_ENDPOINTS.reviews, {
    doctorId: doctor.id,
    clientMessageId: message.id,
    patientQuestion,
    aiResponse: message.content,
    safetyLevel: message.safetyLevel,
    patientNote: patientNote.trim() || undefined,
    reviewScope,
    reviewType,
    isPaid: reviewType === 'paid',
  }),

  submitMultiChat: (payload: SubmitReviewPayload) =>
    api.post<{ id: number; status: 'pending'; expiresAt: string }>(API_ENDPOINTS.reviews, payload),

  getVoluntaryPendingRequests: () =>
    api.get<VoluntaryPendingRequest[]>('/reviews/voluntary-pending'),

  getDoctorPermissionRequests: () =>
    api.get<DoctorPermissionRequest[]>('/reviews/permission-requests'),

  grantDoctorPermission: (reviewId: number, action: 'grant' | 'decline') =>
    api.patch<ReviewSummary>(`/reviews/${reviewId}/grant-permission`, { action }),

  respondVoluntaryConsent: (reviewId: number, action: 'accept' | 'decline') =>
    api.patch<ReviewSummary>(`/reviews/${reviewId}/consent`, { action }),

  syncMine: async () => {
    const owner = ownerUserId();
    const reviews = await api.get<ReviewSummary[]>(API_ENDPOINTS.myReviews);
    await Promise.all(reviews.map((review) => {
      // Sync per-item or master review notes
      if (review.items && review.items.length > 0) {
        return Promise.all(review.items.map((item) => updateChatReview(
          owner,
          item.clientMessageId,
          item.itemStatus || review.status,
          review.doctorName,
          item.doctorItemNote || review.doctorSummaryNote || review.doctorNote
        )));
      }
      return updateChatReview(
        owner,
        review.clientMessageId,
        review.status,
        review.doctorName,
        review.doctorSummaryNote || review.doctorNote
      );
    }));
    return listChatMessages(owner);
  },

  markPending: async (messageId: number, doctorName: string) => {
    const owner = ownerUserId();
    await updateChatReview(owner, messageId, 'pending', doctorName, null);
    return listChatMessages(owner);
  },
};
