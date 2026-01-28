import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { JobDescription, ParsedJD } from '@shared/types/index.js';

interface JobDescriptionRow {
    id: string;
    user_id: string;
    raw_text: string;
    parsed_data: string | null;
    uploaded_at: string;
}

function rowToJobDescription(row: JobDescriptionRow): JobDescription {
    return {
        id: row.id,
        userId: row.user_id,
        rawText: row.raw_text,
        parsedData: row.parsed_data ? JSON.parse(row.parsed_data) : null,
        uploadedAt: new Date(row.uploaded_at),
    };
}

export function createJobDescription(userId: string, rawText: string): JobDescription {
    const id = uuidv4();
    const stmt = db.prepare(`
    INSERT INTO job_descriptions (id, user_id, raw_text)
    VALUES (?, ?, ?)
  `);
    stmt.run(id, userId, rawText);

    return findJobDescriptionById(id)!;
}

export function findJobDescriptionById(id: string): JobDescription | null {
    const stmt = db.prepare('SELECT * FROM job_descriptions WHERE id = ?');
    const row = stmt.get(id) as JobDescriptionRow | undefined;
    return row ? rowToJobDescription(row) : null;
}

export function findJobDescriptionsByUserId(userId: string): JobDescription[] {
    const stmt = db.prepare('SELECT * FROM job_descriptions WHERE user_id = ? ORDER BY uploaded_at DESC');
    const rows = stmt.all(userId) as JobDescriptionRow[];
    return rows.map(rowToJobDescription);
}

export function updateJobDescriptionParsedData(id: string, parsedData: ParsedJD): boolean {
    const stmt = db.prepare('UPDATE job_descriptions SET parsed_data = ? WHERE id = ?');
    const result = stmt.run(JSON.stringify(parsedData), id);
    return result.changes > 0;
}

export function deleteJobDescription(id: string): boolean {
    const stmt = db.prepare('DELETE FROM job_descriptions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
