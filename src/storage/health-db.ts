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

async function openHealthDatabase(): Promise<SQLiteDatabase> {
  if (Platform.OS === 'web') {
    throw new Error('Penyimpanan rekam medis hanya tersedia di aplikasi mobile');
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
    // The key is generated internally and restricted to lowercase hexadecimal.
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
      try { await deleteDatabaseAsync(DATABASE_NAME); } catch { /* retry will surface the same clear error */ }
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
