import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { heallyService } from '@/services/heally.service';
import {
  ensureNotificationPermission,
  presentHeallyAskNotification,
} from '@/services/heally-notifications';
import { useAuthStore } from '@/store/auth-store';

const POLL_MS = 45_000;

/**
 * Polls pending Heally asks, triggers one if none (dev-friendly),
 * and surfaces local notifications.
 */
export function useHeallyAskSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
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
        let pending = await heallyService.getPendingAsks();

        if (pending.length === 0) {
          const hour = new Date().getHours();
          const result = await heallyService.triggerAsk({ localHour: hour });
          if (result.delivered && result.notification) {
            await presentHeallyAskNotification(result.notification);
            queryClient.invalidateQueries({ queryKey: ['heally-messages'] });
            pending = await heallyService.getPendingAsks();
          }
        }

        for (const ask of pending) {
          const shown = await presentHeallyAskNotification({
            askId: ask.id,
            title: ask.title,
            body: ask.body,
          });
          if (shown) {
            await heallyService.ackAsk(ask.id).catch(() => null);
          }
        }

        if (pending.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['heally-messages'] });
        }
      } catch (err) {
        if (Platform.OS !== 'web') {
          console.warn('[heally-ask-sync]', err);
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
  }, [isAuthenticated, queryClient]);
}
