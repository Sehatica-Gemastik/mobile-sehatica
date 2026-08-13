export type CardStatus = 'done' | 'pending';

export const CARD_ICON = {
  done: { bg: '#E0F7FA', color: '#00A7B1' },
  pending: { bg: '#FFFBEB', color: '#D97706' },
} as const;

export const SCHEDULE_ICON = {
  active: { bg: '#E0F7FA', color: '#00A7B1' },
  done: { bg: '#F1F5F9', color: '#64748B' },
} as const;

export function iconStyleForStatus(status: CardStatus) {
  return CARD_ICON[status];
}
