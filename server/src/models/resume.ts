import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { Resume, ParsedResume } from '@shared/types/index.js';

interface ResumeRow {
    id: string;
    user_id: string;
    raw_text: string;
    parsed_data: string | null;
    uploaded_at: string;
}

function rowToResume(row: ResumeRow): Resume {
    return {
        id: row.id,
        userId: row.user_id,
        rawText: row.raw_text,
        parsedData: row.parsed_data ? JSON.parse(row.parsed_data) : null,
        uploadedAt: new Date(row.uploaded_at),
    };
}

export function createResume(userId: string, rawText: string): Resume {
    const id = uuidv4();
    const stmt = db.prepare(`
    INSERT INTO resumes (id, user_id, raw_text)
    VALUES (?, ?, ?)
  `);
    stmt.run(id, userId, rawText);

    return findResumeById(id)!;
}

export function findResumeById(id: string): Resume | null {
    const stmt = db.prepare('SELECT * FROM resumes WHERE id = ?');
    const row = stmt.get(id) as ResumeRow | undefined;
    return row ? rowToResume(row) : null;
}

export function findResumesByUserId(userId: string): Resume[] {
    const stmt = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC');
    const rows = stmt.all(userId) as ResumeRow[];
    return rows.map(rowToResume);
}

export function updateResumeParsedData(id: string, parsedData: ParsedResume): boolean {
    const stmt = db.prepare('UPDATE resumes SET parsed_data = ? WHERE id = ?');
    const result = stmt.run(JSON.stringify(parsedData), id);
    return result.changes > 0;
}

export function deleteResume(id: string): boolean {
    const stmt = db.prepare('DELETE FROM resumes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
