// API service communicating with Neon DB backend

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
  const res = await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template)
  });
  return await res.json();
}

export async function setDefaultTemplateApi(id) {
  try {
    const res = await fetch(`/api/templates/${id}/default`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to set default template:', err);
    throw err;
  }
}

export async function deleteTemplateApi(id) {
  const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
  return await res.json();
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
  try {
    const res = await fetch('/api/rosters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roster)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to save roster to Neon:', err);
    throw err;
  }
}

export async function deleteRosterApi(id) {
  try {
    const res = await fetch(`/api/rosters/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error('Failed to delete roster from Neon:', err);
    throw err;
  }
}

export async function syncGameStateApi(state) {
  try {
    const res = await fetch('/api/game-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    return await res.json();
  } catch (err) {
    console.warn('Game state sync skipped:', err);
  }
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
  try {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to save match record to Neon:', err);
  }
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
