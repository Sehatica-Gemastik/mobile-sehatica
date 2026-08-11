export function scheduleReminderDate(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }
  const result = new Date(`${date}T${time}:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}
