export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // ------------ AUTH ENDPOINTS ------------
  if (url.pathname === '/api/auth/register' && method === 'POST') {
    const { username, password } = await request.json();
    if (!username || !password) return errorResponse(400, 'Username and password required', headers);

    const existingUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existingUser) return errorResponse(409, 'Username already exists', headers);

    const id = crypto.randomUUID();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hash = await hashPassword(password, saltHex);
    const passwordHash = `pbkdf2$${saltHex}$${hash}`;

    await env.DB.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
      .bind(id, username, passwordHash).run();

    const token = await generateJWT({ userId: id, username }, env.JWT_SECRET || 'fallback_secret');
    const cookie = `bharath_utils_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`;
    return jsonResponse({ success: true, token, username }, { ...headers, 'Set-Cookie': cookie });
  }

  if (url.pathname === '/api/auth/login' && method === 'POST') {
    // ... (existing login code)
  }

  // ------------ GITHUB OAUTH ------------
  if (url.pathname === '/api/auth/github') {
    const clientId = env.GITHUB_CLIENT_ID;
    const redirectUri = `${url.origin}/api/auth/github/callback`;
    return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`, 302);
  }

  if (url.pathname === '/api/auth/github/callback') {
    const code = url.searchParams.get('code');
    const clientId = env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET;

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const tokenData = await tokenRes.json();
    
    if (tokenData.access_token) {
      const userRes = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'User-Agent': 'Nexus-Auth' }
      });
      const userData = await userRes.json();
      const username = `github_${userData.login}`;
      
      let user = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
      if (!user) {
        const id = crypto.randomUUID();
        await env.DB.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
          .bind(id, username, 'OAUTH').run();
        user = { id };
      }
      
      const token = await generateJWT({ userId: user.id, username }, env.JWT_SECRET || 'fallback_secret');
      return Response.redirect(`${env.FRONTEND_URL || url.origin}/?token=${token}&username=${username}`, 302);
    }
    return errorResponse(400, 'GitHub auth failed', headers);
  }

  // ------------ GOOGLE OAUTH ------------
  if (url.pathname === '/api/auth/google') {
    const clientId = env.GOOGLE_CLIENT_ID;
    const redirectUri = `${url.origin}/api/auth/google/callback`;
    return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`, 302);
  }

  if (url.pathname === '/api/auth/google/callback') {
    const code = url.searchParams.get('code');
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri, grant_type: 'authorization_code' })
    });
    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();
      const username = `google_${userData.email.split('@')[0]}`;

      let user = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
      if (!user) {
        const id = crypto.randomUUID();
        await env.DB.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
          .bind(id, username, 'OAUTH').run();
        user = { id };
      }

      const token = await generateJWT({ userId: user.id, username }, env.JWT_SECRET || 'fallback_secret');
      return Response.redirect(`${env.FRONTEND_URL || url.origin}/?token=${token}&username=${username}`, 302);
    }
    return errorResponse(400, 'Google auth failed', headers);
  }

  // ------------ PROTECTED AREA ------------
  const user = await authenticate(request, env);
  if (!user) return errorResponse(401, 'Unauthorized', headers);
  const userId = user.userId;

  // ------------ USER PROFILE ------------
  if (url.pathname === '/api/auth/update_password' && method === 'POST') {
    const { oldPassword, newPassword } = await request.json();
    if (!oldPassword || !newPassword) return errorResponse(400, 'Missing password fields', headers);

    const fullUser = await env.DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(userId).first();
    if (!fullUser) return errorResponse(404, 'User not found', headers);

    const [algo, salt, hash] = fullUser.password_hash.split('$');
    const computedOldHash = await hashPassword(oldPassword, salt);
    if (computedOldHash !== hash) return errorResponse(401, 'Incorrect current password', headers);

    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    const newSaltHex = Array.from(newSalt).map(b => b.toString(16).padStart(2, '0')).join('');
    const newHash = await hashPassword(newPassword, newSaltHex);
    const newPasswordHash = `pbkdf2$${newSaltHex}$${newHash}`;

    await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newPasswordHash, userId).run();
    return jsonResponse({ success: true }, headers);
  }

  // ------------ NOTES CRUD ------------
  if (url.pathname === '/api/notes') {
    if (method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, content, tags, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC'
      ).bind(userId).all();
      return jsonResponse(results, headers);
    }

    if (method === 'POST') {
      const body = await request.json();
      const id = body.id || 'scratchpad';
      const content = body.content || '';
      const tags = body.tags || '';

      await env.DB.prepare(
        `INSERT INTO notes (user_id, id, content, tags, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, id) DO UPDATE SET
           content = excluded.content,
           tags    = excluded.tags,
           updated_at = CURRENT_TIMESTAMP`
      ).bind(userId, id, content, tags).run();

      return jsonResponse({ success: true, id }, headers);
    }
  }

  if (url.pathname.startsWith('/api/notes/') && method === 'PATCH') {
    const oldId = decodeURIComponent(url.pathname.split('/').pop());
    const body  = await request.json();
    const newId = body.newId?.trim();
    if (!newId) return errorResponse(400, 'newId is required', headers);

    const existing = await env.DB.prepare('SELECT id FROM notes WHERE user_id = ? AND id = ?').bind(userId, newId).first();
    if (existing) return errorResponse(409, 'A note with that name already exists', headers);

    await env.DB.prepare('UPDATE notes SET id = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND id = ?')
      .bind(newId, userId, oldId).run();
    return jsonResponse({ success: true, id: newId }, headers);
  }

  if (url.pathname.startsWith('/api/notes/') && method === 'DELETE') {
    const id = decodeURIComponent(url.pathname.split('/').pop());
    await env.DB.prepare('DELETE FROM notes WHERE user_id = ? AND id = ?').bind(userId, id).run();
    return jsonResponse({ success: true }, headers);
  }

  // ------------ HISTORY CRUD ------------
  if (url.pathname === '/api/history') {
    if (method === 'GET') {
      const toolId = url.searchParams.get('tool');
      let query;
      let params = [userId];

      if (toolId) {
        // Use GROUP BY to hide duplicates from history display
        query = 'SELECT id, tool_id, payload, MAX(created_at) as created_at FROM tool_history WHERE user_id = ? AND tool_id = ? GROUP BY payload ORDER BY created_at DESC LIMIT 50';
        params.push(toolId);
      } else {
        query = 'SELECT id, tool_id, payload, MAX(created_at) as created_at FROM tool_history WHERE user_id = ? GROUP BY tool_id, payload ORDER BY created_at DESC LIMIT 100';
      }

      const { results } = await env.DB.prepare(query).bind(...params).all();
      return jsonResponse(results, headers);
    }

    if (method === 'POST') {
      const body = await request.json();
      if (!body.toolId || !body.payload)
        return errorResponse(400, 'Missing parameters', headers);

      const payloadStr = JSON.stringify(body.payload);

      // Clean up duplicates: remove any existing entry with the same payload for this tool/user
      // This ensures that repeating an action moves it to the top of the history.
      await env.DB.prepare(
        'DELETE FROM tool_history WHERE user_id = ? AND tool_id = ? AND payload = ?'
      ).bind(userId, body.toolId, payloadStr).run();

      await env.DB.prepare(
        'INSERT INTO tool_history (user_id, tool_id, payload) VALUES (?, ?, ?)'
      ).bind(userId, body.toolId, payloadStr).run();

      return jsonResponse({ success: true }, headers);
    }

    if (method === 'DELETE') {
      const toolId = url.searchParams.get('tool');
      if (toolId) {
        await env.DB.prepare('DELETE FROM tool_history WHERE user_id = ? AND tool_id = ?').bind(userId, toolId).run();
      } else {
        await env.DB.prepare('DELETE FROM tool_history WHERE user_id = ?').bind(userId).run();
      }
      return jsonResponse({ success: true }, headers);
    }
  }

  // ------------ USER PREFS ------------
  if (url.pathname === '/api/prefs') {
    if (method === 'GET') {
      const key = url.searchParams.get('key');
      if (!key) return errorResponse(400, 'key param required', headers);
      const row = await env.DB.prepare('SELECT value FROM user_prefs WHERE user_id = ? AND key = ?').bind(userId, key).first();
      return jsonResponse({ key, value: row ? row.value : null }, headers);
    }

    if (method === 'POST') {
      const body = await request.json();
      if (!body.key) return errorResponse(400, 'key is required', headers);

      await env.DB.prepare(
        `INSERT INTO user_prefs (user_id, key, value, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      ).bind(userId, body.key, body.value ?? '').run();

      return jsonResponse({ success: true }, headers);
    }
  }

  // ------------ GLOBAL SEARCH ------------
  if (url.pathname === '/api/search') {
    if (method === 'GET') {
      const q = url.searchParams.get('q') || '';
      
      let likePattern = `%${q}%`;
      if (q.includes('*') || q.includes('?')) {
        likePattern = q.replace(/\*/g, '%').replace(/\?/g, '_');
      }

      const { results: notes } = await env.DB.prepare(
        'SELECT id, content, tags, updated_at FROM notes WHERE user_id = ? AND (id LIKE ? OR content LIKE ? OR tags LIKE ?)'
      ).bind(userId, likePattern, likePattern, likePattern).all();

      const { results: history } = await env.DB.prepare(
        `SELECT tool_id, payload, MAX(created_at) as created_at 
         FROM tool_history 
         WHERE user_id = ? AND (tool_id LIKE ? OR payload LIKE ?) 
         GROUP BY tool_id, payload 
         ORDER BY created_at DESC LIMIT 500`
      ).bind(userId, likePattern, likePattern).all();

      const results = [];
      notes.forEach(n => {
        results.push({ type: 'note', title: n.id, id: n.id, time: n.updated_at, tags: n.tags });
      });
      history.forEach(h => {
        results.push({ 
          type: 'history', 
          toolId: h.tool_id, 
          title: h.tool_id.replace('tile-', ''), 
          time: h.created_at, 
          payload: h.payload 
        });
      });

      return jsonResponse(results, headers);
    }
  }

  return errorResponse(404, 'API path not found', headers);
}

// ------------ HELPERS ------------

async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) })); // 30 days
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function sign(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const msg = `${header}.${payload}`;
  const validSignature = await sign(msg, secret);
  if (signature !== validSignature) return null;
  const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) return null;
  return decodedPayload;
}

async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return await verifyJWT(token, env.JWT_SECRET || 'fallback_secret');
}

function jsonResponse(data, headers) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', ...headers } });
}

function errorResponse(status, message, headers) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}
