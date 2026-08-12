import { Platform } from 'react-native';
import {
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

let databasePromise: Promise<SQLiteDatabase> | null = null;

function isCorruptDatabaseError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('file is not a database')
    || msg.includes('not a database')
    || msg.includes('malformed');
}

async function applyMigrations(database: SQLiteDatabase): Promise<void> {
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
}

async function openHealthDatabase(): Promise<SQLiteDatabase> {
  if (Platform.OS === 'web') {
    throw new Error('Penyimpanan rekam medis hanya tersedia di aplikasi mobile');
  }

  let resetAttempted = false;
  while (true) {
    try {
      const database = await openDatabaseAsync(DATABASE_NAME);
      await database.execAsync('PRAGMA foreign_keys = ON');
      await database.execAsync('PRAGMA journal_mode = WAL');
      await applyMigrations(database);
      return database;
    } catch (error) {
      if (!resetAttempted && isCorruptDatabaseError(error)) {
        resetAttempted = true;
        try { await deleteDatabaseAsync(DATABASE_NAME); } catch { /* best effort */ }
        continue;
      }
      throw error;
    }
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
