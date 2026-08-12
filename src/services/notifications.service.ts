import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ScheduleItem } from '@/types';

// ── Reminder Lokal (Sehatica_PRD_A §2.4) ─────────────────────────────────────
//
// Wajib device-local scheduling (bukan push server-trigger) supaya reminder
// tetap jalan walau koneksi tidak stabil. Web tidak didukung karena
// expo-notifications tidak bisa menjadwalkan notifikasi lokal yang jalan
// setelah tab ditutup di platform web — hanya no-op di sana.
const SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = false;
async function ensureAndroidChannel() {
  if (!SUPPORTED || Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync('schedule-reminders', {
    name: 'Pengingat Jadwal',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  channelReady = true;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!SUPPORTED) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function labelForType(item: ScheduleItem): string {
  const map: Record<string, string> = {
    food: 'Waktunya makan',
    pill: 'Waktunya minum obat',
    exercise: 'Waktunya olahraga',
    water: 'Waktunya minum air',
    other: 'Pengingat jadwal',
  };
  return map[item.type] ?? 'Pengingat jadwal';
}

function scheduledDateFor(item: ScheduleItem): Date | null {
  const [hh, mm] = item.time.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const date = new Date(`${item.scheduleDate}T00:00:00`);
  date.setHours(hh, mm, 0, 0);
  return date;
}

export async function cancelReminderForItem(itemId: number): Promise<void> {
  if (!SUPPORTED) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.content.data?.scheduleItemId === itemId);
  await Promise.all(toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function scheduleReminderForItem(item: ScheduleItem): Promise<void> {
  if (!SUPPORTED) return;

  // Selalu cancel dulu supaya update (waktu berubah) tidak numpuk reminder ganda.
  await cancelReminderForItem(item.id);

  if (item.done) return; // sudah selesai, tidak perlu diingatkan lagi

  const date = scheduledDateFor(item);
  if (!date || date.getTime() <= Date.now()) return; // waktu sudah lewat hari ini

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await ensureAndroidChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: labelForType(item),
      body: item.detail ? `${item.label} — ${item.detail}` : item.label,
      data: { scheduleItemId: item.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: Platform.OS === 'android' ? 'schedule-reminders' : undefined,
    } as Notifications.DateTriggerInput,
  });
}

// Dipanggil sekali saat Smart Schedule dimuat, buat sinkronkan reminder untuk
// semua item hari ini (mis. setelah reinstall app / app dibuka lagi).
export async function resyncRemindersForItems(items: ScheduleItem[]): Promise<void> {
  if (!SUPPORTED) return;
  for (const item of items) {
    await scheduleReminderForItem(item);
  }
}
