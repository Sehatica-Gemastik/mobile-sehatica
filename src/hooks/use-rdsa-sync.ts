import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { rdsaService } from '@/services/rdsa.service';
import { dailySyncService } from '@/services/daily-sync.service';
import {
  ensureNotificationPermission,
  presentRdsaNotification,
} from '@/services/rdsa-notifications';
import { useAuthStore } from '@/store/auth-store';

const POLL_MS = 45_000;

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
        await ensureNotificationPermission();
        await dailySyncService.sync().catch(() => null);

        let pending = await rdsaService.getPendingAsks();

        if (pending.length === 0) {
          const hour = new Date().getHours();
          const result = await rdsaService.triggerAsk({ localHour: hour });
          if (result.delivered && result.notification) {
            await presentRdsaNotification(result.notification);
            pending = await rdsaService.getPendingAsks();
          }
        }

        for (const ask of pending) {
          const shown = await presentRdsaNotification({
            askId: ask.id,
            title: ask.title,
            body: ask.body,
          });
          if (shown) {
            await rdsaService.ackAsk(ask.id).catch(() => null);
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

    sync();
    timer = setInterval(sync, POLL_MS);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [isAuthenticated]);
}
