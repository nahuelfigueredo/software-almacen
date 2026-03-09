const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DEMO_MODE = process.env.DEMO_MODE === 'true';
const DATA_DIR = path.join(__dirname, '../../../data');

// POST /api/demo/reset
router.post('/reset', (req, res) => {
  if (!DEMO_MODE) {
    return res.status(403).json({
      success: false,
      message: 'Demo mode no está habilitado'
    });
  }

  try {
    const dbPath = path.join(DATA_DIR, 'almacen.db');

    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    const shmPath = dbPath + '-shm';
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }

    const walPath = dbPath + '-wal';
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }

    res.json({
      success: true,
      message: 'Base de datos reseteada. Reinicie el servidor para aplicar cambios.'
    });

    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => process.exit(0), 1000);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/demo/status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    demoMode: DEMO_MODE
  });
});

module.exports = router;
