var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
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
  if (url.pathname === "/api/notes") {
    if (method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM notes ORDER BY updated_at DESC").all();
      return jsonResponse(results, headers);
    }
    if (method === "POST") {
      const body = await request.json();
      const id = body.id || "scratchpad";
      const content = body.content || "";
      await env.DB.prepare(
        "INSERT INTO notes (id, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET content=excluded.content, updated_at=CURRENT_TIMESTAMP"
      ).bind(id, content).run();
      return jsonResponse({ success: true, id }, headers);
    }
  }
  if (url.pathname.startsWith("/api/notes/") && method === "DELETE") {
    const id = url.pathname.split("/").pop();
    await env.DB.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
    return jsonResponse({ success: true }, headers);
  }
  if (url.pathname === "/api/history") {
    if (method === "GET") {
      const toolId = url.searchParams.get("tool");
      let query = "SELECT * FROM tool_history";
      let params = [];
      if (toolId) {
        query += " WHERE tool_id = ? ORDER BY created_at DESC LIMIT 50";
        params.push(toolId);
      } else {
        query += " ORDER BY created_at DESC LIMIT 100";
      }
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return jsonResponse(results, headers);
    }
    if (method === "POST") {
      const body = await request.json();
      if (!body.toolId || !body.payload) return errorResponse(400, "Missing parameters", headers);
      await env.DB.prepare(
        "INSERT INTO tool_history (tool_id, payload) VALUES (?, ?)"
      ).bind(body.toolId, JSON.stringify(body.payload)).run();
      return jsonResponse({ success: true }, headers);
    }
    if (method === "DELETE") {
      const toolId = url.searchParams.get("tool");
      if (toolId) {
        await env.DB.prepare("DELETE FROM tool_history WHERE tool_id = ?").bind(toolId).run();
      } else {
        await env.DB.prepare("DELETE FROM tool_history").run();
      }
      return jsonResponse({ success: true }, headers);
    }
  }
  if (url.pathname === "/api/search") {
    if (method === "GET") {
      const q = url.searchParams.get("q") || "";
      const mode = url.searchParams.get("mode") || "insensitive";
      const { results: notes } = await env.DB.prepare("SELECT id, content FROM notes").all();
      const { results: history } = await env.DB.prepare("SELECT tool_id, payload, created_at FROM tool_history ORDER BY created_at DESC LIMIT 500").all();
      let matcher;
      try {
        const escapeRegExp = /* @__PURE__ */ __name((str) => str.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "escapeRegExp");
        if (mode === "regex") matcher = new RegExp(q);
        else if (mode === "insensitive") matcher = new RegExp(escapeRegExp(q), "i");
        else if (mode === "sensitive") matcher = new RegExp(escapeRegExp(q));
        else if (mode === "exact") matcher = new RegExp("\\\\b" + escapeRegExp(q) + "\\\\b");
      } catch (e) {
        return errorResponse(400, "Invalid regex pattern", headers);
      }
      const results = [];
      notes.forEach((n) => {
        if (matcher.test(n.id) || matcher.test(n.content)) {
          results.push({ type: "note", title: n.id, id: n.id, time: n.updated_at });
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
function jsonResponse(data, headers) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...headers }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(status, message, headers) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
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

// .wrangler/tmp/bundle-mWqAW6/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
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

// .wrangler/tmp/bundle-mWqAW6/middleware-loader.entry.ts
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
