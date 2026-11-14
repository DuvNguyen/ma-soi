import { 
  testConnection, 
  getTemplates, 
  saveTemplate, 
  setDefaultTemplate,
  deleteTemplate, 
  getRosters, 
  saveRoster, 
  deleteRoster,
  getGameState, 
  saveGameState,
  getMatchRecords,
  getMatchDetail,
  saveMatchRecord,
  deleteMatchRecord
} from '../src/server/db.js';

// Server-side Idempotency Cache (TTL: 60s)
const idempotencyCache = new Map();
const IDEMPOTENCY_TTL_MS = 60 * 1000;

function getCachedResponse(key) {
  if (!key) return null;
  const entry = idempotencyCache.get(key);
  if (entry && Date.now() - entry.timestamp < IDEMPOTENCY_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCachedResponse(key, data) {
  if (!key) return;
  if (idempotencyCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of idempotencyCache.entries()) {
      if (now - v.timestamp > IDEMPOTENCY_TTL_MS) {
        idempotencyCache.delete(k);
      }
    }
  }
  idempotencyCache.set(key, { data, timestamp: Date.now() });
}

async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch (e) { return {}; }
    }
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // CORS / Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Idempotency-Key, Idempotency-Key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Idempotency check for mutating requests
  const idempotencyKey = req.headers['x-idempotency-key'] || req.headers['idempotency-key'];
  if (idempotencyKey && req.method !== 'GET') {
    const cached = getCachedResponse(idempotencyKey);
    if (cached) {
      return sendJson(res, 200, { ...cached, _idempotent: true });
    }
  }

  const sendWithIdempotency = (statusCode, data) => {
    if (idempotencyKey && req.method !== 'GET' && statusCode >= 200 && statusCode < 300) {
      setCachedResponse(idempotencyKey, data);
    }
    return sendJson(res, statusCode, data);
  };

  // Determine path
  let path = '';
  if (req.query?.path) {
    path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  } else {
    const rawUrl = req.headers?.['x-matched-path'] || req.headers?.['x-original-url'] || req.url || '';
    path = rawUrl.split('?')[0].replace(/^\/api\/?/, '');
  }
  path = (path || '').replace(/^\/+|\/+$/g, '');
  if (path === 'index.js' || path === 'index') {
    path = '';
  }

  try {
    // 1. DB Health Check
    if (path === 'db-check' && req.method === 'GET') {
      const conn = await testConnection();
      return sendWithIdempotency(200, { ok: true, connection: conn, branch: process.env.NEON_BRANCH || 'production' });
    }

    // 2. Templates API
    if (path === 'templates') {
      if (req.method === 'GET') {
        const templates = await getTemplates();
        return sendWithIdempotency(200, { ok: true, templates });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const saved = await saveTemplate(body);
        return sendWithIdempotency(200, { ok: true, template: saved });
      }
    }
    if (path.startsWith('templates/') && path.endsWith('/default') && req.method === 'POST') {
      const id = path.replace('templates/', '').replace('/default', '');
      const resData = await setDefaultTemplate(id);
      return sendWithIdempotency(200, { ok: true, ...resData });
    }
    if (path.startsWith('templates/') && req.method === 'DELETE') {
      const id = path.replace('templates/', '');
      await deleteTemplate(id);
      return sendWithIdempotency(200, { ok: true });
    }

    // 3. Rosters API
    if (path === 'rosters') {
      if (req.method === 'GET') {
        const rosters = await getRosters();
        return sendWithIdempotency(200, { ok: true, rosters });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const saved = await saveRoster(body);
        return sendWithIdempotency(200, { ok: true, roster: saved });
      }
    }
    if (path.startsWith('rosters/') && req.method === 'DELETE') {
      const id = path.replace('rosters/', '');
      await deleteRoster(id);
      return sendWithIdempotency(200, { ok: true });
    }

    // 4. Game State API
    if (path === 'game-state') {
      if (req.method === 'GET') {
        const state = await getGameState();
        return sendWithIdempotency(200, { ok: true, state });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        await saveGameState(body);
        return sendWithIdempotency(200, { ok: true });
      }
    }

    // 5. Matches API
    if (path === 'matches') {
      if (req.method === 'GET') {
        const matches = await getMatchRecords();
        return sendWithIdempotency(200, { ok: true, matches });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const result = await saveMatchRecord(body);
        return sendWithIdempotency(200, { ok: true, match: result });
      }
    }
    if (path.startsWith('matches/')) {
      const id = path.replace('matches/', '');
      if (req.method === 'GET') {
        const match = await getMatchDetail(id);
        if (!match) {
          return sendWithIdempotency(404, { ok: false, error: 'Match not found' });
        }
        return sendWithIdempotency(200, { ok: true, match });
      }
      if (req.method === 'DELETE') {
        await deleteMatchRecord(id);
        return sendWithIdempotency(200, { ok: true });
      }
    }

    return sendJson(res, 404, { ok: false, error: `Endpoint not found: /api/${path}` });
  } catch (error) {
    console.error(`API Error on /api/${path}:`, error);
    return sendJson(res, 500, { ok: false, error: error.message });
  }
}
