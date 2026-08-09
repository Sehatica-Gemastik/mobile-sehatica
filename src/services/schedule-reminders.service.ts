import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/store/auth-store';
import { ScheduleItem } from '@/types';
import { scheduleReminderDate } from '@/utils/schedule-reminder';

const CHANNEL_ID = 'health-reminders';
const SOURCE = 'sehatica-schedule';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensurePermission(): Promise<void> {
  if (Platform.OS === 'web') throw new Error('Pengingat lokal hanya tersedia di aplikasi mobile');
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Pengingat kesehatan',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Izin notifikasi belum diberikan');
}

export const scheduleRemindersService = {
  sync: async (items: ScheduleItem[]): Promise<number> => {
    const ownerUserId = useAuthStore.getState().user?.id;
    if (!ownerUserId) throw new Error('Sesi pengguna tidak tersedia');
    await ensurePermission();

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled
      .filter((notification) => (
        notification.content.data?.source === SOURCE &&
        notification.content.data?.ownerUserId === ownerUserId
      ))
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)));

    const now = Date.now();
    const pending = items
      .map((item) => ({ item, date: scheduleReminderDate(item.scheduleDate, item.time) }))
      .filter(({ item, date }) => !item.done && date && date.getTime() > now) as {
        item: ScheduleItem;
        date: Date;
      }[];

    await Promise.all(pending.map(({ item, date }) => Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pengingat Sehatica',
        body: 'Ada aktivitas kesehatan terjadwal. Buka Sehatica untuk melihat detail.',
        data: { source: SOURCE, ownerUserId, scheduleId: item.id, url: '/(tabs)/schedule' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: CHANNEL_ID,
      },
    })));

    return pending.length;
  },
};
