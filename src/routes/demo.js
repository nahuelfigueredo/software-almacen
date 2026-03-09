const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const RESET_DELAY_MS = 2000;

// Solo permitir en modo demo
router.use((req, res, next) => {
  if (process.env.DEMO_MODE !== 'true') {
    return res.status(404).json({ error: 'Demo mode not enabled' });
  }
  next();
});

// POST /api/demo/reset
router.post('/reset', (req, res) => {
  try {
    const dbPath = path.join(__dirname, '../../data/almacen.db');

    // Borrar BD
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (fs.existsSync(dbPath + '-shm')) {
      fs.unlinkSync(dbPath + '-shm');
    }
    if (fs.existsSync(dbPath + '-wal')) {
      fs.unlinkSync(dbPath + '-wal');
    }

    // Reiniciar servidor para recrear BD
    res.json({
      success: true,
      message: 'Base de datos reseteada. Reinicia el servidor para aplicar cambios.'
    });

    // Auto-reiniciar después de RESET_DELAY_MS
    setTimeout(() => {
      process.exit(0);
    }, RESET_DELAY_MS);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/demo/info
router.get('/info', (req, res) => {
  res.json({
    demoMode: true,
    autoResetHours: process.env.DEMO_AUTO_RESET_HOURS || 24,
    bannerEnabled: process.env.DEMO_BANNER_ENABLED !== 'false'
  });
});

module.exports = router;
