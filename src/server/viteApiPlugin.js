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
            return res.end(JSON.stringify({ ok: true, connection: conn, branch: process.env.NEON_BRANCH || 'production' }));
          }

          // Templates API
          if (url === '/api/templates') {
            if (req.method === 'GET') {
              const templates = await getTemplates();
              return res.end(JSON.stringify({ ok: true, templates }));
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              const saved = await saveTemplate(body);
              return res.end(JSON.stringify({ ok: true, template: saved }));
            }
          }

          if (url.startsWith('/api/templates/') && url.endsWith('/default') && req.method === 'POST') {
            const id = url.replace('/api/templates/', '').replace('/default', '');
            const resData = await setDefaultTemplate(id);
            return res.end(JSON.stringify({ ok: true, ...resData }));
          }

          if (url.startsWith('/api/templates/') && req.method === 'DELETE') {
            const id = url.replace('/api/templates/', '');
            await deleteTemplate(id);
            return res.end(JSON.stringify({ ok: true }));
          }

          // Rosters API
          if (url === '/api/rosters') {
            if (req.method === 'GET') {
              const rosters = await getRosters();
              return res.end(JSON.stringify({ ok: true, rosters }));
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              const saved = await saveRoster(body);
              return res.end(JSON.stringify({ ok: true, roster: saved }));
            }
          }

          if (url.startsWith('/api/rosters/') && req.method === 'DELETE') {
            const id = url.replace('/api/rosters/', '');
            await deleteRoster(id);
            return res.end(JSON.stringify({ ok: true }));
          }

          // Game State API
          if (url === '/api/game-state') {
            if (req.method === 'GET') {
              const state = await getGameState();
              return res.end(JSON.stringify({ ok: true, state }));
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              await saveGameState(body);
              return res.end(JSON.stringify({ ok: true }));
            }
          }

          // Match History / Records API
          if (url === '/api/matches') {
            if (req.method === 'GET') {
              const matches = await getMatchRecords();
              return res.end(JSON.stringify({ ok: true, matches }));
            }
            if (req.method === 'POST') {
              const body = await readJsonBody();
              const result = await saveMatchRecord(body);
              return res.end(JSON.stringify({ ok: true, match: result }));
            }
          }

          if (url.startsWith('/api/matches/') && req.method === 'GET') {
            const id = url.replace('/api/matches/', '');
            const match = await getMatchDetail(id);
            if (!match) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ ok: false, error: 'Match not found' }));
            }
            return res.end(JSON.stringify({ ok: true, match }));
          }

          if (url.startsWith('/api/matches/') && req.method === 'DELETE') {
            const id = url.replace('/api/matches/', '');
            await deleteMatchRecord(id);
            return res.end(JSON.stringify({ ok: true }));
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ ok: false, error: 'Endpoint not found' }));
        } catch (error) {
          console.error(`API Error on ${url}:`, error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ ok: false, error: error.message }));
        }
      });
    }
  };
}
