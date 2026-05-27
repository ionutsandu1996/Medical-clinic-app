const router = require('express').Router();
const pool = require('../config/db');

// GET /api/specializations - returneaza toate specializarile
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM specializations ORDER BY name ASC'
    );
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;