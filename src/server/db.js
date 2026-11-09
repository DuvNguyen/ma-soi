import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Read DATABASE_URL from .env.local or process.env
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        if (line.startsWith('DATABASE_URL=')) {
          return line.slice('DATABASE_URL='.length).replace(/["']/g, '').trim();
        }
      }
    }
  } catch (err) {
    console.error('Error reading .env.local:', err);
  }
  return null;
}

export const dbUrl = getDatabaseUrl();
export const sql = dbUrl ? neon(dbUrl) : null;

export async function testConnection() {
  if (!sql) throw new Error('DATABASE_URL not found in environment');
  const res = await sql`SELECT 1 as connected, now() as timestamp, current_database() as db_name`;
  return res[0];
}

export async function getTemplates() {
  if (!sql) return [];
  const rows = await sql`
    SELECT id, name, description, player_count, role_ids, created_at, updated_at 
    FROM deck_templates 
    ORDER BY created_at DESC
  `;
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    desc: r.description,
    playerCount: r.player_count,
    roleIds: typeof r.role_ids === 'string' ? JSON.parse(r.role_ids) : r.role_ids,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

export async function saveTemplate({ id, name, desc, playerCount, roleIds }) {
  if (!sql) throw new Error('Database not connected');
  const roleIdsJson = JSON.stringify(roleIds);
  await sql`
    INSERT INTO deck_templates (id, name, description, player_count, role_ids, updated_at)
    VALUES (${id}, ${name}, ${desc || ''}, ${playerCount}, ${roleIdsJson}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      player_count = EXCLUDED.player_count,
      role_ids = EXCLUDED.role_ids,
      updated_at = NOW()
  `;
  return { id, name, desc, playerCount, roleIds };
}

export async function deleteTemplate(id) {
  if (!sql) throw new Error('Database not connected');
  await sql`DELETE FROM deck_templates WHERE id = ${id}`;
  return { success: true };
}

export async function getRosters() {
  if (!sql) return [];
  const rows = await sql`
    SELECT id, name, player_names, created_at, updated_at 
    FROM player_rosters 
    ORDER BY created_at DESC
  `;
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    playerNames: typeof r.player_names === 'string' ? JSON.parse(r.player_names) : r.player_names,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

export async function saveRoster({ id, name, playerNames }) {
  if (!sql) throw new Error('Database not connected');
  const namesJson = JSON.stringify(playerNames);
  await sql`
    INSERT INTO player_rosters (id, name, player_names, updated_at)
    VALUES (${id}, ${name}, ${namesJson}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      player_names = EXCLUDED.player_names,
      updated_at = NOW()
  `;
  return { id, name, playerNames };
}

export async function deleteRoster(id) {
  if (!sql) throw new Error('Database not connected');
  await sql`DELETE FROM player_rosters WHERE id = ${id}`;
  return { success: true };
}

export async function getGameState() {
  if (!sql) return null;
  const rows = await sql`SELECT state FROM game_state WHERE id = 'current'`;
  if (rows.length === 0) return null;
  const state = rows[0].state;
  return typeof state === 'string' ? JSON.parse(state) : state;
}

export async function saveGameState(state) {
  if (!sql) throw new Error('Database not connected');
  const stateJson = JSON.stringify(state);
  await sql`
    INSERT INTO game_state (id, state, updated_at)
    VALUES ('current', ${stateJson}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET
      state = EXCLUDED.state,
      updated_at = NOW()
  `;
  return { success: true };
}
