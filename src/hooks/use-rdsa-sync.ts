import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { rdsaService } from '@/services/rdsa.service';
import { dailySyncService } from '@/services/daily-sync.service';
import { presentRdsaNotification } from '@/services/rdsa-notifications';
import { useAuthStore } from '@/store/auth-store';
import { useHealyStore } from '@/store/healy-store';

const POLL_MS = 10_000;

let syncRdsaImpl: (() => Promise<void>) | null = null;

export function syncRdsaNow() {
  return syncRdsaImpl?.() ?? Promise.resolve();
}

type AskPayload = {
  id: string;
  title: string;
  body: string;
};

async function deliverAsk(ask: AskPayload) {
  const { hasAsk, enqueue } = useHealyStore.getState();
  if (hasAsk(ask.id)) return;

  enqueue({
    id: ask.id,
    askId: ask.id,
    title: ask.title,
    text: ask.body,
  });

  await presentRdsaNotification({
    askId: ask.id,
    title: ask.title,
    body: ask.body,
  }).catch(() => false);

  void rdsaService.ackAsk(ask.id).catch(() => null);
}

export function useRdsaSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const running = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const sync = async () => {
      if (cancelled || running.current) return;
      running.current = true;

      try {
        await dailySyncService.sync().catch(() => null);

        const hasAsk = useHealyStore.getState().hasAsk;
        const pending = await rdsaService.getPendingAsks();
        const unseen = pending.filter((ask) => !hasAsk(ask.id));

        for (const ask of unseen) {
          await deliverAsk({
            id: ask.id,
            title: ask.title,
            body: ask.body,
          });
        }

        if (unseen.length === 0) {
          const hour = new Date().getHours();
          const result = await rdsaService.triggerAsk({ localHour: hour });

          if (result.delivered && result.notification && !hasAsk(result.notification.askId)) {
            await deliverAsk({
              id: result.notification.askId,
              title: result.notification.title,
              body: result.notification.body,
            });
          }
        }
      } catch (err) {
        if (Platform.OS !== 'web') {
          console.warn('[rdsa-sync]', err);
        }
      } finally {
        running.current = false;
      }
    };

    syncRdsaImpl = sync;
    sync();
    timer = setInterval(sync, POLL_MS);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => {
      cancelled = true;
      syncRdsaImpl = null;
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [isAuthenticated]);
}
