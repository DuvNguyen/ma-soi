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
    const res = await fetch('/api/templates');
    const data = await res.json();
    if (data.ok && data.templates) {
      localStorage.setItem('werewolf_templates_cache', JSON.stringify(data.templates));
      return data.templates;
    }
  } catch (err) {
    console.warn('Using cached templates due to network:', err);
  }
  const cached = localStorage.getItem('werewolf_templates_cache');
  return cached ? JSON.parse(cached) : [];
}

export async function saveTemplateApi(template) {
  try {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    const data = await res.json();
    // Synchronize local cache
    try {
      const cached = localStorage.getItem('werewolf_templates_cache');
      let list = cached ? JSON.parse(cached) : [];
      const idx = list.findIndex(t => t.id === template.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...template };
      } else {
        list.unshift(template);
      }
      localStorage.setItem('werewolf_templates_cache', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to update local templates cache:', e);
    }
    return data;
  } catch (err) {
    console.error('Failed to save template to Neon:', err);
    // Offline fallback to local storage
    try {
      const cached = localStorage.getItem('werewolf_templates_cache');
      let list = cached ? JSON.parse(cached) : [];
      const idx = list.findIndex(t => t.id === template.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...template };
      } else {
        list.unshift(template);
      }
      localStorage.setItem('werewolf_templates_cache', JSON.stringify(list));
      return { ok: true, template };
    } catch (localErr) {
      throw err;
    }
  }
}

export async function deleteTemplateApi(id) {
  try {
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    try {
      const cached = localStorage.getItem('werewolf_templates_cache');
      if (cached) {
        const list = JSON.parse(cached).filter(t => t.id !== id);
        localStorage.setItem('werewolf_templates_cache', JSON.stringify(list));
      }
    } catch (e) {}
    return await res.json();
  } catch (err) {
    console.error('Failed to delete template from Neon:', err);
    try {
      const cached = localStorage.getItem('werewolf_templates_cache');
      if (cached) {
        const list = JSON.parse(cached).filter(t => t.id !== id);
        localStorage.setItem('werewolf_templates_cache', JSON.stringify(list));
      }
      return { ok: true };
    } catch (localErr) {
      throw err;
    }
  }
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
