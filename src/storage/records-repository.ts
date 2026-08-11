import { MedicalRecord, RecordType } from '@/types';
import { getHealthDatabase } from './health-db';

const RECORD_COLUMNS = `
  id, owner_user_id, type, title, content, summary, file_mime, tags_json,
  doctor_name, record_date, is_ai_summarized, created_at, updated_at
`;

type RecordRow = {
  id: number;
  owner_user_id: number;
  type: RecordType;
  title: string;
  content: string | null;
  summary: string | null;
  file_mime: string | null;
  tags_json: string;
  doctor_name: string | null;
  record_date: string | null;
  is_ai_summarized: number;
  created_at: string;
  updated_at: string;
};

export type CreateRecordInput = {
  type: RecordType;
  title: string;
  content?: string;
  summary?: string;
  fileData?: Uint8Array;
  fileMime?: string;
  tags?: string[];
  doctorName?: string;
  recordDate?: string;
  isAiSummarized?: boolean;
};

export type OcrResult = {
  extractedText: string;
  title: string;
  summary: string;
  tags: string[];
};

function toRecord(row: RecordRow): MedicalRecord {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags_json);
    if (Array.isArray(parsed)) {
      tags = parsed.filter((tag): tag is string => typeof tag === 'string');
    }
  } catch {
    // A malformed optional tag list should not hide the medical record itself.
  }

  return {
    id: row.id,
    userId: row.owner_user_id,
    type: row.type,
    title: row.title,
    content: row.content,
    summary: row.summary,
    fileUrl: null,
    fileMime: row.file_mime,
    tags,
    doctorName: row.doctor_name,
    recordDate: row.record_date,
    isAiSummarized: row.is_ai_summarized === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listRecords(ownerUserId: number, type?: RecordType): Promise<MedicalRecord[]> {
  const database = await getHealthDatabase();
  const rows = type
    ? await database.getAllAsync<RecordRow>(
      `SELECT ${RECORD_COLUMNS} FROM medical_records
        WHERE owner_user_id = ? AND type = ? ORDER BY created_at DESC`,
      ownerUserId,
      type
    )
    : await database.getAllAsync<RecordRow>(
      `SELECT ${RECORD_COLUMNS} FROM medical_records
        WHERE owner_user_id = ? ORDER BY created_at DESC`,
      ownerUserId
    );
  return rows.map(toRecord);
}

export async function getRecord(ownerUserId: number, id: number): Promise<MedicalRecord | null> {
  const database = await getHealthDatabase();
  const row = await database.getFirstAsync<RecordRow>(
    `SELECT ${RECORD_COLUMNS} FROM medical_records WHERE id = ? AND owner_user_id = ?`,
    id,
    ownerUserId
  );
  return row ? toRecord(row) : null;
}

export async function createRecord(
  ownerUserId: number,
  input: CreateRecordInput
): Promise<MedicalRecord> {
  const title = input.title.trim();
  if (!title) throw new Error('Judul wajib diisi');

  const database = await getHealthDatabase();
  const now = new Date().toISOString();
  const result = await database.runAsync(
    `INSERT INTO medical_records (
      owner_user_id, type, title, content, summary, file_data, file_mime, tags_json,
      doctor_name, record_date, is_ai_summarized, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ownerUserId,
    input.type,
    title,
    input.content?.trim() || null,
    input.summary?.trim() || null,
    input.fileData ?? null,
    input.fileMime ?? null,
    JSON.stringify(input.tags ?? []),
    input.doctorName?.trim() || null,
    input.recordDate ?? null,
    input.isAiSummarized ? 1 : 0,
    now,
    now
  );

  const record = await getRecord(ownerUserId, result.lastInsertRowId);
  if (!record) throw new Error('Rekam medis gagal disimpan');
  return record;
}

export async function applyOcrResult(
  ownerUserId: number,
  id: number,
  result: OcrResult
): Promise<MedicalRecord> {
  const title = typeof result.title === 'string' && result.title.trim()
    ? result.title.trim()
    : 'Dokumen medis';
  const extractedText = typeof result.extractedText === 'string' ? result.extractedText : '';
  const summary = typeof result.summary === 'string' ? result.summary : '';
  const tags = Array.isArray(result.tags)
    ? result.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 8)
    : [];
  const database = await getHealthDatabase();
  const update = await database.runAsync(
    `UPDATE medical_records
      SET title = ?, content = ?, summary = ?, tags_json = ?,
          is_ai_summarized = 1, updated_at = ?
      WHERE id = ? AND owner_user_id = ?`,
    title,
    extractedText,
    summary,
    JSON.stringify(tags),
    new Date().toISOString(),
    id,
    ownerUserId
  );
  if (update.changes !== 1) throw new Error('Rekam medis tidak ditemukan');

  const record = await getRecord(ownerUserId, id);
  if (!record) throw new Error('Rekam medis tidak ditemukan');
  return record;
}

export async function deleteRecord(ownerUserId: number, id: number): Promise<boolean> {
  const record = await getRecord(ownerUserId, id);
  if (!record) return false;

  const database = await getHealthDatabase();
  await database.runAsync(
    'DELETE FROM medical_records WHERE id = ? AND owner_user_id = ?',
    id,
    ownerUserId
  );

  return true;
}
