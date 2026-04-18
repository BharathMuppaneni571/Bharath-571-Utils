var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (url.pathname.startsWith("/api/")) {
        return await handleApiRequest(request, env, url, corsHeaders);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
async function handleApiRequest(request, env, url, headers) {
  const method = request.method;
  if (url.pathname === "/api/auth/register" && method === "POST") {
    const { username, password } = await request.json();
    if (!username || !password) return errorResponse(400, "Username and password required", headers);
    const existingUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
    if (existingUser) return errorResponse(409, "Username already exists", headers);
    const id = crypto.randomUUID();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
    const hash = await hashPassword(password, saltHex);
    const passwordHash = `pbkdf2$${saltHex}$${hash}`;
    await env.DB.prepare("INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)").bind(id, username, passwordHash).run();
    const token = await generateJWT({ userId: id, username }, env.JWT_SECRET || "fallback_secret");
    return jsonResponse({ success: true, token, username }, headers);
  }
  if (url.pathname === "/api/auth/login" && method === "POST") {
    const { username, password } = await request.json();
    const user2 = await env.DB.prepare("SELECT id, password_hash FROM users WHERE username = ?").bind(username).first();
    if (!user2) return errorResponse(401, "Invalid credentials", headers);
    const [algo, salt, hash] = user2.password_hash.split("$");
    const computedHash = await hashPassword(password, salt);
    if (computedHash !== hash) return errorResponse(401, "Invalid credentials", headers);
    const token = await generateJWT({ userId: user2.id, username }, env.JWT_SECRET || "fallback_secret");
    return jsonResponse({ success: true, token, username }, headers);
  }
  const user = await authenticate(request, env);
  if (!user) return errorResponse(401, "Unauthorized", headers);
  const userId = user.userId;
  if (url.pathname === "/api/notes") {
    if (method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, content, tags, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC"
      ).bind(userId).all();
      return jsonResponse(results, headers);
    }
    if (method === "POST") {
      const body = await request.json();
      const id = body.id || "scratchpad";
      const content = body.content || "";
      const tags = body.tags || "";
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
  if (url.pathname.startsWith("/api/notes/") && method === "PATCH") {
    const oldId = decodeURIComponent(url.pathname.split("/").pop());
    const body = await request.json();
    const newId = body.newId?.trim();
    if (!newId) return errorResponse(400, "newId is required", headers);
    const existing = await env.DB.prepare("SELECT id FROM notes WHERE user_id = ? AND id = ?").bind(userId, newId).first();
    if (existing) return errorResponse(409, "A note with that name already exists", headers);
    await env.DB.prepare("UPDATE notes SET id = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND id = ?").bind(newId, userId, oldId).run();
    return jsonResponse({ success: true, id: newId }, headers);
  }
  if (url.pathname.startsWith("/api/notes/") && method === "DELETE") {
    const id = decodeURIComponent(url.pathname.split("/").pop());
    await env.DB.prepare("DELETE FROM notes WHERE user_id = ? AND id = ?").bind(userId, id).run();
    return jsonResponse({ success: true }, headers);
  }
  if (url.pathname === "/api/history") {
    if (method === "GET") {
      const toolId = url.searchParams.get("tool");
      let query = "SELECT * FROM tool_history WHERE user_id = ?";
      let params = [userId];
      if (toolId) {
        query += " AND tool_id = ? ORDER BY created_at DESC LIMIT 50";
        params.push(toolId);
      } else {
        query += " ORDER BY created_at DESC LIMIT 100";
      }
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return jsonResponse(results, headers);
    }
    if (method === "POST") {
      const body = await request.json();
      if (!body.toolId || !body.payload)
        return errorResponse(400, "Missing parameters", headers);
      await env.DB.prepare(
        "INSERT INTO tool_history (user_id, tool_id, payload) VALUES (?, ?, ?)"
      ).bind(userId, body.toolId, JSON.stringify(body.payload)).run();
      return jsonResponse({ success: true }, headers);
    }
    if (method === "DELETE") {
      const toolId = url.searchParams.get("tool");
      if (toolId) {
        await env.DB.prepare("DELETE FROM tool_history WHERE user_id = ? AND tool_id = ?").bind(userId, toolId).run();
      } else {
        await env.DB.prepare("DELETE FROM tool_history WHERE user_id = ?").bind(userId).run();
      }
      return jsonResponse({ success: true }, headers);
    }
  }
  if (url.pathname === "/api/prefs") {
    if (method === "GET") {
      const key = url.searchParams.get("key");
      if (!key) return errorResponse(400, "key param required", headers);
      const row = await env.DB.prepare("SELECT value FROM user_prefs WHERE user_id = ? AND key = ?").bind(userId, key).first();
      return jsonResponse({ key, value: row ? row.value : null }, headers);
    }
    if (method === "POST") {
      const body = await request.json();
      if (!body.key) return errorResponse(400, "key is required", headers);
      await env.DB.prepare(
        `INSERT INTO user_prefs (user_id, key, value, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      ).bind(userId, body.key, body.value ?? "").run();
      return jsonResponse({ success: true }, headers);
    }
  }
  if (url.pathname === "/api/search") {
    if (method === "GET") {
      const q = url.searchParams.get("q") || "";
      const mode = url.searchParams.get("mode") || "insensitive";
      const { results: notes } = await env.DB.prepare("SELECT id, content, tags, updated_at FROM notes WHERE user_id = ?").bind(userId).all();
      const { results: history } = await env.DB.prepare(
        "SELECT tool_id, payload, created_at FROM tool_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 500"
      ).bind(userId).all();
      let matcher;
      try {
        const esc = /* @__PURE__ */ __name((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "esc");
        if (mode === "regex") matcher = new RegExp(q);
        else if (mode === "insensitive") matcher = new RegExp(esc(q), "i");
        else if (mode === "sensitive") matcher = new RegExp(esc(q));
        else if (mode === "exact") matcher = new RegExp("\\b" + esc(q) + "\\b");
      } catch (e) {
        return errorResponse(400, "Invalid regex pattern", headers);
      }
      const results = [];
      notes.forEach((n) => {
        if (matcher.test(n.id) || matcher.test(n.content) || matcher.test(n.tags || "")) {
          results.push({ type: "note", title: n.id, id: n.id, time: n.updated_at, tags: n.tags });
        }
      });
      history.forEach((h) => {
        if (matcher.test(h.tool_id) || matcher.test(h.payload)) {
          results.push({ type: "history", title: h.tool_id.replace("tile-", ""), time: h.created_at, payload: h.payload });
        }
      });
      return jsonResponse(results, headers);
    }
  }
  return errorResponse(404, "API path not found", headers);
}
__name(handleApiRequest, "handleApiRequest");
async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(exportedKey)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function generateJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Url = /* @__PURE__ */ __name((str) => btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), "base64Url");
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1e3) + 30 * 24 * 60 * 60 }));
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
__name(generateJWT, "generateJWT");
async function sign(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(sign, "sign");
async function verifyJWT(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const msg = `${header}.${payload}`;
  const validSignature = await sign(msg, secret);
  if (signature !== validSignature) return null;
  const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  if (decodedPayload.exp && Date.now() / 1e3 > decodedPayload.exp) return null;
  return decodedPayload;
}
__name(verifyJWT, "verifyJWT");
async function authenticate(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  return await verifyJWT(token, env.JWT_SECRET || "fallback_secret");
}
__name(authenticate, "authenticate");
function jsonResponse(data, headers) {
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", ...headers } });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(status, message, headers) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { "Content-Type": "application/json", ...headers } });
}
__name(errorResponse, "errorResponse");

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-UV0SIx/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-UV0SIx/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
