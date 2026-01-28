import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { GeneratedResume, GapAnalysis } from '@shared/types/index.js';

interface GeneratedResumeRow {
    id: string;
    user_id: string;
    resume_id: string;
    job_description_id: string;
    fitting_level: number;
    latex_content: string;
    gap_analysis: string | null;
    created_at: string;
}

function rowToGeneratedResume(row: GeneratedResumeRow): GeneratedResume {
    return {
        id: row.id,
        userId: row.user_id,
        resumeId: row.resume_id,
        jobDescriptionId: row.job_description_id,
        fittingLevel: row.fitting_level,
        latexContent: row.latex_content,
        gapAnalysis: row.gap_analysis ? JSON.parse(row.gap_analysis) : { toolGaps: [], trueGaps: [] },
        createdAt: new Date(row.created_at),
    };
}

export interface CreateGeneratedResumeParams {
    userId: string;
    resumeId: string;
    jobDescriptionId: string;
    fittingLevel: number;
    latexContent: string;
    gapAnalysis: GapAnalysis;
}

export function createGeneratedResume(params: CreateGeneratedResumeParams): GeneratedResume {
    const id = uuidv4();
    const stmt = db.prepare(`
    INSERT INTO generated_resumes (id, user_id, resume_id, job_description_id, fitting_level, latex_content, gap_analysis)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
    stmt.run(
        id,
        params.userId,
        params.resumeId,
        params.jobDescriptionId,
        params.fittingLevel,
        params.latexContent,
        JSON.stringify(params.gapAnalysis)
    );

    return findGeneratedResumeById(id)!;
}

export function findGeneratedResumeById(id: string): GeneratedResume | null {
    const stmt = db.prepare('SELECT * FROM generated_resumes WHERE id = ?');
    const row = stmt.get(id) as GeneratedResumeRow | undefined;
    return row ? rowToGeneratedResume(row) : null;
}

export function findGeneratedResumesByUserId(userId: string): GeneratedResume[] {
    const stmt = db.prepare('SELECT * FROM generated_resumes WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(userId) as GeneratedResumeRow[];
    return rows.map(rowToGeneratedResume);
}

export function findGeneratedResumesByResumeId(resumeId: string): GeneratedResume[] {
    const stmt = db.prepare('SELECT * FROM generated_resumes WHERE resume_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(resumeId) as GeneratedResumeRow[];
    return rows.map(rowToGeneratedResume);
}

export function deleteGeneratedResume(id: string): boolean {
    const stmt = db.prepare('DELETE FROM generated_resumes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
