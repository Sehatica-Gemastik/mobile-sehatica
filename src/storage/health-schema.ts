export const HEALTH_DATABASE_VERSION = 6;

export const MIGRATION_0_TO_1 = `
  CREATE TABLE medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('consultation', 'image', 'voice', 'note')),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT,
    summary TEXT,
    file_data BLOB,
    file_mime TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]',
    doctor_name TEXT,
    record_date TEXT,
    is_ai_summarized INTEGER NOT NULL DEFAULT 0 CHECK (is_ai_summarized IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX medical_records_owner_created_idx
    ON medical_records (owner_user_id, created_at DESC);
`;

export const MIGRATION_1_TO_2 = `
  CREATE TABLE schedule_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('food', 'pill', 'exercise', 'water', 'other')),
    label TEXT NOT NULL CHECK (length(trim(label)) > 0),
    detail TEXT,
    time TEXT NOT NULL CHECK (
      length(time) = 5 AND
      time GLOB '[0-2][0-9]:[0-5][0-9]' AND
      CAST(substr(time, 1, 2) AS INTEGER) < 24
    ),
    schedule_date TEXT NOT NULL CHECK (length(schedule_date) = 10),
    done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
    is_ai_generated INTEGER NOT NULL DEFAULT 0 CHECK (is_ai_generated IN (0, 1)),
    color_scheme TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX schedule_items_owner_date_time_idx
    ON schedule_items (owner_user_id, schedule_date, time);
`;

export const MIGRATION_2_TO_3 = `
  CREATE TABLE daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('food', 'medication', 'exercise', 'water')),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    quantity TEXT,
    detail TEXT,
    log_date TEXT NOT NULL CHECK (length(log_date) = 10),
    time TEXT NOT NULL CHECK (
      length(time) = 5 AND
      time GLOB '[0-2][0-9]:[0-5][0-9]' AND
      CAST(substr(time, 1, 2) AS INTEGER) < 24
    ),
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'schedule', 'heally')),
    created_at TEXT NOT NULL
  );

  CREATE INDEX daily_logs_owner_date_time_idx
    ON daily_logs (owner_user_id, log_date, time DESC);
`;

export const MIGRATION_3_TO_4 = `
  CREATE TABLE heally_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 8000),
    needs_verif INTEGER NOT NULL DEFAULT 0 CHECK (needs_verif IN (0, 1)),
    safety_level TEXT NOT NULL DEFAULT 'general' CHECK (safety_level IN ('general', 'review', 'urgent')),
    safety_reasons_json TEXT NOT NULL DEFAULT '[]',
    verif_status TEXT CHECK (verif_status IN ('pending', 'approved', 'revised')),
    verif_doctor_name TEXT,
    verif_note TEXT,
    from_whatsapp INTEGER NOT NULL DEFAULT 0 CHECK (from_whatsapp IN (0, 1)),
    created_at TEXT NOT NULL
  );

  CREATE INDEX heally_messages_owner_created_idx
    ON heally_messages (owner_user_id, created_at DESC);
`;

export const MIGRATION_4_TO_5 = `
  CREATE TABLE screening_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL,
    instrument_version TEXT NOT NULL CHECK (length(trim(instrument_version)) > 0),
    answers_json TEXT NOT NULL,
    factors_json TEXT NOT NULL,
    missing_checks_json TEXT NOT NULL,
    result_status TEXT NOT NULL CHECK (result_status IN ('no_factors_reported', 'factors_found')),
    completed_at TEXT NOT NULL
  );

  CREATE INDEX screening_sessions_owner_completed_idx
    ON screening_sessions (owner_user_id, completed_at DESC);
`;

export const MIGRATION_5_TO_6 = `
  CREATE TABLE heally_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_uuid TEXT NOT NULL UNIQUE,
    owner_user_id INTEGER NOT NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX heally_sessions_owner_created_idx
    ON heally_sessions (owner_user_id, created_at DESC);

  ALTER TABLE heally_messages ADD COLUMN session_id INTEGER REFERENCES heally_sessions(id) ON DELETE CASCADE;
`;
