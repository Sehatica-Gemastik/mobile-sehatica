import { describe, expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import {
  HEALTH_DATABASE_VERSION,
  MIGRATION_0_TO_1,
  MIGRATION_1_TO_2,
  MIGRATION_2_TO_3,
  MIGRATION_3_TO_4,
  MIGRATION_4_TO_5,
  MIGRATION_5_TO_6,
  MIGRATION_6_TO_7,
} from '../src/storage/health-schema';

function applyAllMigrations(database) {
  database.exec(MIGRATION_0_TO_1);
  database.exec(MIGRATION_1_TO_2);
  database.exec(MIGRATION_2_TO_3);
  database.exec(MIGRATION_3_TO_4);
  database.exec(MIGRATION_4_TO_5);
  database.exec(MIGRATION_5_TO_6);
  database.exec(MIGRATION_6_TO_7);
  database.exec(`PRAGMA user_version = ${HEALTH_DATABASE_VERSION}`);
}

describe('local health schema', () => {
  test('creates an owner-scoped record table with enforced record types', () => {
    const database = new Database(':memory:');
    applyAllMigrations(database);

    database.query(`
      INSERT INTO medical_records (
        owner_user_id, type, title, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
    `).run(7, 'note', 'Catatan tekanan darah', '2026-08-08T00:00:00.000Z', '2026-08-08T00:00:00.000Z');

    const record = database.query(
      'SELECT owner_user_id, title FROM medical_records WHERE owner_user_id = ?'
    ).get(7);
    expect(record).toEqual({ owner_user_id: 7, title: 'Catatan tekanan darah' });
    expect(database.query('PRAGMA user_version').get()).toEqual({ user_version: 7 });

    database.query(
      'UPDATE medical_records SET file_data = ?, file_mime = ? WHERE owner_user_id = ?'
    ).run(new Uint8Array([1, 2, 3]), 'image/jpeg', 7);
    expect(database.query(
      'SELECT length(file_data) AS size FROM medical_records WHERE owner_user_id = ?'
    ).get(7)).toEqual({ size: 3 });

    expect(() => database.query(`
      INSERT INTO medical_records (
        owner_user_id, type, title, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
    `).run(7, 'invalid', 'Tidak valid', '2026-08-08', '2026-08-08')).toThrow();

    database.close();
  });

  test('stores offline schedules by owner and date with strict time values', () => {
    const database = new Database(':memory:');
    database.exec(MIGRATION_1_TO_2);
    const insert = database.query(`
      INSERT INTO schedule_items (
        owner_user_id, type, label, time, schedule_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(7, 'water', 'Minum air', '09:00', '2026-08-09', 'now', 'now');
    insert.run(8, 'exercise', 'Jalan ringan', '17:00', '2026-08-09', 'now', 'now');

    expect(database.query(
      'SELECT label, done FROM schedule_items WHERE owner_user_id = ? AND schedule_date = ?'
    ).all(7, '2026-08-09')).toEqual([{ label: 'Minum air', done: 0 }]);
    expect(() => insert.run(7, 'pill', 'Obat', '25:00', '2026-08-09', 'now', 'now')).toThrow();

    database.close();
  });

  test('stores daily health logs locally without leaking across owners', () => {
    const database = new Database(':memory:');
    database.exec(MIGRATION_2_TO_3);
    const insert = database.query(`
      INSERT INTO daily_logs (
        owner_user_id, type, title, quantity, log_date, time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(7, 'water', 'Minum air', '500 ml', '2026-08-09', '09:30', 'now');
    insert.run(8, 'food', 'Sarapan', '1 porsi', '2026-08-09', '07:00', 'now');

    expect(database.query(
      'SELECT type, title, quantity FROM daily_logs WHERE owner_user_id = ? AND log_date = ?'
    ).all(7, '2026-08-09')).toEqual([{
      type: 'water', title: 'Minum air', quantity: '500 ml',
    }]);
    expect(() => insert.run(7, 'invalid', 'Tidak valid', null, '2026-08-09', '09:30', 'now')).toThrow();

    database.close();
  });

  test('drops legacy chat tables after migration 7', () => {
    const database = new Database(':memory:');
    applyAllMigrations(database);

    expect(database.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'heally_%'"
    ).all()).toEqual([]);

    database.close();
  });

  test('stores versioned screening results without leaking across owners', () => {
    const database = new Database(':memory:');
    database.exec(MIGRATION_4_TO_5);
    const insert = database.query(`
      INSERT INTO screening_sessions (
        owner_user_id, instrument_version, answers_json, factors_json,
        missing_checks_json, result_status, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(7, 'ptm-factor-checklist-v1', '{}', '["tobacco"]', '["cholesterol"]', 'factors_found', 'now');
    insert.run(8, 'ptm-factor-checklist-v1', '{}', '[]', '[]', 'no_factors_reported', 'now');

    expect(database.query(
      'SELECT factors_json, result_status FROM screening_sessions WHERE owner_user_id = ?'
    ).all(7)).toEqual([{ factors_json: '["tobacco"]', result_status: 'factors_found' }]);
    expect(() => insert.run(7, 'v1', '{}', '[]', '[]', 'diagnosis', 'now')).toThrow();

    database.close();
  });
});
