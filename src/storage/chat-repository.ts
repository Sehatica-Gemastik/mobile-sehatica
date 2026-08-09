import { ChatMessage, ChatSafetyLevel } from '@/types';
import { getHealthDatabase } from './health-db';

const MESSAGE_COLUMNS = `
  id, owner_user_id, role, content, needs_verif, safety_level, safety_reasons_json,
  verif_status, verif_doctor_name, verif_note, from_whatsapp, created_at
`;

type MessageRow = {
  id: number;
  owner_user_id: number;
  role: ChatMessage['role'];
  content: string;
  needs_verif: number;
  safety_level: ChatSafetyLevel;
  safety_reasons_json: string;
  verif_status: ChatMessage['verifStatus'];
  verif_doctor_name: string | null;
  verif_note: string | null;
  from_whatsapp: number;
  created_at: string;
};

export type CreateChatMessageInput = {
  role: ChatMessage['role'];
  content: string;
  safetyLevel?: ChatSafetyLevel;
  safetyReasons?: string[];
  needsVerif?: boolean;
};

function toMessage(row: MessageRow): ChatMessage {
  let safetyReasons: string[] = [];
  try {
    const parsed = JSON.parse(row.safety_reasons_json);
    if (Array.isArray(parsed)) {
      safetyReasons = parsed.filter((reason): reason is string => typeof reason === 'string');
    }
  } catch {
    // Optional safety metadata must not hide the conversation itself.
  }
  return {
    id: row.id,
    userId: row.owner_user_id,
    role: row.role,
    content: row.content,
    needsVerif: row.needs_verif === 1,
    safetyLevel: row.safety_level,
    safetyReasons,
    verifStatus: row.verif_status,
    verifDoctorName: row.verif_doctor_name,
    verifNote: row.verif_note,
    fromWhatsApp: row.from_whatsapp === 1,
    createdAt: row.created_at,
  };
}

export async function listChatMessages(ownerUserId: number, limit = 100): Promise<ChatMessage[]> {
  const database = await getHealthDatabase();
  const boundedLimit = Math.max(1, Math.min(Math.floor(limit), 100));
  const rows = await database.getAllAsync<MessageRow>(
    `SELECT ${MESSAGE_COLUMNS} FROM (
      SELECT ${MESSAGE_COLUMNS} FROM heally_messages
      WHERE owner_user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?
    ) ORDER BY created_at, id`,
    ownerUserId,
    boundedLimit
  );
  return rows.map(toMessage);
}

export async function createChatMessage(
  ownerUserId: number,
  input: CreateChatMessageInput
): Promise<ChatMessage> {
  const content = input.content.trim();
  const safetyLevel = input.safetyLevel ?? 'general';
  if (!['user', 'assistant'].includes(input.role)) throw new Error('Peran pesan tidak valid');
  if (!content) throw new Error('Pesan tidak boleh kosong');
  if (content.length > (input.role === 'user' ? 2_000 : 8_000)) throw new Error('Pesan terlalu panjang');
  if (!['general', 'review', 'urgent'].includes(safetyLevel)) throw new Error('Status keamanan tidak valid');
  const reasons = (input.safetyReasons ?? [])
    .filter((reason): reason is string => typeof reason === 'string')
    .slice(0, 8);
  const database = await getHealthDatabase();
  const createdAt = new Date().toISOString();
  const result = await database.runAsync(
    `INSERT INTO heally_messages (
      owner_user_id, role, content, needs_verif, safety_level, safety_reasons_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ownerUserId,
    input.role,
    content,
    input.needsVerif ? 1 : 0,
    safetyLevel,
    JSON.stringify(reasons),
    createdAt
  );
  return {
    id: result.lastInsertRowId,
    userId: ownerUserId,
    role: input.role,
    content,
    needsVerif: Boolean(input.needsVerif),
    safetyLevel,
    safetyReasons: reasons,
    verifStatus: null,
    verifDoctorName: null,
    verifNote: null,
    fromWhatsApp: false,
    createdAt,
  };
}

export async function clearChatMessages(ownerUserId: number): Promise<number> {
  const database = await getHealthDatabase();
  const result = await database.runAsync(
    'DELETE FROM heally_messages WHERE owner_user_id = ?',
    ownerUserId
  );
  return result.changes;
}

export async function updateChatReview(
  ownerUserId: number,
  messageId: number,
  status: NonNullable<ChatMessage['verifStatus']>,
  doctorName: string,
  doctorNote: string | null
): Promise<void> {
  const database = await getHealthDatabase();
  await database.runAsync(
    `UPDATE heally_messages
     SET verif_status = ?, verif_doctor_name = ?, verif_note = ?
     WHERE owner_user_id = ? AND id = ? AND role = 'assistant'`,
    status,
    doctorName,
    doctorNote,
    ownerUserId,
    messageId
  );
}
