import { useAuthStore } from '@/store/auth-store';
import { getLatestScreening, saveScreening } from '@/storage/screening-repository';
import { ScreeningAnswers } from '@/types';
import { dailySyncService } from './daily-sync.service';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export const screeningService = {
  latest: () => getLatestScreening(ownerUserId()),
  complete: async (answers: ScreeningAnswers) => {
    const session = await saveScreening(ownerUserId(), answers);
    await dailySyncService.sync();
    return session;
  },
};
