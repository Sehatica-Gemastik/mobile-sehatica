import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { File } from 'expo-file-system';
import {
  defaultDatabaseDirectory,
  deleteDatabaseAsync,
  openDatabaseAsync,
  type SQLiteDatabase,
} from 'expo-sqlite';
import {
  HEALTH_DATABASE_VERSION,
  MIGRATION_0_TO_1,
  MIGRATION_1_TO_2,
  MIGRATION_2_TO_3,
  MIGRATION_3_TO_4,
  MIGRATION_4_TO_5,
  MIGRATION_5_TO_6,
} from './health-schema';

const DATABASE_NAME = 'sehatica-health.db';
const DATABASE_KEY = 'sehatica_health_db_key_v1';
const KEY_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

let databasePromise: Promise<SQLiteDatabase> | null = null;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function getOrCreateDatabaseKey(): Promise<string> {
  const stored = await SecureStore.getItemAsync(DATABASE_KEY, KEY_OPTIONS);
  if (stored) {
    if (!/^[a-f0-9]{64}$/.test(stored)) {
      throw new Error('Kunci penyimpanan lokal tidak valid');
    }
    return stored;
  }

  const key = bytesToHex(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(DATABASE_KEY, key, KEY_OPTIONS);
  return key;
}

// ── Web Fallback Database for Browser Dev Environment (Platform.OS === 'web') ──
class WebStorageDatabase {
  private sessions: Array<any> = [];
  private messages: Array<any> = [];
  private sessionCounter = 1;
  private messageCounter = 1;

  constructor() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const sess = window.localStorage.getItem('sehatica_web_sessions');
        const msgs = window.localStorage.getItem('sehatica_web_messages');
        if (sess) this.sessions = JSON.parse(sess);
        if (msgs) this.messages = JSON.parse(msgs);
        if (this.sessions.length > 0) {
          this.sessionCounter = Math.max(...this.sessions.map((s) => s.id || 0)) + 1;
        }
        if (this.messages.length > 0) {
          this.messageCounter = Math.max(...this.messages.map((m) => m.id || 0)) + 1;
        }
      }
    } catch {
      // Memory fallback
    }
  }

  private saveState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('sehatica_web_sessions', JSON.stringify(this.sessions));
        window.localStorage.setItem('sehatica_web_messages', JSON.stringify(this.messages));
      }
    } catch {
      // Memory fallback
    }
  }

  async getAllAsync<T>(sql: string, ...params: any[]): Promise<T[]> {
    const query = sql.toLowerCase();
    if (query.includes('heally_sessions')) {
      const ownerId = params[0];
      const filtered = this.sessions.filter((s) => s.owner_user_id === ownerId);
      filtered.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
      return filtered as unknown as T[];
    }

    if (query.includes('heally_messages')) {
      const ownerId = params[0];
      let filtered = this.messages.filter((m) => m.owner_user_id === ownerId);
      if (params.length >= 2 && typeof params[1] === 'number') {
        const sessionId = params[1];
        if (sql.includes('session_id = ?')) {
          filtered = filtered.filter((m) => m.session_id === sessionId);
        }
      }
      filtered.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      return filtered as unknown as T[];
    }

    return [] as T[];
  }

  async getFirstAsync<T>(sql: string, ...params: any[]): Promise<T | null> {
    const list = await this.getAllAsync<T>(sql, ...params);
    return list[0] ?? null;
  }

  async runAsync(sql: string, ...params: any[]): Promise<{ lastInsertRowId: number; changes: number }> {
    const query = sql.toLowerCase();

    if (query.includes('insert into heally_sessions')) {
      const newId = this.sessionCounter++;
      const row = {
        id: newId,
        session_uuid: params[0],
        owner_user_id: params[1],
        title: params[2],
        created_at: params[3],
        updated_at: params[4],
      };
      this.sessions.push(row);
      this.saveState();
      return { lastInsertRowId: newId, changes: 1 };
    }

    if (query.includes('insert into heally_messages')) {
      const newId = this.messageCounter++;
      const row = {
        id: newId,
        owner_user_id: params[0],
        session_id: params[1],
        role: params[2],
        content: params[3],
        needs_verif: params[4],
        safety_level: params[5],
        safety_reasons_json: params[6],
        created_at: params[7],
        verif_status: null,
        verif_doctor_name: null,
        verif_note: null,
        from_whatsapp: 0,
      };
      this.messages.push(row);
      this.saveState();
      return { lastInsertRowId: newId, changes: 1 };
    }

    if (query.includes('update heally_sessions')) {
      const updatedAt = params[0];
      const sessionId = params[1];
      let count = 0;
      for (const s of this.sessions) {
        if (s.id === sessionId) {
          s.updated_at = updatedAt;
          count++;
        }
      }
      this.saveState();
      return { lastInsertRowId: 0, changes: count };
    }

    if (query.includes('update heally_messages')) {
      const status = params[0];
      const doctorName = params[1];
      const doctorNote = params[2];
      const ownerId = params[3];
      const msgId = params[4];
      let count = 0;
      for (const m of this.messages) {
        if (m.id === msgId && m.owner_user_id === ownerId) {
          m.verif_status = status;
          m.verif_doctor_name = doctorName;
          m.verif_note = doctorNote;
          count++;
        }
      }
      this.saveState();
      return { lastInsertRowId: 0, changes: count };
    }

    if (query.includes('delete from heally_messages')) {
      const ownerId = params[0];
      const before = this.messages.length;
      this.messages = this.messages.filter((m) => m.owner_user_id !== ownerId);
      const changes = before - this.messages.length;
      this.saveState();
      return { lastInsertRowId: 0, changes };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  async execAsync(_sql: string): Promise<void> {
    return Promise.resolve();
  }

  async withExclusiveTransactionAsync(callback: (tx: any) => Promise<any>): Promise<any> {
    return callback(this);
  }

  async closeAsync(): Promise<void> {
    return Promise.resolve();
  }
}

async function openHealthDatabase(): Promise<SQLiteDatabase> {
  if (Platform.OS === 'web') {
    return new WebStorageDatabase() as unknown as SQLiteDatabase;
  }

  const databaseFile = new File(defaultDatabaseDirectory, DATABASE_NAME);
  const storedKey = await SecureStore.getItemAsync(DATABASE_KEY, KEY_OPTIONS);
  if (!storedKey && databaseFile.exists) {
    throw new Error('Kunci database lokal tidak ditemukan; pulihkan dari ekspor terenkripsi');
  }

  const key = storedKey ?? await getOrCreateDatabaseKey();
  if (!/^[a-f0-9]{64}$/.test(key)) {
    throw new Error('Kunci database lokal tidak valid');
  }

  const database = await openDatabaseAsync(DATABASE_NAME);
  try {
    await database.execAsync(`PRAGMA key = '${key}'`);
    const cipher = await database.getFirstAsync<{ cipher_version: string }>(
      'PRAGMA cipher_version'
    );
    if (!cipher?.cipher_version) {
      throw new Error('SQLCipher tidak aktif; gunakan development build, bukan Expo Go');
    }
    await database.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

    const versionRow = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version'
    );
    const version = versionRow?.user_version ?? 0;

    if (version > HEALTH_DATABASE_VERSION) {
      throw new Error('Database dibuat oleh versi aplikasi yang lebih baru');
    }

    if (version < HEALTH_DATABASE_VERSION) {
      await database.withExclusiveTransactionAsync(async (transaction) => {
        let nextVersion = version;
        if (nextVersion === 0) {
          await transaction.execAsync(MIGRATION_0_TO_1);
          nextVersion = 1;
        }
        if (nextVersion === 1) {
          await transaction.execAsync(MIGRATION_1_TO_2);
          nextVersion = 2;
        }
        if (nextVersion === 2) {
          await transaction.execAsync(MIGRATION_2_TO_3);
          nextVersion = 3;
        }
        if (nextVersion === 3) {
          await transaction.execAsync(MIGRATION_3_TO_4);
          nextVersion = 4;
        }
        if (nextVersion === 4) {
          await transaction.execAsync(MIGRATION_4_TO_5);
          nextVersion = 5;
        }
        if (nextVersion === 5) {
          await transaction.execAsync(MIGRATION_5_TO_6);
          nextVersion = 6;
        }
        if (nextVersion !== HEALTH_DATABASE_VERSION) {
          throw new Error(`Migrasi database dari versi ${version} tidak tersedia`);
        }
        await transaction.execAsync(`PRAGMA user_version = ${HEALTH_DATABASE_VERSION}`);
      });
    }

    return database;
  } catch (error) {
    await database.closeAsync();
    if (error instanceof Error && error.message.startsWith('SQLCipher tidak aktif')) {
      try { await deleteDatabaseAsync(DATABASE_NAME); } catch { /* retry */ }
    }
    throw error;
  }
}

export function getHealthDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openHealthDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}
