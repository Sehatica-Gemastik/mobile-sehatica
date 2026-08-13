import { API_ENDPOINTS } from '@/constants/api';
import { api } from './api';

export type RdsaAsk = {
  id: string;
  userId: number;
  armId: string;
  intent: string;
  title: string;
  body: string;
  status: 'pending' | 'delivered' | 'replied' | 'expired' | 'dismissed';
  channels: string[];
  deliveredAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type RdsaTriggerResult = {
  delivered: boolean;
  reason?: string;
  ask?: RdsaAsk;
  notification?: { title: string; body: string; askId: string };
};

export const rdsaService = {
  getPendingAsks: () => api.get<RdsaAsk[]>(API_ENDPOINTS.rdsaPendingAsks),

  triggerAsk: (input?: { forceIntent?: string; localHour?: number }) =>
    api.post<RdsaTriggerResult>(API_ENDPOINTS.rdsaTriggerAsk, input ?? {}),

  ackAsk: (askId: string) =>
    api.post<RdsaAsk>(API_ENDPOINTS.rdsaAckAsk(askId), {}),
};
