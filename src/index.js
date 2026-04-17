export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env, url, corsHeaders);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

async function handleApiRequest(request, env, url, headers) {
  const method = request.method;

  // ------------ NOTES CRUD ------------
  if (url.pathname === '/api/notes') {
    if (method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, content, tags, updated_at FROM notes ORDER BY updated_at DESC'
      ).all();
      return jsonResponse(results, headers);
    }

    if (method === 'POST') {
      const body = await request.json();
      const id = body.id || 'scratchpad';
      const content = body.content || '';
      const tags = body.tags || '';

      await env.DB.prepare(
        `INSERT INTO notes (id, content, tags, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET
           content = excluded.content,
           tags    = excluded.tags,
           updated_at = CURRENT_TIMESTAMP`
      ).bind(id, content, tags).run();

      return jsonResponse({ success: true, id }, headers);
    }
  }

  // PATCH – rename a note (change its ID)
  if (url.pathname.startsWith('/api/notes/') && method === 'PATCH') {
    const oldId = decodeURIComponent(url.pathname.split('/').pop());
    const body  = await request.json();
    const newId = body.newId?.trim();
    if (!newId) return errorResponse(400, 'newId is required', headers);

    // Check for conflict
    const existing = await env.DB.prepare('SELECT id FROM notes WHERE id = ?').bind(newId).first();
    if (existing) return errorResponse(409, 'A note with that name already exists', headers);

    await env.DB.prepare('UPDATE notes SET id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(newId, oldId).run();
    return jsonResponse({ success: true, id: newId }, headers);
  }

  if (url.pathname.startsWith('/api/notes/') && method === 'DELETE') {
    const id = decodeURIComponent(url.pathname.split('/').pop());
    await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true }, headers);
  }

  // ------------ HISTORY CRUD ------------
  if (url.pathname === '/api/history') {
    if (method === 'GET') {
      const toolId = url.searchParams.get('tool');
      let query  = 'SELECT * FROM tool_history';
      let params = [];

      if (toolId) {
        query += ' WHERE tool_id = ? ORDER BY created_at DESC LIMIT 50';
        params.push(toolId);
      } else {
        query += ' ORDER BY created_at DESC LIMIT 100';
      }

      const { results } = await env.DB.prepare(query).bind(...params).all();
      return jsonResponse(results, headers);
    }

    if (method === 'POST') {
      const body = await request.json();
      if (!body.toolId || !body.payload)
        return errorResponse(400, 'Missing parameters', headers);

      await env.DB.prepare(
        'INSERT INTO tool_history (tool_id, payload) VALUES (?, ?)'
      ).bind(body.toolId, JSON.stringify(body.payload)).run();

      return jsonResponse({ success: true }, headers);
    }

    if (method === 'DELETE') {
      const toolId = url.searchParams.get('tool');
      if (toolId) {
        await env.DB.prepare('DELETE FROM tool_history WHERE tool_id = ?').bind(toolId).run();
      } else {
        await env.DB.prepare('DELETE FROM tool_history').run();
      }
      return jsonResponse({ success: true }, headers);
    }
  }

  // ------------ USER PREFS (pinned tools, etc.) ------------
  if (url.pathname === '/api/prefs') {
    if (method === 'GET') {
      const key = url.searchParams.get('key');
      if (!key) return errorResponse(400, 'key param required', headers);
      const row = await env.DB.prepare('SELECT value FROM user_prefs WHERE key = ?').bind(key).first();
      return jsonResponse({ key, value: row ? row.value : null }, headers);
    }

    if (method === 'POST') {
      const body = await request.json();
      if (!body.key) return errorResponse(400, 'key is required', headers);

      await env.DB.prepare(
        `INSERT INTO user_prefs (key, value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      ).bind(body.key, body.value ?? '').run();

      return jsonResponse({ success: true }, headers);
    }
  }

  // ------------ GLOBAL SEARCH ------------
  if (url.pathname === '/api/search') {
    if (method === 'GET') {
      const q    = url.searchParams.get('q') || '';
      const mode = url.searchParams.get('mode') || 'insensitive';

      const { results: notes   } = await env.DB.prepare('SELECT id, content, tags FROM notes').all();
      const { results: history } = await env.DB.prepare(
        'SELECT tool_id, payload, created_at FROM tool_history ORDER BY created_at DESC LIMIT 500'
      ).all();

      let matcher;
      try {
        const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if      (mode === 'regex')       matcher = new RegExp(q);
        else if (mode === 'insensitive') matcher = new RegExp(esc(q), 'i');
        else if (mode === 'sensitive')   matcher = new RegExp(esc(q));
        else if (mode === 'exact')       matcher = new RegExp('\\b' + esc(q) + '\\b');
      } catch (e) {
        return errorResponse(400, 'Invalid regex pattern', headers);
      }

      const results = [];

      notes.forEach(n => {
        if (matcher.test(n.id) || matcher.test(n.content) || matcher.test(n.tags || '')) {
          results.push({ type: 'note', title: n.id, id: n.id, time: n.updated_at, tags: n.tags });
        }
      });

      history.forEach(h => {
        if (matcher.test(h.tool_id) || matcher.test(h.payload)) {
          results.push({
            type: 'history',
            title: h.tool_id.replace('tile-', ''),
            time: h.created_at,
            payload: h.payload
          });
        }
      });

      return jsonResponse(results, headers);
    }
  }

  return errorResponse(404, 'API path not found', headers);
}

function jsonResponse(data, headers) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function errorResponse(status, message, headers) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}
