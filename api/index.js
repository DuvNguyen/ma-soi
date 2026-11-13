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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Determine path
  let path = '';
  if (req.query?.path) {
    path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  } else if (req.url) {
    path = req.url.split('?')[0].replace(/^\/api\/?/, '');
  }
  path = (path || '').replace(/^\/+|\/+$/g, '');

  try {
    // 1. DB Health Check
    if (path === 'db-check' && req.method === 'GET') {
      const conn = await testConnection();
      return sendJson(res, 200, { ok: true, connection: conn, branch: process.env.NEON_BRANCH || 'production' });
    }

    // 2. Templates API
    if (path === 'templates') {
      if (req.method === 'GET') {
        const templates = await getTemplates();
        return sendJson(res, 200, { ok: true, templates });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const saved = await saveTemplate(body);
        return sendJson(res, 200, { ok: true, template: saved });
      }
    }
    if (path.startsWith('templates/') && path.endsWith('/default') && req.method === 'POST') {
      const id = path.replace('templates/', '').replace('/default', '');
      const resData = await setDefaultTemplate(id);
      return sendJson(res, 200, { ok: true, ...resData });
    }
    if (path.startsWith('templates/') && req.method === 'DELETE') {
      const id = path.replace('templates/', '');
      await deleteTemplate(id);
      return sendJson(res, 200, { ok: true });
    }

    // 3. Rosters API
    if (path === 'rosters') {
      if (req.method === 'GET') {
        const rosters = await getRosters();
        return sendJson(res, 200, { ok: true, rosters });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const saved = await saveRoster(body);
        return sendJson(res, 200, { ok: true, roster: saved });
      }
    }
    if (path.startsWith('rosters/') && req.method === 'DELETE') {
      const id = path.replace('rosters/', '');
      await deleteRoster(id);
      return sendJson(res, 200, { ok: true });
    }

    // 4. Game State API
    if (path === 'game-state') {
      if (req.method === 'GET') {
        const state = await getGameState();
        return sendJson(res, 200, { ok: true, state });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        await saveGameState(body);
        return sendJson(res, 200, { ok: true });
      }
    }

    // 5. Matches API
    if (path === 'matches') {
      if (req.method === 'GET') {
        const matches = await getMatchRecords();
        return sendJson(res, 200, { ok: true, matches });
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const result = await saveMatchRecord(body);
        return sendJson(res, 200, { ok: true, match: result });
      }
    }
    if (path.startsWith('matches/')) {
      const id = path.replace('matches/', '');
      if (req.method === 'GET') {
        const match = await getMatchDetail(id);
        if (!match) {
          return sendJson(res, 404, { ok: false, error: 'Match not found' });
        }
        return sendJson(res, 200, { ok: true, match });
      }
      if (req.method === 'DELETE') {
        await deleteMatchRecord(id);
        return sendJson(res, 200, { ok: true });
      }
    }

    return sendJson(res, 404, { ok: false, error: `Endpoint not found: /api/${path}` });
  } catch (error) {
    console.error(`API Error on /api/${path}:`, error);
    return sendJson(res, 500, { ok: false, error: error.message });
  }
}
