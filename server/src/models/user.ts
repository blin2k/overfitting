import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@shared/types/index.js';

interface UserRow {
    id: string;
    email: string;
    created_at: string;
}

function rowToUser(row: UserRow): User {
    return {
        id: row.id,
        email: row.email,
        createdAt: new Date(row.created_at),
    };
}

export function createUser(email: string): User {
    const id = uuidv4();
    const stmt = db.prepare(`
    INSERT INTO users (id, email)
    VALUES (?, ?)
  `);
    stmt.run(id, email);

    return findUserById(id)!;
}

export function findUserById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
}

export function findUserByEmail(email: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as UserRow | undefined;
    return row ? rowToUser(row) : null;
}

export function findOrCreateUser(email: string): User {
    const existing = findUserByEmail(email);
    if (existing) return existing;
    return createUser(email);
}

export function deleteUser(id: string): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
