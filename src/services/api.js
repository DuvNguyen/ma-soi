// API service communicating with Neon DB backend with built-in idempotency & double-submit protection

// In-flight request tracker to prevent duplicate concurrent API calls
const inFlightRequests = new Map();

/**
 * Deduplicates concurrent identical requests by returning the existing active Promise.
 * Generates and attaches an X-Idempotency-Key header for server-side verification.
 */
async function fetchWithIdempotency(key, url, options = {}) {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const idempotencyKey = options.idempotencyKey || `${key}-${Date.now()}`;
  const headers = {
    ...(options.headers || {}),
    'X-Idempotency-Key': idempotencyKey,
    'Idempotency-Key': idempotencyKey
  };

  const promise = (async () => {
    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({ ok: res.ok }));
      return data;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

export async function checkNeonConnection() {
  try {
    const res = await fetch('/api/db-check');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to check Neon connection:', err);
    return { ok: false, error: err.message };
  }
}

export async function fetchTemplates() {
  try {
    const res = await fetch('/api/templates', { cache: 'no-store' });
    const data = await res.json();
    if (data.ok && data.templates) {
      return data.templates;
    }
  } catch (err) {
    console.error('Failed to fetch templates from Neon DB:', err);
  }
  return [];
}

export async function saveTemplateApi(template) {
  const key = `template:save:${template?.id || template?.name || 'unknown'}`;
  return fetchWithIdempotency(key, '/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template)
  });
}

export async function setDefaultTemplateApi(id) {
  const key = `template:default:${id}`;
  return fetchWithIdempotency(key, `/api/templates/${id}/default`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function deleteTemplateApi(id) {
  const key = `template:delete:${id}`;
  return fetchWithIdempotency(key, `/api/templates/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchRosters() {
  try {
    const res = await fetch('/api/rosters');
    const data = await res.json();
    if (data.ok && data.rosters) {
      localStorage.setItem('werewolf_rosters_cache', JSON.stringify(data.rosters));
      return data.rosters;
    }
  } catch (err) {
    console.warn('Using cached rosters due to network:', err);
  }
  const cached = localStorage.getItem('werewolf_rosters_cache');
  return cached ? JSON.parse(cached) : [];
}

export async function saveRosterApi(roster) {
  const key = `roster:save:${roster?.id || roster?.name || 'unknown'}`;
  return fetchWithIdempotency(key, '/api/rosters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roster)
  });
}

export async function deleteRosterApi(id) {
  const key = `roster:delete:${id}`;
  return fetchWithIdempotency(key, `/api/rosters/${id}`, {
    method: 'DELETE'
  });
}

// State sync queue to debounce rapid writes and prevent concurrent sync spamming
let syncTimeout = null;
let pendingStateToSync = null;
let isSyncing = false;

export async function syncGameStateApi(state) {
  pendingStateToSync = state;
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  return new Promise((resolve) => {
    syncTimeout = setTimeout(async () => {
      syncTimeout = null;
      if (isSyncing || !pendingStateToSync) {
        resolve({ ok: true, debounced: true });
        return;
      }

      while (pendingStateToSync) {
        const stateToExecute = pendingStateToSync;
        pendingStateToSync = null;
        isSyncing = true;
        try {
          const res = await fetch('/api/game-state', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Idempotency-Key': `sync-game-state-${Date.now()}`
            },
            body: JSON.stringify(stateToExecute)
          });
          const data = await res.json().catch(() => ({ ok: res.ok }));
          resolve(data);
        } catch (err) {
          console.warn('Game state sync skipped:', err);
          resolve({ ok: false, error: err.message });
        } finally {
          isSyncing = false;
        }
      }
    }, 400);
  });
}

export async function loadGameStateApi() {
  try {
    const res = await fetch('/api/game-state');
    const data = await res.json();
    if (data.ok && data.state) {
      return data.state;
    }
  } catch (err) {
    console.warn('Failed to load cloud game state:', err);
  }
  return null;
}

export async function saveMatchRecordApi(matchData) {
  const key = `match:save:${matchData?.id || 'unknown'}`;
  return fetchWithIdempotency(key, '/api/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchData)
  });
}

export async function deleteMatchRecordApi(id) {
  const key = `match:delete:${id}`;
  return fetchWithIdempotency(key, `/api/matches/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchMatchRecordsApi() {
  try {
    const res = await fetch('/api/matches');
    const data = await res.json();
    if (data.ok && data.matches) {
      return data.matches;
    }
  } catch (err) {
    console.error('Failed to fetch match records from Neon:', err);
  }
  return [];
}

export async function fetchMatchDetailApi(id) {
  try {
    const res = await fetch(`/api/matches/${id}`);
    const data = await res.json();
    if (data.ok && data.match) {
      return data.match;
    }
  } catch (err) {
    console.error('Failed to fetch match detail from Neon:', err);
  }
  return null;
}
