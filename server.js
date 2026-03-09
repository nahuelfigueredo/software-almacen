const express = require("express");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const { authenticate, authorize } = require("./src/middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== BASE DE DATOS SQLITE ======
require("./src/database/init");

// ====== RATE LIMITING ======
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 200,            // máximo 200 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes, intente de nuevo en un minuto." }
});
app.use("/api/", apiLimiter);

// ====== AUTH ROUTES (sin middleware de autenticación) ======
app.use("/api/auth", require("./src/routes/auth"));

// ====== MIDDLEWARE DE AUTENTICACIÓN PARA RUTAS API ======
app.use("/api/", authenticate);

// ====== API ROUTES ======
app.use("/api/products", require("./src/routes/products"));
app.use("/api/sales",    require("./src/routes/sales"));
app.use("/api/users",    authorize("admin", "owner"), require("./src/routes/users"));
app.use("/api/stock",    require("./src/routes/stock"));
app.use("/api/reports",  authorize("admin", "owner"), require("./src/routes/reports"));

// ====== DEMO TRACKING (MVP) ======
const ADMIN_KEY = process.env.DEMO_ADMIN_KEY || "mcndigitalstudio";
if (!process.env.DEMO_ADMIN_KEY) {
  console.warn("ADVERTENCIA: DEMO_ADMIN_KEY no está definida. Usar variable de entorno en producción.");
}
const LOG_FILE = path.join(__dirname, "demo-logins.jsonl");

function appendJSONL(obj) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(obj) + "\n", "utf8");
}

app.post("/api/track/login", (req, res) => {
  try {
    const { prospectId, role, name } = req.body || {};
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.socket.remoteAddress;

    const event = {
      t: new Date().toISOString(),
      type: "login",
      prospectId: String(prospectId || "unknown"),
      role: String(role || "unknown"),
      name: String(name || "unknown"),
      ip,
      ua: req.headers["user-agent"] || ""
    };

    appendJSONL(event);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: "track_failed" });
  }
});

app.get("/admin/demo-stats", (req, res) => {
  const key = req.query.key;
  if (key !== ADMIN_KEY) return res.status(401).send("Unauthorized");

  if (!fs.existsSync(LOG_FILE)) {
    return res.json({ ok: true, total: 0, byProspect: {}, last10: [] });
  }

  const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n").filter(Boolean);
  const events = lines.map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);

  const byProspect = {};
  events.forEach((ev) => {
    const pid = ev.prospectId || "unknown";
    byProspect[pid] = (byProspect[pid] || 0) + 1;
  });

  const last10 = events.slice(-10).reverse();

  res.json({
    ok: true,
    total: events.length,
    byProspect,
    last10
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🎨 MCN Digital Studio - Sistema de Caja`);
});
