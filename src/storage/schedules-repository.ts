import { ScheduleItem, ScheduleType } from '@/types';
import { getHealthDatabase } from './health-db';

const SCHEDULE_COLUMNS = `
  id, owner_user_id, type, label, detail, time, done, schedule_date,
  is_ai_generated, color_scheme, created_at
`;

type ScheduleRow = {
  id: number;
  owner_user_id: number;
  type: ScheduleType;
  label: string;
  detail: string | null;
  time: string;
  done: number;
  schedule_date: string;
  is_ai_generated: number;
  color_scheme: string | null;
  created_at: string;
};

export type CreateScheduleInput = {
  type: ScheduleType;
  label: string;
  detail?: string | null;
  time: string;
  scheduleDate: string;
  isAiGenerated?: boolean;
  colorScheme?: string | null;
};

const VALID_TYPES = new Set<ScheduleType>(['food', 'pill', 'exercise', 'water', 'other']);

function validateInput(input: CreateScheduleInput): CreateScheduleInput {
  const label = input.label.trim();
  if (!VALID_TYPES.has(input.type)) throw new Error('Tipe aktivitas tidak valid');
  if (!label) throw new Error('Nama aktivitas wajib diisi');
  if (label.length > 120 || (input.detail?.length ?? 0) > 500) {
    throw new Error('Detail aktivitas terlalu panjang');
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
    throw new Error('Waktu harus menggunakan format HH:MM');
  }
  const parsedDate = new Date(`${input.scheduleDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.scheduleDate) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== input.scheduleDate
  ) {
    throw new Error('Tanggal jadwal tidak valid');
  }
  return { ...input, label };
}

function toSchedule(row: ScheduleRow): ScheduleItem {
  return {
    id: row.id,
    userId: row.owner_user_id,
    type: row.type,
    label: row.label,
    detail: row.detail,
    time: row.time,
    done: row.done === 1,
    scheduleDate: row.schedule_date,
    isAiGenerated: row.is_ai_generated === 1,
    colorScheme: row.color_scheme,
    createdAt: row.created_at,
  };
}

export async function listSchedules(ownerUserId: number, date: string): Promise<ScheduleItem[]> {
  const database = await getHealthDatabase();
  const rows = await database.getAllAsync<ScheduleRow>(
    `SELECT ${SCHEDULE_COLUMNS} FROM schedule_items
      WHERE owner_user_id = ? AND schedule_date = ? ORDER BY time, created_at`,
    ownerUserId,
    date
  );
  return rows.map(toSchedule);
}

export async function getSchedule(ownerUserId: number, id: number): Promise<ScheduleItem | null> {
  const database = await getHealthDatabase();
  const row = await database.getFirstAsync<ScheduleRow>(
    `SELECT ${SCHEDULE_COLUMNS} FROM schedule_items WHERE id = ? AND owner_user_id = ?`,
    id,
    ownerUserId
  );
  return row ? toSchedule(row) : null;
}

async function insertSchedule(
  database: Awaited<ReturnType<typeof getHealthDatabase>>,
  ownerUserId: number,
  rawInput: CreateScheduleInput
): Promise<number> {
  const input = validateInput(rawInput);
  const now = new Date().toISOString();
  const result = await database.runAsync(
    `INSERT INTO schedule_items (
      owner_user_id, type, label, detail, time, schedule_date, done,
      is_ai_generated, color_scheme, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
    ownerUserId,
    input.type,
    input.label,
    input.detail?.trim() || null,
    input.time,
    input.scheduleDate,
    input.isAiGenerated ? 1 : 0,
    input.colorScheme ?? null,
    now,
    now
  );
  return result.lastInsertRowId;
}

export async function createSchedule(
  ownerUserId: number,
  input: CreateScheduleInput
): Promise<ScheduleItem> {
  const database = await getHealthDatabase();
  const id = await insertSchedule(database, ownerUserId, input);
  const item = await getSchedule(ownerUserId, id);
  if (!item) throw new Error('Jadwal gagal disimpan');
  return item;
}

export async function toggleSchedule(ownerUserId: number, id: number): Promise<ScheduleItem> {
  const database = await getHealthDatabase();
  const result = await database.runAsync(
    `UPDATE schedule_items SET done = CASE done WHEN 1 THEN 0 ELSE 1 END, updated_at = ?
      WHERE id = ? AND owner_user_id = ?`,
    new Date().toISOString(),
    id,
    ownerUserId
  );
  if (result.changes !== 1) throw new Error('Item jadwal tidak ditemukan');
  const item = await getSchedule(ownerUserId, id);
  if (!item) throw new Error('Item jadwal tidak ditemukan');
  return item;
}

export async function deleteSchedule(ownerUserId: number, id: number): Promise<boolean> {
  const database = await getHealthDatabase();
  const result = await database.runAsync(
    'DELETE FROM schedule_items WHERE id = ? AND owner_user_id = ?',
    id,
    ownerUserId
  );
  return result.changes === 1;
}

export async function replaceAiSchedules(
  ownerUserId: number,
  date: string,
  rawItems: Omit<CreateScheduleInput, 'scheduleDate' | 'isAiGenerated'>[]
): Promise<ScheduleItem[]> {
  if (rawItems.length === 0) throw new Error('AI tidak menghasilkan jadwal yang aman');
  const items = rawItems.map((item) => validateInput({
    ...item,
    scheduleDate: date,
    isAiGenerated: true,
  }));
  const database = await getHealthDatabase();
  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'DELETE FROM schedule_items WHERE owner_user_id = ? AND schedule_date = ? AND is_ai_generated = 1',
      ownerUserId,
      date
    );
    for (const item of items) {
      await insertSchedule(transaction, ownerUserId, item);
    }
  });
  return listSchedules(ownerUserId, date);
}
