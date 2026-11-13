import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

let _cachedUrl = null;
let _cachedSql = null;

export function getDatabaseUrl() {
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

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (_cachedSql && _cachedUrl === url) return _cachedSql;
  _cachedUrl = url;
  _cachedSql = neon(url);
  return _cachedSql;
}

export const dbUrl = getDatabaseUrl();
export const sql = (...args) => {
  const client = getSql();
  if (!client) throw new Error('DATABASE_URL not found in environment');
  return client(...args);
};

export async function testConnection() {
  if (!getSql()) throw new Error('DATABASE_URL not found in environment');
  const res = await sql`SELECT 1 as connected, now() as timestamp, current_database() as db_name`;
  return res[0];
}

export async function getTemplates() {
  if (!getSql()) return [];
  await ensureTablesExist();
  const rows = await sql`
    SELECT id, name, description, player_count, role_ids, is_default, created_at, updated_at 
    FROM deck_templates 
    ORDER BY is_default DESC, created_at DESC
  `;
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    desc: r.description,
    playerCount: r.player_count,
    roleIds: typeof r.role_ids === 'string' ? JSON.parse(r.role_ids) : r.role_ids,
    isDefault: Boolean(r.is_default),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

export async function saveTemplate({ id, name, desc, playerCount, roleIds, isDefault }) {
  if (!getSql()) throw new Error('Database not connected');
  await ensureTablesExist();
  const roleIdsJson = JSON.stringify(roleIds);
  const shouldBeDefault = Boolean(isDefault);
  if (shouldBeDefault) {
    await sql`UPDATE deck_templates SET is_default = FALSE`;
  }
  await sql`
    INSERT INTO deck_templates (id, name, description, player_count, role_ids, is_default, updated_at)
    VALUES (${id}, ${name}, ${desc || ''}, ${playerCount}, ${roleIdsJson}::jsonb, ${shouldBeDefault}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      player_count = EXCLUDED.player_count,
      role_ids = EXCLUDED.role_ids,
      is_default = CASE WHEN ${shouldBeDefault} THEN TRUE ELSE deck_templates.is_default END,
      updated_at = NOW()
  `;
  return { id, name, desc, playerCount, roleIds, isDefault: shouldBeDefault };
}

export async function setDefaultTemplate(id) {
  if (!getSql()) throw new Error('Database not connected');
  await ensureTablesExist();
  await sql`UPDATE deck_templates SET is_default = FALSE`;
  await sql`UPDATE deck_templates SET is_default = TRUE WHERE id = ${id}`;
  return { success: true, id };
}

export async function deleteTemplate(id) {
  if (!getSql()) throw new Error('Database not connected');
  await sql`DELETE FROM deck_templates WHERE id = ${id}`;
  return { success: true };
}

export async function getRosters() {
  if (!getSql()) return [];
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
  if (!getSql()) throw new Error('Database not connected');
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
  if (!getSql()) throw new Error('Database not connected');
  await sql`DELETE FROM player_rosters WHERE id = ${id}`;
  return { success: true };
}

export async function getGameState() {
  if (!getSql()) return null;
  const rows = await sql`SELECT state FROM game_state WHERE id = 'current'`;
  if (rows.length === 0) return null;
  const state = rows[0].state;
  return typeof state === 'string' ? JSON.parse(state) : state;
}

export async function saveGameState(state) {
  if (!getSql()) throw new Error('Database not connected');
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

// ================= MATCH RECORDS & GAME HISTORY =================

export async function ensureTablesExist() {
  if (!getSql()) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS deck_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        player_count INT NOT NULL,
        role_ids JSONB NOT NULL DEFAULT '[]',
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      ALTER TABLE deck_templates ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS match_records (
        id VARCHAR(64) PRIMARY KEY,
        room_name VARCHAR(255) NOT NULL DEFAULT 'Ván đấu Ma Sói',
        player_count INT NOT NULL,
        total_rounds INT NOT NULL DEFAULT 1,
        winner_team VARCHAR(20),
        winner_description TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        finished_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
        initial_roles JSONB NOT NULL DEFAULT '[]',
        players_snapshot JSONB NOT NULL DEFAULT '[]',
        cupid_pair JSONB,
        night_logs JSONB NOT NULL DEFAULT '[]',
        day_logs JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_match_records_created ON match_records(created_at DESC);
    `;
  } catch (err) {
    console.error('Error ensuring match_records table exists:', err);
  }
}

export async function getMatchRecords(limit = 30) {
  if (!getSql()) return [];
  await ensureTablesExist();
  const rows = await sql`
    SELECT 
      id, room_name, player_count, total_rounds, winner_team, 
      winner_description, started_at, finished_at, status, 
      cupid_pair, created_at
    FROM match_records 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return rows.map(r => ({
    id: r.id,
    roomName: r.room_name,
    playerCount: r.player_count,
    totalRounds: r.total_rounds,
    winnerTeam: r.winner_team,
    winnerDescription: r.winner_description,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    status: r.status,
    cupidPair: typeof r.cupid_pair === 'string' ? JSON.parse(r.cupid_pair) : r.cupid_pair,
    createdAt: r.created_at
  }));
}

export async function getMatchDetail(id) {
  if (!getSql()) return null;
  await ensureTablesExist();
  const rows = await sql`
    SELECT * FROM match_records WHERE id = ${id}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    roomName: r.room_name,
    playerCount: r.player_count,
    totalRounds: r.total_rounds,
    winnerTeam: r.winner_team,
    winnerDescription: r.winner_description,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    status: r.status,
    initialRoles: typeof r.initial_roles === 'string' ? JSON.parse(r.initial_roles) : r.initial_roles,
    playersSnapshot: typeof r.players_snapshot === 'string' ? JSON.parse(r.players_snapshot) : r.players_snapshot,
    cupidPair: typeof r.cupid_pair === 'string' ? JSON.parse(r.cupid_pair) : r.cupid_pair,
    nightLogs: typeof r.night_logs === 'string' ? JSON.parse(r.night_logs) : r.night_logs,
    dayLogs: typeof r.day_logs === 'string' ? JSON.parse(r.day_logs) : r.day_logs,
    createdAt: r.created_at
  };
}

export async function saveMatchRecord(data) {
  if (!getSql()) throw new Error('Database not connected');
  await ensureTablesExist();

  const id = data.id || `match-${Date.now()}`;
  const roomName = data.roomName || 'Ván đấu Ma Sói';
  const playerCount = data.playerCount || (data.playersSnapshot ? data.playersSnapshot.length : 0);
  const totalRounds = data.totalRounds || 1;
  const winnerTeam = data.winnerTeam || 'NONE';
  const winnerDescription = data.winnerDescription || '';
  const startedAt = data.startedAt || new Date().toISOString();
  const finishedAt = data.finishedAt || new Date().toISOString();
  const status = data.status || 'COMPLETED';
  
  const initialRolesJson = JSON.stringify(data.initialRoles || []);
  const playersSnapshotJson = JSON.stringify(data.playersSnapshot || []);
  const cupidPairJson = data.cupidPair ? JSON.stringify(data.cupidPair) : null;
  const nightLogsJson = JSON.stringify(data.nightLogs || []);
  const dayLogsJson = JSON.stringify(data.dayLogs || []);

  await sql`
    INSERT INTO match_records (
      id, room_name, player_count, total_rounds, winner_team,
      winner_description, started_at, finished_at, status,
      initial_roles, players_snapshot, cupid_pair, night_logs, day_logs, created_at
    )
    VALUES (
      ${id}, ${roomName}, ${playerCount}, ${totalRounds}, ${winnerTeam},
      ${winnerDescription}, ${startedAt}, ${finishedAt}, ${status},
      ${initialRolesJson}::jsonb, ${playersSnapshotJson}::jsonb, 
      ${cupidPairJson ? sql`${cupidPairJson}::jsonb` : null}, 
      ${nightLogsJson}::jsonb, ${dayLogsJson}::jsonb, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      room_name = EXCLUDED.room_name,
      player_count = EXCLUDED.player_count,
      total_rounds = EXCLUDED.total_rounds,
      winner_team = EXCLUDED.winner_team,
      winner_description = EXCLUDED.winner_description,
      finished_at = EXCLUDED.finished_at,
      status = EXCLUDED.status,
      players_snapshot = EXCLUDED.players_snapshot,
      cupid_pair = EXCLUDED.cupid_pair,
      night_logs = EXCLUDED.night_logs,
      day_logs = EXCLUDED.day_logs
  `;

  return { id, success: true };
}

export async function deleteMatchRecord(id) {
  if (!getSql()) throw new Error('Database not connected');
  await ensureTablesExist();
  await sql`DELETE FROM match_records WHERE id = ${id}`;
  return { success: true };
}
