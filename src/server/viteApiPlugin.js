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
} from './db.js';

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

export function neonApiPlugin() {
  return {
    name: 'neon-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        
        if (!url.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        const idempotencyKey = req.headers['x-idempotency-key'] || req.headers['idempotency-key'];
        if (idempotencyKey && req.method !== 'GET') {
          const cached = getCachedResponse(idempotencyKey);
          if (cached) {
            return res.end(JSON.stringify({ ...cached, _idempotent: true }));
          }
        }

        const sendReply = (data, statusCode = 200) => {
          if (idempotencyKey && req.method !== 'GET') {
            setCachedResponse(idempotencyKey, data);
          }
          res.statusCode = statusCode;
          return res.end(JSON.stringify(data));
        };

        const readJsonBody = () => new Promise((resolve, reject) => {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch (err) {
              reject(err);
            }
          });
          req.on('error', reject);
        });

        try {
          // DB Health Check
          if (url === '/api/db-check' && req.method === 'GET') {
            const conn = await testConnection();
            return sendReply({ ok: true, connection: conn, branch: process.env.NEON_BRANCH || 'production' });
          }

          // Templates API
          if (url === '/api/templates') {
            if (req.method === 'GET') {
              const templates = await getTemplates();
              return sendReply({ ok: true, templates });
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              const saved = await saveTemplate(body);
              return sendReply({ ok: true, template: saved });
            }
          }

          if (url.startsWith('/api/templates/') && url.endsWith('/default') && req.method === 'POST') {
            const id = url.replace('/api/templates/', '').replace('/default', '');
            const resData = await setDefaultTemplate(id);
            return sendReply({ ok: true, ...resData });
          }

          if (url.startsWith('/api/templates/') && req.method === 'DELETE') {
            const id = url.replace('/api/templates/', '');
            await deleteTemplate(id);
            return sendReply({ ok: true });
          }

          // Rosters API
          if (url === '/api/rosters') {
            if (req.method === 'GET') {
              const rosters = await getRosters();
              return sendReply({ ok: true, rosters });
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              const saved = await saveRoster(body);
              return sendReply({ ok: true, roster: saved });
            }
          }

          if (url.startsWith('/api/rosters/') && req.method === 'DELETE') {
            const id = url.replace('/api/rosters/', '');
            await deleteRoster(id);
            return sendReply({ ok: true });
          }

          // Game State API
          if (url === '/api/game-state') {
            if (req.method === 'GET') {
              const state = await getGameState();
              return sendReply({ ok: true, state });
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              await saveGameState(body);
              return sendReply({ ok: true });
            }
          }

          // Match History / Records API
          if (url === '/api/matches') {
            if (req.method === 'GET') {
              const matches = await getMatchRecords();
              return sendReply({ ok: true, matches });
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              const result = await saveMatchRecord(body);
              return sendReply({ ok: true, match: result });
            }
          }

          if (url.startsWith('/api/matches/') && req.method === 'GET') {
            const id = url.replace('/api/matches/', '');
            const match = await getMatchDetail(id);
            if (!match) {
              return sendReply({ ok: false, error: 'Match not found' }, 404);
            }
            return sendReply({ ok: true, match });
          }

          if (url.startsWith('/api/matches/') && req.method === 'DELETE') {
            const id = url.replace('/api/matches/', '');
            await deleteMatchRecord(id);
            return sendReply({ ok: true });
          }

          return sendReply({ ok: false, error: 'Endpoint not found' }, 404);
        } catch (error) {
          console.error(`API Error on ${url}:`, error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ ok: false, error: error.message }));
        }
      });
    }
  };
}
