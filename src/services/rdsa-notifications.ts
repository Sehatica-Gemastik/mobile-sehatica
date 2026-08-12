import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const NOTIFIED_KEY = 'rdsa_notified_ask_ids';

type NotificationsModule = typeof import('expo-notifications');

let Notifications: NotificationsModule | null = null;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web') return null;
  if (Notifications) return Notifications;
  try {
    Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return Notifications;
  } catch {
    return null;
  }
}

async function readNotifiedIds(): Promise<Set<string>> {
  try {
    const raw = await SecureStore.getItemAsync(NOTIFIED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function writeNotifiedIds(ids: Set<string>) {
  const arr = [...ids].slice(-100);
  await SecureStore.setItemAsync(NOTIFIED_KEY, JSON.stringify(arr));
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const mod = await loadNotifications();
  if (!mod) return false;
  const current = await mod.getPermissionsAsync();
  if (current.granted) return true;
  const req = await mod.requestPermissionsAsync();
  return req.granted;
}

export async function presentRdsaNotification(input: {
  askId: string;
  title: string;
  body: string;
}): Promise<boolean> {
  const notified = await readNotifiedIds();
  if (notified.has(input.askId)) return false;

  const mod = await loadNotifications();
  if (!mod) {
    notified.add(input.askId);
    await writeNotifiedIds(notified);
    return false;
  }

  const ok = await ensureNotificationPermission();
  if (!ok) return false;

  await mod.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
      data: { askId: input.askId, type: 'rdsa_ask' },
      sound: true,
    },
    trigger: null,
  });

  notified.add(input.askId);
  await writeNotifiedIds(notified);
  return true;
}
