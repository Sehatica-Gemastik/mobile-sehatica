import { useAuthStore } from '@/store/auth-store';
import { getLatestScreening, saveScreening } from '@/storage/screening-repository';
import { ScreeningAnswers } from '@/types';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export const screeningService = {
  latest: () => getLatestScreening(ownerUserId()),
  complete: (answers: ScreeningAnswers) => saveScreening(ownerUserId(), answers),
};
