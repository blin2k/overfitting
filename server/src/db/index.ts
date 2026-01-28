import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'dev.db');
const db: DatabaseType = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
function initializeDatabase(): void {
    db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Resumes table
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      parsed_data TEXT, -- JSON string
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Job Descriptions table
    CREATE TABLE IF NOT EXISTS job_descriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      parsed_data TEXT, -- JSON string
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Generated Resumes table
    CREATE TABLE IF NOT EXISTS generated_resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resume_id TEXT NOT NULL,
      job_description_id TEXT NOT NULL,
      fitting_level INTEGER NOT NULL,
      latex_content TEXT NOT NULL,
      gap_analysis TEXT, -- JSON string
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
      FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON job_descriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_generated_resumes_user_id ON generated_resumes(user_id);
    CREATE INDEX IF NOT EXISTS idx_generated_resumes_resume_id ON generated_resumes(resume_id);
    CREATE INDEX IF NOT EXISTS idx_generated_resumes_jd_id ON generated_resumes(job_description_id);
  `);
}

// Initialize on import
initializeDatabase();

export { db };
export default db;
