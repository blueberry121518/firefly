import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

// Initialize app first
const app = new Hono();

// Basic startup logging
console.log("🚀 FireFly Backend Server Starting...");

// Import KV store with error handling
let kv: any;
try {
  const kvModule = await import("./kv_store.tsx");
  kv = kvModule;
  console.log("✅ KV Store imported successfully");
} catch (error) {
  console.error("❌ KV Store import failed:", error.message);
  // Continue without KV store for basic health checks
}

// Enable request logging
app.use('*', logger());

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Client-Info", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: false,
  }),
);

// Global error handler
app.onError((err, c) => {
  console.error("🚨 Server error:", err.message);
  return c.json({
    success: false,
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  }, 500);
});

// Root endpoint - basic connectivity test
app.get("/", (c) => {
  console.log("🏠 Root endpoint accessed");
  return c.json({ 
    message: "FireFly Backend Server",
    status: "online",
    success: true,
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Simple ping endpoint
app.get("/ping", (c) => {
  console.log("🏓 Ping endpoint accessed");
  return c.json({ 
    ping: "pong",
    success: true,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (c) => {
  console.log("🏥 Health check endpoint accessed");
  return c.json({ 
    status: "ok", 
    success: true,
    timestamp: new Date().toISOString(),
    server: "firefly-backend"
  });
});

// Direct health check endpoint
app.get("/make-server-39781649/health", (c) => {
  console.log("🏥 Direct health check accessed");
  return c.json({ 
    status: "ok", 
    success: true,
    timestamp: new Date().toISOString(),
    method: "DIRECT_GET",
    server: "firefly-backend"
  });
});

// Handle frontend POST requests with routing
app.post("/", async (c) => {
  try {
    console.log("📨 POST request received");
    
    let body: any;
    try {
      body = await c.req.json();
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      return c.json({
        success: false,
        error: "Invalid JSON in request body",
        timestamp: new Date().toISOString()
      }, 400);
    }
    
    const { path, method } = body;
    console.log(`🔀 Routing: ${method} ${path}`);
    
    if (!path || !method) {
      return c.json({
        success: false,
        error: "Missing 'path' or 'method' in request body",
        timestamp: new Date().toISOString()
      }, 400);
    }

    // Handle health check via POST routing
    if (method === 'GET' && path === '/make-server-39781649/health') {
      console.log('🏥 Health check via POST routing');
      return c.json({ 
        status: "ok", 
        success: true, 
        timestamp: new Date().toISOString(),
        method: "POST_ROUTED",
        server: "firefly-backend"
      });
    }
    
    // Handle ping via POST routing
    if (method === 'GET' && path === '/ping') {
      console.log('🏓 Ping via POST routing');
      return c.json({ 
        ping: "pong", 
        success: true, 
        timestamp: new Date().toISOString(),
        method: "POST_ROUTED"
      });
    }
    
    // Handle incidents endpoint (requires KV store)
    if (method === 'GET' && path === '/make-server-39781649/incidents') {
      return await handleGetActiveIncidents(c);
    }
    
    if (method === 'GET' && path === '/make-server-39781649/incidents/completed') {
      return await handleGetCompletedIncidents(c);
    }
    
    if (method === 'GET' && path === '/make-server-39781649/stats') {
      return await handleGetStats(c);
    }
    
    // Route not found
    console.warn(`❓ Route not found: ${method} ${path}`);
    return c.json({ 
      success: false, 
      error: `Route not found: ${method} ${path}`,
      available_routes: [
        'GET /make-server-39781649/health',
        'GET /ping',
        'GET /make-server-39781649/incidents',
        'GET /make-server-39781649/stats'
      ],
      timestamp: new Date().toISOString()
    }, 404);
    
  } catch (error) {
    console.error('❌ POST handler error:', error.message);
    return c.json({ 
      success: false, 
      error: error.message || 'Server error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Helper functions for KV operations
async function handleGetActiveIncidents(c: any) {
  try {
    console.log("📊 Fetching active incidents");
    
    if (!kv) {
      return c.json({
        success: false,
        error: "KV store not available",
        incidents: [],
        count: 0
      }, 503);
    }
    
    const incidentKeys = await kv.getByPrefix("incident:");
    const incidents = [];
    
    for (const item of incidentKeys) {
      try {
        const incidentData = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
        incidents.push(incidentData);
      } catch (parseError) {
        console.error(`❌ Parse error for ${item.key}:`, parseError.message);
      }
    }
    
    console.log(`✅ Found ${incidents.length} active incidents`);
    
    return c.json({
      success: true,
      incidents,
      count: incidents.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Get incidents error:", error.message);
    return c.json({
      success: false,
      error: error.message,
      incidents: [],
      count: 0
    }, 500);
  }
}

async function handleGetCompletedIncidents(c: any) {
  try {
    console.log("📊 Fetching completed incidents");
    
    if (!kv) {
      return c.json({
        success: true,
        incidents: [],
        count: 0
      });
    }
    
    const completedIds = await kv.get("incidents:completed") || [];
    const incidents = [];
    
    for (const id of completedIds.slice(0, 10)) {
      try {
        const incidentData = await kv.get(`incident:${id}`);
        if (incidentData) {
          const parsed = typeof incidentData === 'string' ? JSON.parse(incidentData) : incidentData;
          if (parsed.status === 'completed') {
            incidents.push(parsed);
          }
        }
      } catch (parseError) {
        console.error(`❌ Parse completed incident ${id}:`, parseError.message);
      }
    }
    
    return c.json({
      success: true,
      incidents,
      count: incidents.length
    });
    
  } catch (error) {
    console.error("❌ Get completed incidents error:", error.message);
    return c.json({
      success: false,
      error: error.message,
      incidents: [],
      count: 0
    }, 500);
  }
}

async function handleGetStats(c: any) {
  try {
    console.log("📊 Fetching system stats");
    
    const stats = {
      total_incidents_today: 42,
      active_incidents: 3,
      completed_incidents: 39,
      average_processing_time: 45.2,
      system_uptime: 99.97,
      agents_online: 7,
      last_updated: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error("❌ Get stats error:", error.message);
    return c.json({
      success: false,
      error: error.message,
      stats: {}
    }, 500);
  }
}

// Server startup
console.log("🌐 Starting Deno server...");

// Start server with error handling
Deno.serve({
  onListen: ({ hostname, port }) => {
    console.log(`✅ FireFly Backend Server listening on http://${hostname}:${port}`);
    console.log("🚀 Server ready to handle requests");
  },
  onError: (error) => {
    console.error("❌ Server startup error:", error.message);
    return new Response("Server Error", { status: 500 });
  }
}, app.fetch);