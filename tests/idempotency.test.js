import test from 'node:test';
import assert from 'node:assert/strict';

// Mock global fetch for testing api.js in Node environment
const originalFetch = global.fetch;

test('Idempotency & Concurrent Request Deduplication Suite', async (t) => {
  let fetchCalls = [];

  // Set up mock fetch that records calls and simulates async latency
  global.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options, timestamp: Date.now() });
    // Simulate network delay of 30ms
    await new Promise(resolve => setTimeout(resolve, 30));
    return {
      ok: true,
      json: async () => ({
        ok: true,
        receivedUrl: url,
        headers: options.headers,
        body: options.body ? JSON.parse(options.body) : null
      })
    };
  };

  t.after(() => {
    global.fetch = originalFetch;
  });

  const {
    saveTemplateApi,
    setDefaultTemplateApi,
    deleteTemplateApi,
    saveRosterApi,
    deleteRosterApi,
    saveMatchRecordApi,
    deleteMatchRecordApi,
    syncGameStateApi
  } = await import('../src/services/api.js');

  await t.test('1. saveTemplateApi deduplicates rapid concurrent calls into a single HTTP request', async () => {
    fetchCalls = [];
    const template = { id: 'test-template-1', name: 'Bộ bài test', roleIds: ['soi-thuong', 'dan-lang'] };

    // Fire 3 simultaneous save calls
    const [res1, res2, res3] = await Promise.all([
      saveTemplateApi(template),
      saveTemplateApi(template),
      saveTemplateApi(template)
    ]);

    assert.equal(fetchCalls.length, 1, 'Should only send 1 HTTP request across 3 concurrent calls');
    assert.equal(fetchCalls[0].url, '/api/templates');
    assert.equal(fetchCalls[0].options.method, 'POST');
    assert.ok(fetchCalls[0].options.headers['X-Idempotency-Key'], 'Should attach X-Idempotency-Key header');
    assert.deepEqual(res1, res2);
    assert.deepEqual(res2, res3);
  });

  await t.test('2. saveRosterApi deduplicates rapid concurrent calls into a single HTTP request', async () => {
    fetchCalls = [];
    const roster = { id: 'test-roster-1', name: 'Nhóm test', playerNames: ['A', 'B', 'C', 'D'] };

    // Fire 3 simultaneous save calls
    const [res1, res2, res3] = await Promise.all([
      saveRosterApi(roster),
      saveRosterApi(roster),
      saveRosterApi(roster)
    ]);

    assert.equal(fetchCalls.length, 1, 'Should only send 1 HTTP request across 3 concurrent calls');
    assert.equal(fetchCalls[0].url, '/api/rosters');
    assert.equal(fetchCalls[0].options.method, 'POST');
    assert.ok(fetchCalls[0].options.headers['X-Idempotency-Key'], 'Should attach X-Idempotency-Key header');
    assert.deepEqual(res1, res2);
  });

  await t.test('3. setDefaultTemplateApi and deleteTemplateApi deduplicate concurrent calls', async () => {
    fetchCalls = [];
    await Promise.all([
      setDefaultTemplateApi('tpl-100'),
      setDefaultTemplateApi('tpl-100')
    ]);
    assert.equal(fetchCalls.length, 1, 'Set default should only send 1 HTTP request');
    assert.equal(fetchCalls[0].url, '/api/templates/tpl-100/default');

    fetchCalls = [];
    await Promise.all([
      deleteTemplateApi('tpl-100'),
      deleteTemplateApi('tpl-100')
    ]);
    assert.equal(fetchCalls.length, 1, 'Delete template should only send 1 HTTP request');
    assert.equal(fetchCalls[0].url, '/api/templates/tpl-100');
  });

  await t.test('4. saveMatchRecordApi and deleteMatchRecordApi deduplicate concurrent calls', async () => {
    fetchCalls = [];
    const match = { id: 'match-123', winnerTeam: 'V', totalRounds: 3 };

    await Promise.all([
      saveMatchRecordApi(match),
      saveMatchRecordApi(match)
    ]);
    assert.equal(fetchCalls.length, 1, 'Save match should only send 1 HTTP request for same match ID');
    assert.equal(fetchCalls[0].url, '/api/matches');

    fetchCalls = [];
    await Promise.all([
      deleteMatchRecordApi('match-123'),
      deleteMatchRecordApi('match-123')
    ]);
    assert.equal(fetchCalls.length, 1, 'Delete match should only send 1 HTTP request');
    assert.equal(fetchCalls[0].url, '/api/matches/match-123');
  });

  await t.test('5. syncGameStateApi debounces rapid state mutations and flushes only latest state', async () => {
    fetchCalls = [];

    // Rapidly call sync 4 times within milliseconds
    syncGameStateApi({ roundNumber: 1 });
    syncGameStateApi({ roundNumber: 2 });
    syncGameStateApi({ roundNumber: 3 });
    const finalSyncPromise = syncGameStateApi({ roundNumber: 4, isNight: false });

    await finalSyncPromise;
    // Wait slightly for any pending queue to finish
    await new Promise(resolve => setTimeout(resolve, 500));

    assert.equal(fetchCalls.length, 1, 'Rapid state changes should debounce to 1 request');
    const sentBody = JSON.parse(fetchCalls[0].options.body);
    assert.equal(sentBody.roundNumber, 4, 'Should send the latest debounced state');
    assert.equal(sentBody.isNight, false);
  });
});
